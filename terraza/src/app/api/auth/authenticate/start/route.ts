import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticationOptions } from '@/lib/auth/passkey';

export async function POST(request: NextRequest) {
  try {
    await request.json(); // Validate request has valid JSON body

    const options = await createAuthenticationOptions();

    return NextResponse.json(options);
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
