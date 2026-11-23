import type { InstrumentWithMarket } from '../hooks/useInstruments';
import { useMarketStream } from '../hooks/useMarketStream';
import { formatARS, formatPercent } from '../../../shared/lib/format';

interface Props {
  instrument: InstrumentWithMarket;
  selected: boolean;
  onClick: () => void;
}

export default function InstrumentCard({ instrument, selected, onClick }: Props) {
  const basePrice = instrument.lastPrice;
  const live = useMarketStream(instrument.id, basePrice);

  const price = live?.price ?? basePrice ?? 0;
  const changePercent = instrument.dailyReturn ?? live?.change ?? 0;
  const isPositive = changePercent >= 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all
        ${selected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-white'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EEF3FF] text-primary flex items-center justify-center text-xs font-bold shrink-0">
            {instrument.ticker.slice(0, 4)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold truncate">
              {instrument.name}
            </span>
            <span className="text-xs text-text-secondary">
              {instrument.ticker} &middot; {instrument.type}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end tabular-nums shrink-0 ml-3">
          <span className="text-sm font-semibold">{formatARS(price)}</span>
          <span
            className={`text-xs font-semibold ${isPositive ? 'text-success' : 'text-danger'}`}
          >
            {isPositive ? '\u25B2' : '\u25BC'} {formatPercent(changePercent)}
          </span>
        </div>
      </div>
    </button>
  );
}
