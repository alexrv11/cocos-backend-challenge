import { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderFormData } from '../schemas/order.schema';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { usePortfolio } from '../../portfolio/hooks/usePortfolio';
import type { InstrumentWithMarket } from '../../market/hooks/useInstruments';
import InstrumentPicker from './InstrumentPicker';
import OrderConfirmation from './OrderConfirmation';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { useToastStore } from '../../../shared/components/Toast';
import { formatARS } from '../../../shared/lib/format';

export default function OrderForm() {
  const [instrument, setInstrument] = useState<InstrumentWithMarket | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingData, setPendingData] = useState<OrderFormData | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      side: 'BUY',
      type: 'MARKET',
    },
  });

  const createOrder = useCreateOrder();
  const addToast = useToastStore((s) => s.add);
  const { data: portfolio } = usePortfolio();

  const side = watch('side');
  const orderType = watch('type');
  const quantity = watch('quantity');
  const price = watch('price');

  const marketPrice = instrument?.lastPrice ?? 0;
  const effectivePrice = orderType === 'MARKET' ? marketPrice : (price ?? 0);

  const { heldQuantity, availableCash, orderTotal, exceedsCash, exceedsHoldings } = useMemo(() => {
    const held = instrument
      ? (portfolio?.positions.find((p) => p.instrumentId === instrument.id)?.quantity ?? 0)
      : 0;
    const cash = portfolio?.availableCash ?? 0;
    const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 0;
    const total = qty * effectivePrice;
    return {
      heldQuantity: held,
      availableCash: cash,
      orderTotal: total,
      exceedsCash: side === 'BUY' && total > 0 && total > cash,
      exceedsHoldings: side === 'SELL' && qty > 0 && qty > held,
    };
  }, [instrument, portfolio, quantity, effectivePrice, side]);

  const canSubmit = !!instrument && !exceedsCash && !exceedsHoldings;

  function onSelectInstrument(inst: InstrumentWithMarket) {
    setInstrument(inst);
    setValue('instrumentId', inst.id);
    if (orderType === 'MARKET' && inst.lastPrice != null) {
      setValue('price', inst.lastPrice);
    }
  }

  function onSubmitForm(data: OrderFormData) {
    setPendingData(data);
    setShowConfirm(true);
  }

  function onConfirm() {
    if (!pendingData) return;
    const payload = {
      ...pendingData,
      ...(pendingData.type === 'MARKET' ? { price: undefined } : {}),
    };
    createOrder.mutate(payload, {
      onSuccess: (order) => {
        setShowConfirm(false);
        setPendingData(null);
        if (order.status === 'REJECTED') {
          addToast(
            side === 'BUY'
              ? 'Orden rechazada: fondos insuficientes'
              : 'Orden rechazada: cantidad insuficiente',
            'error',
          );
        } else {
          setInstrument(null);
          reset();
          addToast('Orden enviada exitosamente', 'success');
        }
      },
      onError: () => {
        setShowConfirm(false);
        setPendingData(null);
        addToast('Error al enviar la orden', 'error');
      },
    });
  }

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="flex flex-col gap-5"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Instrumento</label>
          <Controller
            name="instrumentId"
            control={control}
            render={() => (
              <InstrumentPicker
                selected={instrument}
                onSelect={onSelectInstrument}
              />
            )}
          />
          {errors.instrumentId && (
            <span className="text-xs text-danger">{errors.instrumentId.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Operacion</label>
          <div className="grid grid-cols-2 gap-2">
            {(['BUY', 'SELL'] as const).map((s) => (
              <label
                key={s}
                className={`flex items-center justify-center h-11 rounded-xl border cursor-pointer text-sm font-semibold transition-all
                  ${
                    side === s
                      ? s === 'BUY'
                        ? 'border-success bg-success/10 text-success'
                        : 'border-danger bg-danger/10 text-danger'
                      : 'border-border text-text-secondary hover:border-primary/40'
                  }`}
              >
                <input
                  type="radio"
                  value={s}
                  {...register('side')}
                  className="sr-only"
                />
                {s === 'BUY' ? 'Comprar' : 'Vender'}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold">Tipo de orden</label>
          <div className="grid grid-cols-2 gap-2">
            {(['MARKET', 'LIMIT'] as const).map((t) => (
              <label
                key={t}
                className={`flex items-center justify-center h-11 rounded-xl border cursor-pointer text-sm font-medium transition-all
                  ${
                    orderType === t
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-text-secondary hover:border-primary/40'
                  }`}
              >
                <input
                  type="radio"
                  value={t}
                  {...register('type')}
                  className="sr-only"
                />
                {t === 'MARKET' ? 'Mercado' : 'Limite'}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Input
            id="o-qty"
            label="Cantidad"
            type="number"
            min={1}
            step={1}
            max={side === 'SELL' ? heldQuantity : undefined}
            placeholder="Ej: 100"
            error={
              exceedsHoldings
                ? `No podes vender mas de ${heldQuantity} unidades`
                : errors.quantity?.message
            }
            {...register('quantity', { valueAsNumber: true })}
          />
          {side === 'SELL' && instrument && (
            <div className="flex items-center justify-between text-xs text-text-secondary px-1">
              <span>
                Disponible: <span className="font-semibold tabular-nums">{heldQuantity}</span> {instrument.ticker}
              </span>
              {heldQuantity > 0 && (
                <button
                  type="button"
                  className="text-primary font-semibold hover:underline"
                  onClick={() => setValue('quantity', heldQuantity)}
                >
                  Vender todo
                </button>
              )}
            </div>
          )}
          {side === 'BUY' && instrument && (
            <div className="text-xs text-text-secondary px-1">
              Efectivo disponible: <span className="font-semibold tabular-nums">{formatARS(availableCash)}</span>
            </div>
          )}
        </div>

        {orderType === 'LIMIT' && (
          <Input
            id="o-price"
            label="Precio limite (ARS)"
            type="number"
            min={0.01}
            step={0.01}
            placeholder="Ej: 6500.00"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />
        )}

        {instrument && orderTotal > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-sm p-3 bg-tab-bg rounded-xl">
              <span className="text-text-secondary">Total estimado</span>
              <span className={`font-semibold tabular-nums ${exceedsCash ? 'text-danger' : ''}`}>
                {formatARS(orderTotal)}
              </span>
            </div>
            {exceedsCash && (
              <span className="text-xs text-danger px-1">
                Fondos insuficientes. Disponible: {formatARS(availableCash)}
              </span>
            )}
          </div>
        )}

        <Button type="submit" disabled={!canSubmit}>
          Revisar orden
        </Button>
      </form>

      {showConfirm && instrument && pendingData && (
        <OrderConfirmation
          ticker={instrument.ticker}
          side={pendingData.side}
          type={pendingData.type}
          quantity={pendingData.quantity}
          price={effectivePrice}
          onConfirm={onConfirm}
          onCancel={() => { setShowConfirm(false); setPendingData(null); }}
          loading={createOrder.isPending}
        />
      )}
    </>
  );
}
