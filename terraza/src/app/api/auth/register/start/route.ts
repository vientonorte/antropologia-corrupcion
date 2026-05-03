import { NextRequest, NextResponse } from 'next/server';
import { createRegistrationOptions } from '@/lib/auth/passkey';
import { RegistrationStartSchema } from '@/lib/auth/schemas';
import { createChallenge } from '@/lib/db/challenges';
import { userExists } from '@/lib/db/credentials';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName } = RegistrationStartSchema.parse(body);

    // Check if user already exists
    if (userExists(userName)) {
      return NextResponse.json(
        { error: 'Usuario ya existe' },
        { status: 400 },
      );
    }

    const options = await createRegistrationOptions(userName);

    // Store challenge in database for later verification
    const challenge = createChallenge(
      options.challenge,
      'registration',
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
          error instanceof Error ? error.message : 'Failed to start registration',
      },
      { status: 400 },
    );
  }
}
