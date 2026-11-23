import Button from '../../../shared/components/Button';
import { formatARS } from '../../../shared/lib/format';

interface Props {
  ticker: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  price: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function OrderConfirmation({
  ticker,
  side,
  type,
  quantity,
  price,
  onConfirm,
  onCancel,
  loading,
}: Props) {
  const total = quantity * price;
  const isBuy = side === 'BUY';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
        <h3 className="text-lg font-bold">Confirmar orden</h3>

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Instrumento</span>
            <span className="font-semibold">{ticker}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Operacion</span>
            <span className={`font-semibold ${isBuy ? 'text-success' : 'text-danger'}`}>
              {isBuy ? 'Compra' : 'Venta'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Tipo</span>
            <span className="font-medium">{type === 'MARKET' ? 'Mercado' : 'Limite'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Cantidad</span>
            <span className="font-medium tabular-nums">{quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Precio</span>
            <span className="font-medium tabular-nums">{formatARS(price)}</span>
          </div>
          <hr className="border-border" />
          <div className="flex justify-between">
            <span className="text-text-secondary font-medium">Total estimado</span>
            <span className="font-bold tabular-nums text-base">{formatARS(total)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 h-12 rounded-full border border-border text-sm font-semibold hover:bg-tab-bg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <Button
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
}
