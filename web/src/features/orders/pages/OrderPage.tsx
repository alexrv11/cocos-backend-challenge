import OrderForm from '../components/OrderForm';

export default function OrderPage() {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">Operar</h1>
        <p className="text-text-secondary mt-1">
          Envia ordenes de compra y venta al mercado.
        </p>
      </div>

      <div className="border border-border rounded-2xl p-6">
        <OrderForm />
      </div>
    </div>
  );
}
