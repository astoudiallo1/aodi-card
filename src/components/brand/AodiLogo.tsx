type AodiLogoProps = {
  variant?: "light" | "dark";
  className?: string;
};

export function AodiLogo({ variant = "light", className = "" }: AodiLogoProps) {
  const textClass = variant === "light" ? "text-aodi-cream" : "text-aodi-violet-900";
  const goldClass = variant === "light" ? "text-aodi-gold-light" : "text-aodi-gold";

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-2.5">
        <span className={goldClass} aria-hidden>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M9 1.2L11.1 6.4L16.8 7.1L12.6 10.8L13.8 16.5L9 13.7L4.2 16.5L5.4 10.8L1.2 7.1L6.9 6.4L9 1.2Z"
              stroke="currentColor"
              strokeWidth="1.1"
              fill="none"
            />
            <circle cx="9" cy="9" r="1.3" fill="currentColor" />
          </svg>
        </span>
        <p
          className={`font-display text-[1.35rem] font-semibold leading-none tracking-[0.28em] ${textClass}`}
        >
          AODI
        </p>
      </div>
      <p
        className={`mt-1.5 text-[0.62rem] font-medium uppercase tracking-[0.46em] ${goldClass}`}
      >
        Card
      </p>
    </div>
  );
}
