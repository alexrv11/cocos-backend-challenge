import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { orderSchema, type OrderFormData } from '../schemas/order.schema';
import { useCreateOrder } from '../hooks/useCreateOrder';
import type { InstrumentWithMarket } from '../../market/hooks/useInstruments';
import InstrumentPicker from './InstrumentPicker';
import OrderConfirmation from './OrderConfirmation';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import { useToastStore } from '../../../shared/components/Toast';

export default function OrderForm() {
  const [instrument, setInstrument] = useState<InstrumentWithMarket | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

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
  const orderType = watch('type');
  const side = watch('side');
  const quantity = watch('quantity');
  const price = watch('price');
  const marketPrice = instrument?.marketData?.close ?? 0;
  const effectivePrice = orderType === 'MARKET' ? marketPrice : (price ?? 0);

  function onSelectInstrument(inst: InstrumentWithMarket) {
    setInstrument(inst);
    setValue('instrumentId', inst.id);
    if (orderType === 'MARKET' && inst.marketData) {
      setValue('price', inst.marketData.close);
    }
  }

  function onSubmitForm() {
    setShowConfirm(true);
  }

  function onConfirm() {
    const data: OrderFormData = {
      instrumentId: instrument!.id,
      side: side as 'BUY' | 'SELL',
      type: orderType as 'MARKET' | 'LIMIT',
      quantity,
      ...(orderType === 'LIMIT' ? { price: price! } : {}),
    };
    createOrder.mutate(data, {
      onSuccess: () => {
        setShowConfirm(false);
        setInstrument(null);
        reset();
        addToast('Orden enviada exitosamente', 'success');
      },
      onError: () => {
        setShowConfirm(false);
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

        <Input
          id="o-qty"
          label="Cantidad"
          type="number"
          min={1}
          step={1}
          placeholder="Ej: 100"
          error={errors.quantity?.message}
          {...register('quantity', { valueAsNumber: true })}
        />

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

        {instrument && quantity > 0 && (
          <div className="flex justify-between text-sm p-3 bg-tab-bg rounded-xl">
            <span className="text-text-secondary">Total estimado</span>
            <span className="font-semibold tabular-nums">
              {new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
              }).format(quantity * effectivePrice)}
            </span>
          </div>
        )}

        <Button type="submit" disabled={!instrument}>
          Revisar orden
        </Button>
      </form>

      {showConfirm && instrument && (
        <OrderConfirmation
          ticker={instrument.ticker}
          side={side as 'BUY' | 'SELL'}
          type={orderType as 'MARKET' | 'LIMIT'}
          quantity={quantity}
          price={effectivePrice}
          onConfirm={onConfirm}
          onCancel={() => setShowConfirm(false)}
          loading={createOrder.isPending}
        />
      )}
    </>
  );
}
