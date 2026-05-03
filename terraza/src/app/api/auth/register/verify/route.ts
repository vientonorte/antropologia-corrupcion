import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistration } from '@/lib/auth/passkey';
import { RegistrationVerifySchema } from '@/lib/auth/schemas';
import { createSession } from '@/lib/auth/session';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, attestationObject, clientDataJSON } =
      RegistrationVerifySchema.parse(body);

    // TODO: Retrieve stored registration options from session/cache
    // For now, this is a placeholder that will be expanded with proper
    // credential storage in SQLite

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
      expectedChallenge: '', // Will come from stored session
      expectedOrigin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      expectedRPID: process.env.PASSKEY_RP_ID || 'localhost',
    });

    if (!verification.verified) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Create session for user
    const userId = uuidv4();
    await createSession({
      userId,
      userName,
      createdAt: Date.now(),
    });

    return NextResponse.json({ verified: true, userId });
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
