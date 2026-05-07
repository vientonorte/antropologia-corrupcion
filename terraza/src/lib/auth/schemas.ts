import { z } from 'zod';

export const RegistrationStartSchema = z.object({
  userName: z
    .string()
    .min(3, 'Usuario debe tener al menos 3 caracteres')
    .max(100, 'Usuario debe tener máximo 100 caracteres')
    .regex(/^[a-zA-Z0-9._-]+$/, 'Usuario solo puede contener letras, números y guiones'),
});

export const RegistrationVerifySchema = z.object({
  userName: z.string(),
  attestationObject: z.string(),
  clientDataJSON: z.string(),
});

export const AuthenticationStartSchema = z.object({
  // Empty object - no parameters needed
});

export const AuthenticationVerifySchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: z.object({
    clientDataJSON: z.string(),
    authenticatorData: z.string(),
    signature: z.string(),
  }),
  type: z.literal('public-key'),
});

export const AddDeviceStartSchema = z.object({});

export const AddDeviceVerifySchema = z.object({
  id: z.string().min(1),
  rawId: z.string().min(1),
  response: z.object({
    clientDataJSON: z.string().min(1),
    attestationObject: z.string().min(1),
    transports: z
      .array(z.enum(['usb', 'nfc', 'ble', 'internal', 'hybrid']))
      .optional(),
  }),
  type: z.literal('public-key'),
  challengeId: z.string().uuid(),
});

export type RegistrationStart = z.infer<typeof RegistrationStartSchema>;
export type RegistrationVerify = z.infer<typeof RegistrationVerifySchema>;
export type AuthenticationStart = z.infer<typeof AuthenticationStartSchema>;
export type AuthenticationVerify = z.infer<typeof AuthenticationVerifySchema>;
export type AddDeviceStart = z.infer<typeof AddDeviceStartSchema>;
export type AddDeviceVerify = z.infer<typeof AddDeviceVerifySchema>;
