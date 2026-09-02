type AodiOfficialLogoProps = {
  className?: string;
};

export function AodiOfficialLogo({ className = "" }: AodiOfficialLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/aodi-carte-logo-officiel-transparent.png"
      alt="AODI Carte"
      className={`h-auto object-contain ${className}`}
    />
  );
}