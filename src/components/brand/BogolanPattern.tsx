type BogolanPatternProps = {
  tone?: "violet" | "gold";
  className?: string;
};

export function BogolanPattern({
  tone = "gold",
  className = "",
}: BogolanPatternProps) {
  const color = tone === "gold" ? "#C9A84C" : "#2A0F3D";

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g fill="none" stroke={color} strokeWidth="1.2">
        <path d="M10 20H50M70 20H110" />
        <path d="M20 10V30M40 10V30M80 10V30M100 10V30" />
        <path d="M10 40L30 60L10 80" />
        <path d="M110 40L90 60L110 80" />
        <rect x="48" y="48" width="24" height="24" />
        <path d="M48 60H72M60 48V72" />
        <path d="M10 100H50M70 100H110" />
        <path d="M20 90V110M40 90V110M80 90V110M100 90V110" />
        <circle cx="30" cy="60" r="2.2" fill={color} stroke="none" />
        <circle cx="90" cy="60" r="2.2" fill={color} stroke="none" />
      </g>
    </svg>
  );
}
