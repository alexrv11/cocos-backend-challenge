export default function HeroPanel() {
  return (
    <section className="hidden lg:flex flex-1 basis-[520px] min-w-0 bg-primary text-white flex-col justify-center gap-10 p-16 overflow-hidden">
      <div className="flex flex-col gap-4 max-w-[520px]">
        <h2 className="m-0 text-5xl leading-tight font-bold tracking-tight">
          Inverti en el mercado financiero, en tiempo real.
        </h2>
        <p className="m-0 text-lg leading-relaxed text-hero-muted">
          Acciones, bonos, CEDEARs y FCIs desde una sola cuenta. Libro de
          ordenes y graficos al instante.
        </p>
      </div>

      <div className="flex flex-col gap-3 max-w-[460px]">
        <div className="bg-white text-text rounded-[20px] p-5 flex flex-col gap-3.5 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EEF3FF] text-primary flex items-center justify-center text-xs font-bold">
                GGAL
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-semibold">
                  Grupo Galicia
                </span>
                <span className="text-[13px] text-text-secondary">
                  BYMA &middot; ARS
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end tabular-nums">
              <span className="text-[17px] font-semibold">$ 6.512,50</span>
              <span className="text-[13px] font-semibold text-success">
                &#x25B2; 2,14%
              </span>
            </div>
          </div>
          <svg
            viewBox="0 0 400 80"
            width="100%"
            height="80"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              d="M0 62 L25 58 L50 64 L75 50 L100 54 L125 44 L150 48 L175 36 L200 40 L225 30 L250 34 L275 26 L300 30 L325 20 L350 24 L375 14 L400 10"
              stroke="var(--color-success)"
              strokeWidth="2.5"
              fill="none"
              strokeLinejoin="round"
            />
            <path
              d="M0 62 L25 58 L50 64 L75 50 L100 54 L125 44 L150 48 L175 36 L200 40 L225 30 L250 34 L275 26 L300 30 L325 20 L350 24 L375 14 L400 10 L400 80 L0 80 Z"
              fill="var(--color-success)"
              fillOpacity="0.08"
            />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { ticker: 'AL30', price: '$ 71.850' },
            { ticker: 'YPFD', price: '$ 38.420' },
            { ticker: 'PAMP', price: '$ 3.215' },
          ].map((item) => (
            <div
              key={item.ticker}
              className="bg-white/12 rounded-2xl p-3.5 flex flex-col gap-1"
            >
              <span className="text-xs text-hero-muted">{item.ticker}</span>
              <span className="text-[15px] font-semibold tabular-nums">
                {item.price}
              </span>
            </div>
          ))}
        </div>
        <span className="text-xs text-hero-muted">
          Precios de ejemplo para el challenge.
        </span>
      </div>
    </section>
  );
}
