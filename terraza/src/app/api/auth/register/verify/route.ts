import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistration } from '@/lib/auth/passkey';
import { RegistrationVerifySchema } from '@/lib/auth/schemas';
import { createSession } from '@/lib/auth/session';
import { createCredential } from '@/lib/db/credentials';
import { getChallenge, deleteChallenge } from '@/lib/db/challenges';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, attestationObject, clientDataJSON } =
      RegistrationVerifySchema.parse(body);

    // challengeId should be provided by client to retrieve the stored challenge
    const { challengeId } = body;
    if (!challengeId) {
      return NextResponse.json(
        { error: 'Challenge ID missing' },
        { status: 400 },
      );
    }

    const storedChallenge = getChallenge(challengeId);
    if (!storedChallenge) {
      return NextResponse.json(
        { error: 'Challenge expired or invalid' },
        { status: 400 },
      );
    }

    const verification = await verifyRegistration({
      response: {
        id: '',
        rawId: attestationObject,
        response: {
          clientDataJSON,
          attestationObject,
          transports: [],
        },
        type: 'public-key',
        clientExtensionResults: {},
      },
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      expectedRPID: process.env.PASSKEY_RP_ID || 'localhost',
    });

    if (!verification.verified) {
      deleteChallenge(challengeId);
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Store credential in database
    const credential = createCredential(
      userName,
      verification.registrationInfo?.credentialID || new Uint8Array(),
      verification.registrationInfo?.credentialPublicKey || new Uint8Array(),
      (
        verification.registrationInfo?.credentialDeviceType === 'multiDevice'
          ? ['internal']
          : ['platform']
      ) as AuthenticatorTransport[],
    );

    // Create session for user
    await createSession({
      userId: credential.userId,
      userName,
      createdAt: Date.now(),
    });

    // Clean up challenge
    deleteChallenge(challengeId);

    return NextResponse.json({ verified: true, userId: credential.userId });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to verify registration',
      },
      { status: 400 },
    );
  }
}
