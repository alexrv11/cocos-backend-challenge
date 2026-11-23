import { http, HttpResponse } from 'msw';

export const portfolioHandlers = [
  http.get('/api/portfolio', () => {
    return HttpResponse.json({
      cashARS: 1_250_000,
      positions: [
        { instrumentId: 1, ticker: 'GGAL', name: 'Grupo Financiero Galicia', type: 'Acciones', quantity: 150, avgPrice: 6200, currentPrice: 6512.50 },
        { instrumentId: 2, ticker: 'YPFD', name: 'YPF S.A.', type: 'Acciones', quantity: 25, avgPrice: 36500, currentPrice: 38420 },
        { instrumentId: 4, ticker: 'AL30', name: 'BONOS ARGENTINA USD 2030 L.A', type: 'Bonos', quantity: 10, avgPrice: 69000, currentPrice: 71850 },
        { instrumentId: 6, ticker: 'AAPL', name: 'Apple Inc. (CEDEAR)', type: 'CEDEAR', quantity: 50, avgPrice: 11800, currentPrice: 12500 },
      ],
      totalValueARS: 4_075_375,
    });
  }),
];
