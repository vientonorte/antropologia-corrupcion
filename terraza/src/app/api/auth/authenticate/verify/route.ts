import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthentication } from '@/lib/auth/passkey';
import { AuthenticationVerifySchema } from '@/lib/auth/schemas';
import { createSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const assertionResponse = AuthenticationVerifySchema.parse(body);

    // TODO: Retrieve credential from database
    // TODO: Get expected challenge from session/cache
    // For now, this is a placeholder that will be expanded with proper
    // credential lookup and verification in SQLite

    const verification = await verifyAuthentication({
      response: {
        ...assertionResponse,
        clientExtensionResults: {},
      },
      expectedChallenge: '', // Will come from stored session
      expectedOrigin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      expectedRPID: process.env.PASSKEY_RP_ID || 'localhost',
      authenticator: {
        credentialID: new Uint8Array(),
        credentialPublicKey: new Uint8Array(),
        counter: 0,
        transports: [],
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }

    // Create session for authenticated user
    // TODO: Look up user from credential
    await createSession({
      userId: 'placeholder-user-id',
      userName: 'Rö',
      createdAt: Date.now(),
    });

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
