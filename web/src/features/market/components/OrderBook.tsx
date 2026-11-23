import { useOrderBook } from '../hooks/useOrderBook';
import { formatARS } from '../../../shared/lib/format';

interface Props {
  instrumentId: number;
  basePrice: number;
  ticker: string;
}

export default function OrderBook({ instrumentId, basePrice, ticker }: Props) {
  const book = useOrderBook(instrumentId, basePrice);

  if (!book) {
    return (
      <div className="border border-border rounded-2xl p-5 h-full flex items-center justify-center text-text-secondary text-sm">
        Cargando libro de ordenes...
      </div>
    );
  }

  const maxBidSize = Math.max(...book.bids.map((l) => l.size));
  const maxAskSize = Math.max(...book.asks.map((l) => l.size));
  const maxSize = Math.max(maxBidSize, maxAskSize);

  return (
    <div className="border border-border rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Libro de ordenes</h3>
        <span className="text-xs text-text-secondary">{ticker}</span>
      </div>

      <div className="flex flex-col gap-0.5">
        <div className="grid grid-cols-[1fr_80px_80px] text-[11px] text-text-secondary font-medium px-2 pb-1">
          <span>Precio</span>
          <span className="text-right">Cantidad</span>
          <span className="text-right">Total</span>
        </div>

        {[...book.asks].reverse().map((level, i) => {
          const depthPercent = (level.size / maxSize) * 100;
          return (
            <div
              key={`ask-${i}`}
              className="relative grid grid-cols-[1fr_80px_80px] text-xs tabular-nums px-2 py-1 rounded"
            >
              <div
                className="absolute inset-y-0 right-0 bg-danger/8 rounded transition-all duration-300"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="relative text-danger font-medium">
                {formatARS(level.price)}
              </span>
              <span className="relative text-right">{level.size.toLocaleString('es-AR')}</span>
              <span className="relative text-right text-text-secondary">
                {formatARS(level.price * level.size)}
              </span>
            </div>
          );
        })}

        <div className="flex items-center justify-center gap-2 py-2 my-1 border-y border-border">
          <span className="text-xs font-semibold">
            Spread: {formatARS(book.spread)}
          </span>
          <span className="text-[11px] text-text-secondary">
            ({book.spreadPercent.toFixed(3)}%)
          </span>
        </div>

        {book.bids.map((level, i) => {
          const depthPercent = (level.size / maxSize) * 100;
          return (
            <div
              key={`bid-${i}`}
              className="relative grid grid-cols-[1fr_80px_80px] text-xs tabular-nums px-2 py-1 rounded"
            >
              <div
                className="absolute inset-y-0 right-0 bg-success/8 rounded transition-all duration-300"
                style={{ width: `${depthPercent}%` }}
              />
              <span className="relative text-success font-medium">
                {formatARS(level.price)}
              </span>
              <span className="relative text-right">{level.size.toLocaleString('es-AR')}</span>
              <span className="relative text-right text-text-secondary">
                {formatARS(level.price * level.size)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
