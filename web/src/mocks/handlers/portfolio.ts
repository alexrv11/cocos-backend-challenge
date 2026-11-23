import { http, HttpResponse } from 'msw';

export const portfolioHandlers = [
  http.get('/api/portfolio', () => {
    return HttpResponse.json({
      totalAccountValue: 4_075_375,
      availableCash: 1_250_000,
      positions: [
        { instrumentId: 1, ticker: 'GGAL', name: 'Grupo Financiero Galicia', quantity: 150, lastPrice: 6512.50, totalValue: 976_875, returnPercentage: 5.04 },
        { instrumentId: 2, ticker: 'YPFD', name: 'YPF S.A.', quantity: 25, lastPrice: 38420, totalValue: 960_500, returnPercentage: 5.26 },
        { instrumentId: 4, ticker: 'AL30', name: 'BONOS ARGENTINA USD 2030 L.A', quantity: 10, lastPrice: 71850, totalValue: 718_500, returnPercentage: 4.13 },
        { instrumentId: 6, ticker: 'AAPL', name: 'Apple Inc. (CEDEAR)', quantity: 50, lastPrice: 12500, totalValue: 625_000, returnPercentage: 5.93 },
      ],
    });
  }),
];
