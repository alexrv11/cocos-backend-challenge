import { usePortfolio } from '../hooks/usePortfolio';
import CashSummary from '../components/CashSummary';
import HoldingsTable from '../components/HoldingsTable';
import { CardSkeleton, TableRowSkeleton } from '../../../shared/components/Skeleton';

export default function DashboardPage() {
  const { data, isLoading, error } = usePortfolio();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Portfolio</h1>
          <p className="text-text-secondary mt-1">Tu resumen de inversiones.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
        <div className="border border-border rounded-2xl divide-y divide-border">
          {Array.from({ length: 4 }, (_, i) => <TableRowSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-danger">
        Error al cargar el portfolio.
      </div>
    );
  }

  const positionsValue = data.positions.reduce(
    (sum, p) => sum + p.quantity * p.currentPrice,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-text-secondary mt-1">
          Tu resumen de inversiones.
        </p>
      </div>

      <CashSummary
        cashARS={data.cashARS}
        totalValueARS={data.totalValueARS}
        positionsValue={positionsValue}
      />

      <div>
        <h2 className="text-lg font-semibold mb-3">Posiciones</h2>
        <HoldingsTable positions={data.positions} />
      </div>
    </div>
  );
}
