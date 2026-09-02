type DeliveryCheck = {
  label: string;
  detail: string;
  ok: boolean;
  essential?: boolean;
};

export function DeliveryChecklist({ checks }: { checks: DeliveryCheck[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {checks.map((check) => (
        <div key={check.label} className={check.ok ? "rounded-lg border border-emerald-200 bg-emerald-50 p-4" : "rounded-lg border border-rose-200 bg-rose-50 p-4"}>
          <p className={check.ok ? "text-sm font-semibold text-emerald-800" : "text-sm font-semibold text-rose-800"}>
            {check.ok ? "OK" : "A verifier"} - {check.label}
          </p>
          <p className={check.ok ? "mt-1 text-xs text-emerald-700" : "mt-1 text-xs text-rose-700"}>{check.detail}</p>
        </div>
      ))}
    </div>
  );
}
