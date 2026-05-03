import { NextRequest, NextResponse } from 'next/server';
import { createRegistrationOptions } from '@/lib/auth/passkey';
import { RegistrationStartSchema } from '@/lib/auth/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName } = RegistrationStartSchema.parse(body);

    const options = await createRegistrationOptions(userName);

    return NextResponse.json(options);
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
