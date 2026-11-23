import { z } from 'zod';

export const orderSchema = z
  .object({
    instrumentId: z.number({ error: 'Selecciona un instrumento' }).int().positive(),
    side: z.enum(['BUY', 'SELL'], { error: 'Selecciona compra o venta' }),
    type: z.enum(['MARKET', 'LIMIT'], { error: 'Selecciona tipo de orden' }),
    quantity: z
      .number({ error: 'Ingresa la cantidad' })
      .int('La cantidad debe ser un numero entero')
      .positive('La cantidad debe ser mayor a 0'),
    price: z.number().positive('El precio debe ser mayor a 0').optional(),
  })
  .refine(
    (data) => data.type !== 'LIMIT' || (data.price !== undefined && data.price > 0),
    { message: 'El precio limite es obligatorio', path: ['price'] },
  );

export type OrderFormData = z.infer<typeof orderSchema>;
