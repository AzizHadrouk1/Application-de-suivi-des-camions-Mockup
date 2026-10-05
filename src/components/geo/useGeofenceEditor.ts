import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { toast } from 'sonner';
import type { GeoShape, LatLng } from '../../types/fleet';
import { removeWithUndo, toggleActive } from '../../utils/collections';

export type GeoKind = 'polygon' | 'polyline' | 'point';
export type EditorMode = 'view' | 'draw' | 'edit';

interface Options<T extends GeoShape> {
  items: T[];
  onItemsChange: Dispatch<SetStateAction<T[]>>;
  kind: GeoKind;
  entityLabel: string;
  createItem: (name: string, coords: LatLng[]) => T;
}

export function useGeofenceEditor<T extends GeoShape>({ items, onItemsChange, kind, entityLabel, createItem }: Options<T>) {
  const [params, setParams] = useSearchParams();
  const [initialEdit] = useState(params.get('edit'));
  const [initialDraw] = useState(params.get('draw') === '1');
  const [selectedId, setSelectedId] = useState<string | null>(initialEdit ?? items[0]?.id ?? null);
  const [mode, setMode] = useState<EditorMode>(initialDraw ? 'draw' : initialEdit ? 'edit' : 'view');
  const [draft, setDraft] = useState<LatLng[]>(() => initialEdit ? items.find((i) => i.id === initialEdit)?.coords ?? [] : []);
  const [naming, setNaming] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [query, setQuery] = useState('');

  const minPoints = kind === 'polygon' ? 3 : kind === 'polyline' ? 2 : 1;
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const label = entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1);

  useEffect(() => {
    if (initialEdit || initialDraw) setParams({}, { replace: true });
  }, [initialEdit, initialDraw, setParams]);

  const focus = useCallback(
    (coords: LatLng[]) => {
      if (!map || coords.length === 0) return;
      if (coords.length === 1) map.flyTo(coords[0], 17, { duration: 0.5 });else
      map.fitBounds(L.latLngBounds(coords), { padding: [60, 60], maxZoom: 17 });
    },
    [map]
  );

  useEffect(() => {
    if (map && selected) focus(selected.coords);
    // focus once when the map becomes available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const select = (id: string) => {
    if (mode !== 'view') return;
    const it = items.find((i) => i.id === id);
    if (!it) return;
    setSelectedId(id);
    focus(it.coords);
  };

  const onMapClick = (p: LatLng) => {
    if (mode !== 'draw') return;
    setDraft((d) => kind === 'point' ? [p] : [...d, p]);
  };

  const startDraw = () => {
    setMode('draw');
    setDraft([]);
  };

  const startEdit = () => {
    if (!selected) return;
    setMode('edit');
    setDraft(selected.coords);
  };

  const cancel = () => {
    setMode('view');
    setDraft([]);
  };

  const undoPoint = () => setDraft((d) => d.slice(0, -1));
  const finishDraw = () => draft.length >= minPoints && setNaming(true);

  const confirmName = (name: string) => {
    const item = createItem(name, draft);
    onItemsChange((prev) => [...prev, item]);
    setSelectedId(item.id);
    setMode('view');
    setDraft([]);
    setNaming(false);
    toast.success(`${label} créé`, { description: name });
  };

  const saveEdit = () => {
    if (!selected || draft.length < minPoints) return;
    const coords = draft;
    onItemsChange((prev) => prev.map((i) => i.id === selected.id ? { ...i, coords } : i));
    setMode('view');
    setDraft([]);
    toast.success('Géométrie enregistrée', { description: selected.name });
  };

  const moveVertex = (idx: number, p: LatLng) => setDraft((d) => d.map((q, j) => j === idx ? p : q));

  const toggle = (item: T) => toggleActive(onItemsChange, item);
  const remove = (item: T) => {
    removeWithUndo(onItemsChange, item, label);
    if (selectedId === item.id) setSelectedId(null);
  };

  const filtered = items.filter((i) => i.name.toLowerCase().includes(query.trim().toLowerCase()));

  return {
    selected,
    selectedId,
    select,
    mode,
    draft,
    minPoints,
    naming,
    setNaming,
    map,
    setMap,
    query,
    setQuery,
    filtered,
    focus,
    onMapClick,
    startDraw,
    startEdit,
    cancel,
    undoPoint,
    finishDraw,
    confirmName,
    saveEdit,
    moveVertex,
    toggle,
    remove
  };
}