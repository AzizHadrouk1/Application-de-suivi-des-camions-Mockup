const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export function fmtNum(n: number): string {
  return nf.format(n);
}

export function fmtInt(n: number): string {
  return nf0.format(n);
}

export function fmtMin(n: number): string {
  return `${nf.format(n)} min`;
}

export function fmtSignedMin(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  if (rounded === 0) return '0 min';
  return `${rounded > 0 ? '+' : '−'}${nf.format(Math.abs(rounded))} min`;
}

export function fmtAgo(sec: number): string {
  if (sec < 60) return `${sec} s`;
  if (sec < 3600) return `${Math.floor(sec / 60)} min`;
  return `${Math.floor(sec / 3600)} h`;
}

export function fmtClock(d: Date): string {
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function fmtDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}