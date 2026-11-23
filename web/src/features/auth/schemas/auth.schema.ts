import { z } from 'zod';

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
