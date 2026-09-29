export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand" aria-label="Viet Robot">
      <span className="brand-mark"><i /><b>V</b></span>
      {!compact && <span className="brand-name">VIET <strong>ROBOT</strong><small>INTERNAL PORTAL</small></span>}
    </div>
  );
}
