import { useState, useDeferredValue } from 'react';
import InstrumentSearch from '../components/InstrumentSearch';
import InstrumentCard from '../components/InstrumentCard';
import PriceChart from '../components/PriceChart';
import OrderBook from '../components/OrderBook';
import { useInstruments, type InstrumentWithMarket } from '../hooks/useInstruments';
import { InstrumentCardSkeleton } from '../../../shared/components/Skeleton';

export default function InstrumentsPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const { data, isLoading } = useInstruments(deferredQuery);
  const [selected, setSelected] = useState<InstrumentWithMarket | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Mercado</h1>
        <p className="text-text-secondary mt-1">
          Explora instrumentos y seguí los precios en tiempo real.
        </p>
      </div>

      <InstrumentSearch value={query} onChange={setQuery} />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        <div className="flex flex-col gap-2">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }, (_, i) => <InstrumentCardSkeleton key={i} />)}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-sm text-text-secondary py-8 text-center">
              No se encontraron instrumentos.
            </div>
          ) : (
            data?.data.map((inst) => (
              <InstrumentCard
                key={inst.id}
                instrument={inst}
                selected={selected?.id === inst.id}
                onClick={() => setSelected(inst)}
              />
            ))
          )}
        </div>

        <div className="flex flex-col gap-6">
          {selected ? (
            <>
              <PriceChart
                key={selected.id}
                instrumentId={selected.id}
                basePrice={selected.lastPrice ?? 0}
                ticker={selected.ticker}
              />
              <OrderBook
                instrumentId={selected.id}
                basePrice={selected.lastPrice ?? 0}
                ticker={selected.ticker}
              />
            </>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-text-secondary border border-border rounded-xl">
              Selecciona un instrumento para ver el grafico.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
