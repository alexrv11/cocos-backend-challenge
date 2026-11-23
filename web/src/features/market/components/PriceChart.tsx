import { useEffect, useRef, useCallback } from 'react';
import { createChart, CandlestickSeries, type IChartApi, type CandlestickData } from 'lightweight-charts';
import { useCandles } from '../hooks/useCandles';
import { useMarketStream } from '../hooks/useMarketStream';

interface Props {
  instrumentId: number;
  basePrice: number;
  ticker: string;
}

export default function PriceChart({ instrumentId, basePrice, ticker }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const seriesRef = useRef<any>(null);

  const { data: candles, isLoading } = useCandles(instrumentId);
  const live = useMarketStream(instrumentId, basePrice);

  const initChart = useCallback((container: HTMLDivElement | null) => {
    if (!container) return;
    containerRef.current = container;

    // Avoid re-creating if already initialized
    if (chartRef.current) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { color: '#FFFFFF' },
        textColor: '#5B616E',
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      grid: {
        vertLines: { color: '#EEF0F3' },
        horzLines: { color: '#EEF0F3' },
      },
      rightPriceScale: {
        borderColor: '#CED2DB',
      },
      timeScale: {
        borderColor: '#CED2DB',
        timeVisible: false,
      },
      crosshair: {
        vertLine: { color: '#0B57F5', width: 1, style: 2 },
        horzLine: { color: '#0B57F5', width: 1, style: 2 },
      },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#098551',
      downColor: '#D92D20',
      borderUpColor: '#098551',
      borderDownColor: '#D92D20',
      wickUpColor: '#098551',
      wickDownColor: '#D92D20',
    });

    chartRef.current = chart;
    seriesRef.current = series;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      chartRef.current?.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  // Set candle data when chart and data are both ready
  useEffect(() => {
    if (candles?.length && seriesRef.current) {
      seriesRef.current.setData(candles as CandlestickData[]);
      chartRef.current?.timeScale().fitContent();
    }
  }, [candles]);

  // Live price updates
  useEffect(() => {
    if (live && seriesRef.current && candles?.length) {
      const lastCandle = candles[candles.length - 1];
      seriesRef.current.update({
        time: lastCandle.time,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, live.price),
        low: Math.min(lastCandle.low, live.price),
        close: live.price,
      });
    }
  }, [live, candles]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">{ticker}</h3>
        <div className="h-100 flex items-center justify-center text-text-secondary">
          Cargando grafico...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">{ticker}</h3>
      <div ref={initChart} className="h-100 rounded-xl border border-border overflow-hidden" />
    </div>
  );
}
