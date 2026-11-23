import { z } from 'zod';

const CUIL_WEIGHTS = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
const CUIL_VALID_PREFIXES = ['20', '23', '24', '27', '30', '33', '34'];

function isValidCuil(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 11) return false;

  const prefix = digits.slice(0, 2);
  if (!CUIL_VALID_PREFIXES.includes(prefix)) return false;

  const sum = CUIL_WEIGHTS.reduce(
    (acc, w, i) => acc + w * Number(digits[i]),
    0,
  );
  const remainder = sum % 11;
  let expected: number;
  if (remainder === 0) expected = 0;
  else if (remainder === 1) expected = prefix === '23' ? 9 : 4;
  else expected = 11 - remainder;

  return Number(digits[10]) === expected;
}

export function formatCuil(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es obligatorio')
    .max(50, 'Máximo 50 caracteres'),
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Email inválido'),
  cuil: z
    .string()
    .min(1, 'El CUIL/CUIT es obligatorio')
    .refine(
      (val) => isValidCuil(val),
      'CUIL/CUIT inválido',
    ),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/\d/, 'Debe contener al menos un número'),
  terms: z.literal(true, {
    error: 'Debés aceptar los términos',
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
