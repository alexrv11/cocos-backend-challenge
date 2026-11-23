import { useState } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function InstrumentSearch({ value, onChange }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="Buscar por ticker o nombre..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full h-12 pl-11 pr-4 rounded-xl border text-sm font-sans
          transition-colors bg-white
          ${focused ? 'border-primary outline-2 outline-primary outline-offset-1' : 'border-border'}
        `}
      />
    </div>
  );
}
