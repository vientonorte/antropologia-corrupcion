import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistration } from '@/lib/auth/passkey';
import { AddDeviceVerifySchema } from '@/lib/auth/schemas';
import { getSession } from '@/lib/auth/session';
import {
  getCredentialByUserId,
  replaceCredentialForUser,
} from '@/lib/db/credentials';
import { deleteChallenge, getChallenge } from '@/lib/db/challenges';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const registrationResponse = AddDeviceVerifySchema.parse(body);

    const storedChallenge = getChallenge(registrationResponse.challengeId);
    if (!storedChallenge || storedChallenge.userId !== session.userId) {
      return NextResponse.json(
        { error: 'Challenge inválido o expirado' },
        { status: 400 },
      );
    }

    const existingCredential = getCredentialByUserId(session.userId);
    if (!existingCredential) {
      deleteChallenge(registrationResponse.challengeId);
      return NextResponse.json(
        { error: 'No existe credencial base para el usuario autenticado' },
        { status: 400 },
      );
    }

    const verification = await verifyRegistration({
      response: {
        id: registrationResponse.id,
        rawId: registrationResponse.rawId,
        response: {
          clientDataJSON: registrationResponse.response.clientDataJSON,
          attestationObject: registrationResponse.response.attestationObject,
          transports: registrationResponse.response.transports ?? [],
        },
        type: registrationResponse.type,
        clientExtensionResults: {},
      },
      expectedChallenge: storedChallenge.challenge,
      expectedOrigin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      expectedRPID: process.env.PASSKEY_RP_ID || 'localhost',
    });

    if (!verification.verified || !verification.registrationInfo) {
      deleteChallenge(registrationResponse.challengeId);
      return NextResponse.json({ error: 'Verificación fallida' }, { status: 400 });
    }

    replaceCredentialForUser(
      session.userId,
      session.userName,
      verification.registrationInfo.credentialID,
      verification.registrationInfo.credentialPublicKey,
      registrationResponse.response.transports ?? [],
    );

    deleteChallenge(registrationResponse.challengeId);

    return NextResponse.json({ verified: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'No se pudo verificar el nuevo dispositivo',
      },
      { status: 400 },
    );
  }
}
