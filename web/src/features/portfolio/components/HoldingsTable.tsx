import type { Position } from '../hooks/usePortfolio';
import { formatARS, formatPercent } from '../../../shared/lib/format';

interface Props {
  positions: Position[];
}

export default function HoldingsTable({ positions }: Props) {
  if (positions.length === 0) {
    return (
      <div className="text-center text-text-secondary py-12 border border-border rounded-2xl">
        No tenes posiciones abiertas.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-tab-bg text-text-secondary text-left">
              <th className="px-5 py-3 font-medium">Instrumento</th>
              <th className="px-5 py-3 font-medium text-right">Cantidad</th>
              <th className="px-5 py-3 font-medium text-right">Ultimo precio</th>
              <th className="px-5 py-3 font-medium text-right">Valor</th>
              <th className="px-5 py-3 font-medium text-right">Rendimiento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {positions.map((pos) => {
              const isPositive = pos.returnPercentage >= 0;

              return (
                <tr key={pos.instrumentId} className="hover:bg-tab-bg/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EEF3FF] text-primary flex items-center justify-center text-[11px] font-bold shrink-0">
                        {pos.ticker.slice(0, 4)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{pos.ticker}</span>
                        <span className="text-xs text-text-secondary truncate max-w-[180px]">
                          {pos.name}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums font-medium">
                    {pos.quantity}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums font-medium">
                    {formatARS(pos.lastPrice)}
                  </td>
                  <td className="px-5 py-4 text-right tabular-nums font-semibold">
                    {formatARS(pos.totalValue)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-semibold tabular-nums ${isPositive ? 'text-success' : 'text-danger'}`}>
                      {formatPercent(pos.returnPercentage)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
