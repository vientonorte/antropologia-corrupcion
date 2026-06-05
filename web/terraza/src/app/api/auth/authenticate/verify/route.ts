import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthentication } from '@/lib/auth/passkey';
import { AuthenticationVerifySchema } from '@/lib/auth/schemas';
import { createSession } from '@/lib/auth/session';
import { getCredentialByUserId, updateCredentialCounter } from '@/lib/db/credentials';
import { getChallenge, deleteChallenge } from '@/lib/db/challenges';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assertionResponse = AuthenticationVerifySchema.parse(body);
    const { challengeId, userId } = body;

    if (!challengeId || !userId) {
      return NextResponse.json(
        { error: 'Challenge ID or User ID missing' },
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

    const credential = getCredentialByUserId(userId);
    if (!credential) {
      deleteChallenge(challengeId);
      return NextResponse.json(
        { error: 'User credentials not found' },
        { status: 400 },
      );
    }

    const verification = await verifyAuthentication({
      response: {
        ...assertionResponse,
        clientExtensionResults: {},
      },
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      expectedRPID: process.env.PASSKEY_RP_ID || 'localhost',
      authenticator: {
        credentialID: new Uint8Array(credential.credentialId),
        credentialPublicKey: new Uint8Array(credential.credentialPublicKey),
        counter: credential.counter,
        transports: credential.transports
          ? (JSON.parse(credential.transports) as AuthenticatorTransport[])
          : [],
      },
    });

    if (!verification.verified) {
      deleteChallenge(challengeId);
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Update counter to prevent replay attacks
    if (verification.authenticationInfo?.newCounter !== undefined) {
      updateCredentialCounter(userId, verification.authenticationInfo.newCounter);
    }

    // Create session for authenticated user
    await createSession({
      userId,
      userName: credential.userName,
      createdAt: Date.now(),
    });

    // Clean up challenge
    deleteChallenge(challengeId);

    return NextResponse.json({ verified: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to verify authentication',
      },
      { status: 400 },
    );
  }
}
