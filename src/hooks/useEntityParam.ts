import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Reads ?new=1 or ?edit=<id> once on mount (used by map tools deep links), then clears it. */
export function useEntityParam(onNew: () => void, onEdit: (id: string) => void) {
  const [params, setParams] = useSearchParams();
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const isNew = params.get('new');
    const editId = params.get('edit');
    if (isNew) onNew();else
    if (editId) onEdit(editId);
    if (isNew || editId) setParams({}, { replace: true });
  }, [params, setParams, onNew, onEdit]);
}