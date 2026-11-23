import { http, HttpResponse } from 'msw';

let nextId = 2;

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'test@test.com' && body.password === 'Test1234') {
      return HttpResponse.json({
        access_token: 'mock-jwt-token',
        userId: 1,
        email: body.email,
        accountNumber: 'ACC-00001',
      });
    }
    return HttpResponse.json(
      { message: 'Credenciales invalidas' },
      { status: 401 },
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    const id = nextId++;
    return HttpResponse.json(
      {
        access_token: 'mock-jwt-token-new',
        userId: id,
        email: body.email,
        accountNumber: `ACC-${String(id).padStart(5, '0')}`,
      },
      { status: 201 },
    );
  }),
];
