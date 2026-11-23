import { http, HttpResponse } from 'msw';
import { instruments, generateMarketData, generateCandles } from '../data';

const marketData = generateMarketData();

export const instrumentHandlers = [
  http.get('/api/instruments/search', ({ request }) => {
    const url = new URL(request.url);
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    const limit = Number(url.searchParams.get('limit') ?? '20');
    const offset = Number(url.searchParams.get('offset') ?? '0');

    let results = instruments;
    if (q) {
      results = instruments.filter(
        (i) =>
          i.ticker.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q),
      );
    }

    const enriched = results.map((inst) => {
      const md = marketData.find((m) => m.instrumentId === inst.id);
      const lastPrice = md?.close ?? null;
      const previousClose = md?.previousClose ?? null;
      const dailyReturn =
        lastPrice != null && previousClose != null && previousClose > 0
          ? +((((lastPrice - previousClose) / previousClose) * 100).toFixed(2))
          : null;

      return {
        id: inst.id,
        ticker: inst.ticker,
        name: inst.name,
        type: inst.type,
        lastPrice,
        previousClose,
        dailyReturn,
      };
    });

    return HttpResponse.json({
      data: enriched.slice(offset, offset + limit),
      total: enriched.length,
    });
  }),

  http.get('/api/instruments/:id/candles', ({ params }) => {
    const id = Number(params.id);
    const candles = generateCandles(id, 90);
    return HttpResponse.json(candles);
  }),
];
