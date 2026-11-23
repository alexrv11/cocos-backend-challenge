import { useState, useDeferredValue } from 'react';
import { useInstruments, type InstrumentWithMarket } from '../../market/hooks/useInstruments';
import { formatARS } from '../../../shared/lib/format';

interface Props {
  selected: InstrumentWithMarket | null;
  onSelect: (instrument: InstrumentWithMarket) => void;
}

export default function InstrumentPicker({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const { data } = useInstruments(deferredQuery);

  if (selected && !open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 p-3 rounded-xl border border-border hover:border-primary/40 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-full bg-[#EEF3FF] text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
          {selected.ticker.slice(0, 4)}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-sm font-semibold">{selected.ticker}</span>
          <span className="text-xs text-text-secondary truncate">{selected.name}</span>
        </div>
        <span className="text-sm font-semibold tabular-nums">
          {selected.marketData ? formatARS(selected.marketData.close) : '—'}
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Buscar instrumento..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        autoFocus={open}
        className="w-full h-11 px-4 rounded-xl border border-border text-sm font-sans focus:outline-2 focus:outline-primary focus:outline-offset-1 focus:border-primary"
      />
      {open && data?.data && data.data.length > 0 && (
        <div className="border border-border rounded-xl max-h-48 overflow-y-auto divide-y divide-border">
          {data.data.map((inst) => (
            <button
              key={inst.id}
              type="button"
              onClick={() => {
                onSelect(inst);
                setOpen(false);
                setQuery('');
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-tab-bg/50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#EEF3FF] text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                {inst.ticker.slice(0, 4)}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium">{inst.ticker}</span>
                <span className="text-xs text-text-secondary truncate">{inst.name}</span>
              </div>
              {inst.marketData && (
                <span className="text-xs tabular-nums text-text-secondary">
                  {formatARS(inst.marketData.close)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
