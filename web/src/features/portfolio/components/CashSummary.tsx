import { formatARS } from '../../../shared/lib/format';

interface Props {
  cashARS: number;
  totalValueARS: number;
  positionsValue: number;
}

export default function CashSummary({ cashARS, totalValueARS, positionsValue }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="rounded-2xl border border-border p-5 flex flex-col gap-1">
        <span className="text-sm text-text-secondary">Valor total</span>
        <span className="text-2xl font-bold tabular-nums">
          {formatARS(totalValueARS)}
        </span>
      </div>
      <div className="rounded-2xl border border-border p-5 flex flex-col gap-1">
        <span className="text-sm text-text-secondary">Posiciones</span>
        <span className="text-2xl font-bold tabular-nums">
          {formatARS(positionsValue)}
        </span>
      </div>
      <div className="rounded-2xl border border-border p-5 flex flex-col gap-1">
        <span className="text-sm text-text-secondary">Disponible</span>
        <span className="text-2xl font-bold tabular-nums">
          {formatARS(cashARS)}
        </span>
      </div>
    </div>
  );
}
