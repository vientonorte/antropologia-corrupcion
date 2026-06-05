import { NextRequest, NextResponse } from 'next/server';
import { createRegistrationOptions } from '@/lib/auth/passkey';
import { AddDeviceStartSchema } from '@/lib/auth/schemas';
import { getSession } from '@/lib/auth/session';
import { createChallenge } from '@/lib/db/challenges';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    AddDeviceStartSchema.parse(body);

    const options = await createRegistrationOptions(session.userName);

    const challenge = createChallenge(
      options.challenge,
      'registration',
      session.userId,
    );

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
            : 'No se pudo iniciar el registro de dispositivo',
      },
      { status: 400 },
    );
  }
}
