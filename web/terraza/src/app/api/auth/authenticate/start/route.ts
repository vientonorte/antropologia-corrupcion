import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticationOptions } from '@/lib/auth/passkey';
import { createChallenge } from '@/lib/db/challenges';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Validate request has valid JSON body

    const options = await createAuthenticationOptions();

    // Store challenge in database for later verification
    const challenge = createChallenge(
      options.challenge,
      'authentication',
      undefined,
    );

    // Return options with challenge ID for client to track
    return NextResponse.json({
      ...options,
      challengeId: challenge.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start authentication',
      },
      { status: 400 },
    );
  }
}
