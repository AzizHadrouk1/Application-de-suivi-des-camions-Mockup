import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';

type Setter<T> = Dispatch<SetStateAction<T[]>>;

export function removeWithUndo<T extends {id: string;}>(setter: Setter<T>, item: T, label: string) {
  setter((prev) => prev.filter((i) => i.id !== item.id));
  toast(`${label} supprimé`, {
    description: item.id,
    action: { label: 'Annuler', onClick: () => setter((prev) => [...prev, item]) }
  });
}

export function toggleActive<T extends {id: string;active: boolean;}>(setter: Setter<T>, item: T) {
  setter((prev) => prev.map((i) => i.id === item.id ? { ...i, active: !i.active } : i));
  toast.success(item.active ? 'Désactivé' : 'Activé', { description: 'name' in item ? String((item as {name: string;}).name) : item.id });
}

export function upsert<T extends {id: string;}>(setter: Setter<T>, item: T) {
  setter((prev) => prev.some((i) => i.id === item.id) ? prev.map((i) => i.id === item.id ? item : i) : [...prev, item]);
}

export function nextId(prefix: string, ids: string[], pad = 3): string {
  const max = ids.reduce((m, id) => {
    const n = parseInt(id.replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}${String(max + 1).padStart(pad, '0')}`;
}