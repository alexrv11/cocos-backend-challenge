import { http, HttpResponse } from 'msw';

let orderId = 100;

export const orderHandlers = [
  http.post('/api/orders', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const id = orderId++;
    return HttpResponse.json(
      {
        id,
        ...body,
        status: body.type === 'MARKET' ? 'FILLED' : 'NEW',
        datetime: new Date().toISOString(),
      },
      { status: 201 },
    );
  }),

  http.patch('/api/orders/:orderId/cancel', ({ params }) => {
    return HttpResponse.json({
      id: Number(params.orderId),
      status: 'CANCELLED',
    });
  }),
];
