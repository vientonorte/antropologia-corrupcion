import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateRegistrationOptionsOpts,
  type VerifyRegistrationResponseOpts,
  type GenerateAuthenticationOptionsOpts,
  type VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server';

const rpID = process.env.PASSKEY_RP_ID || 'localhost';
const rpName = process.env.PASSKEY_RP_NAME || 'Contra-archivo Terraza';

export async function createRegistrationOptions(userName: string) {
  const options = await generateRegistrationOptions({
    rpID,
    rpName,
    userName,
    userDisplayName: userName,
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'preferred',
      userVerification: 'preferred',
    },
    attestationType: 'none',
    timeout: 60000,
  } as GenerateRegistrationOptionsOpts);

  return options;
}

export async function verifyRegistration(
  options: VerifyRegistrationResponseOpts,
) {
  try {
    const verification = await verifyRegistrationResponse(options);
    return verification;
  } catch (error) {
    throw new Error(
      `Registration verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function createAuthenticationOptions() {
  const options = await generateAuthenticationOptions({
    rpID,
    timeout: 60000,
    userVerification: 'preferred',
  } as GenerateAuthenticationOptionsOpts);

  return options;
}

export async function verifyAuthentication(
  options: VerifyAuthenticationResponseOpts,
) {
  try {
    const verification = await verifyAuthenticationResponse(options);
    return verification;
  } catch (error) {
    throw new Error(
      `Authentication verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
