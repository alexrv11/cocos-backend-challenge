export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="16" fill="var(--color-primary)" />
        <path
          d="M8 19 L13 14 L17 18 L24 11"
          stroke="#fff"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-xl font-bold tracking-tight">Cocos Challenge</span>
    </div>
  );
}
