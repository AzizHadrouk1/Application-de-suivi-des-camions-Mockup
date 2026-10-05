import React, { useState, type Dispatch, type SetStateAction } from 'react';
import type L from 'leaflet';
import { Marker, Polygon, Polyline } from 'react-leaflet';
import { CheckIcon, EyeIcon, PenToolIcon, PlusIcon, PowerIcon, SearchIcon, Trash2Icon, Undo2Icon } from 'lucide-react';
import { useLiveFleet } from '../../contexts/LiveFleetContext';
import type { GeoShape, LatLng } from '../../types/fleet';
import type { BaseMap, LayerState } from '../../types/map';
import { MAP_COLORS, vertexIcon } from '../../utils/mapIcons';
import { BaseMapToggle } from '../map/BaseMapToggle';
import { FleetMap } from '../map/FleetMap';
import { MapControls } from '../map/MapControls';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Field, inputClass } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { useGeofenceEditor, type GeoKind } from './useGeofenceEditor';

interface GeofenceWorkspaceProps<T extends GeoShape> {
  kind: GeoKind;
  entityLabel: string;
  items: T[];
  onItemsChange: Dispatch<SetStateAction<T[]>>;
  createItem: (name: string, coords: LatLng[]) => T;
  renderRowMeta: (item: T) => React.ReactNode;
  renderDetails: (item: T) => React.ReactNode;
}

const LAYERS: LayerState = { trucks: true, routes: true, ports: true, stock: true, workshops: true, pause: true, missions: false, alerts: false, trails: false };

export function GeofenceWorkspace<T extends GeoShape>(props: GeofenceWorkspaceProps<T>) {
  const { kind, entityLabel, renderRowMeta, renderDetails } = props;
  const e = useGeofenceEditor(props);
  const { live } = useLiveFleet();
  const [baseMap, setBaseMap] = useState<BaseMap>('satellite');
  const [name, setName] = useState('');
  const drawLabel = kind === 'polygon' ? 'Dessiner un polygone' : kind === 'polyline' ? 'Tracer un trajet' : 'Placer un point';
  const instruction = kind === 'point' ? 'cliquez pour placer le point' : kind === 'polyline' ? 'cliquez pour ajouter des points de passage' : 'cliquez pour ajouter des sommets';

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card lg:h-[620px]">
          <div className="flex items-center gap-2 border-b border-line p-3">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />
              <input type="search" value={e.query} onChange={(ev) => e.setQuery(ev.target.value)} placeholder="Rechercher…" aria-label="Rechercher" className={`${inputClass} pl-9`} />
            </div>
            <Button variant="primary" icon={PlusIcon} onClick={e.startDraw} disabled={e.mode !== 'view'}>
              Ajouter
            </Button>
          </div>
          <ul className="max-h-64 min-h-0 flex-1 divide-y divide-line overflow-y-auto lg:max-h-none">
            {e.filtered.map((item) => {
              const sel = item.id === e.selectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => e.select(item.id)}
                    aria-current={sel ? 'true' : undefined}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors duration-150 ${sel ? 'bg-brand-50' : 'hover:bg-canvas'}`}>
                    
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                      <div className="mt-0.5 truncate text-xs text-ink-muted">{renderRowMeta(item)}</div>
                    </div>
                    <Badge tone={item.active ? 'ok' : 'neutral'} dot>
                      {item.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </button>
                </li>);

            })}
            {e.filtered.length === 0 && <li className="px-4 py-10 text-center text-sm text-ink-muted">Aucun élément. Dessinez-en un sur la carte.</li>}
          </ul>
          {e.selected &&
          <div className="max-h-[58%] shrink-0 overflow-y-auto border-t border-line p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">{e.selected.name}</h3>
                <span className="font-mono text-xs text-ink-subtle">{e.selected.id}</span>
              </div>
              <div className="mt-3">{renderDetails(e.selected)}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" icon={EyeIcon} onClick={() => e.selected && e.focus(e.selected.coords)}>
                  Visualiser
                </Button>
                <Button size="sm" icon={PenToolIcon} onClick={e.startEdit} disabled={e.mode !== 'view'}>
                  {kind === 'point' ? 'Déplacer' : 'Modifier la forme'}
                </Button>
                <Button size="sm" icon={PowerIcon} onClick={() => e.selected && e.toggle(e.selected)}>
                  {e.selected.active ? 'Désactiver' : 'Activer'}
                </Button>
                <Button size="sm" variant="danger" icon={Trash2Icon} onClick={() => e.selected && e.remove(e.selected)}>
                  Supprimer
                </Button>
              </div>
            </div>
          }
        </aside>

        <div className="relative isolate h-[460px] overflow-hidden rounded-xl border border-line shadow-card lg:h-[620px]">
          <FleetMap
            baseMap={baseMap}
            layers={LAYERS}
            trucks={live}
            highlightId={e.selectedId}
            hiddenShapeId={e.mode === 'edit' ? e.selectedId : null}
            onShapeClick={e.select}
            onMapClick={e.onMapClick}
            onReady={e.setMap}
            drawing={e.mode === 'draw'}>
            
            {e.draft.length > 1 && kind === 'polygon' && <Polygon positions={e.draft} pathOptions={{ color: MAP_COLORS.draft, weight: 2.5, dashArray: '6 6', fillOpacity: 0.18 }} />}
            {e.draft.length > 1 && kind === 'polyline' && <Polyline positions={e.draft} pathOptions={{ color: MAP_COLORS.draft, weight: 4, dashArray: '6 6' }} />}
            {e.draft.map((p, i) =>
            <Marker
              key={i}
              position={p}
              icon={vertexIcon()}
              draggable
              eventHandlers={{
                dragend: (ev) => {
                  const ll = (ev.target as L.Marker).getLatLng();
                  e.moveVertex(i, [ll.lat, ll.lng]);
                }
              }} />

            )}
          </FleetMap>

          <div className="pointer-events-none absolute left-3 right-3 top-3 z-10 flex justify-start">
            {e.mode === 'view' &&
            <div className="pointer-events-auto flex gap-1 rounded-xl bg-white p-1 shadow-pop ring-1 ring-line">
                <Button size="sm" variant="primary" icon={PenToolIcon} onClick={e.startDraw}>
                  {drawLabel}
                </Button>
              </div>
            }
            {e.mode !== 'view' &&
            <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-xl bg-navy-950 py-2 pl-4 pr-2 text-white shadow-pop">
                <p className="text-sm">
                  <span className="font-semibold">{e.mode === 'draw' ? 'Mode dessin' : 'Mode édition'}</span>
                  <span className="text-white/70"> · {e.mode === 'draw' ? instruction : 'glissez les sommets pour ajuster'}</span>
                  <span className="ml-1 tabular-nums text-white/50">({e.draft.length} pt)</span>
                </p>
                {e.mode === 'draw' && kind !== 'point' &&
              <button type="button" onClick={e.undoPoint} disabled={!e.draft.length} aria-label="Annuler le dernier point" className="grid h-8 w-8 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white disabled:opacity-40">
                    <Undo2Icon className="h-4 w-4" />
                  </button>
              }
                <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10 hover:text-white" onClick={e.cancel}>
                  Annuler
                </Button>
                <Button size="sm" variant="primary" icon={CheckIcon} disabled={e.draft.length < e.minPoints} onClick={e.mode === 'draw' ? e.finishDraw : e.saveEdit}>
                  {e.mode === 'draw' ? 'Terminer' : 'Enregistrer'}
                </Button>
              </div>
            }
          </div>
          <div className="absolute right-3 top-3 z-10">{e.mode === 'view' && <BaseMapToggle value={baseMap} onChange={setBaseMap} />}</div>
          <div className="absolute bottom-6 right-3 z-10">
            <MapControls map={e.map} />
          </div>
        </div>
      </div>

      <Modal
        open={e.naming}
        onClose={() => e.setNaming(false)}
        title={`Nouveau ${entityLabel}`}
        description={`${e.draft.length} point(s) dessiné(s). Donnez un nom pour l’enregistrer.`}
        size="sm"
        footer={
        <>
            <Button onClick={() => e.setNaming(false)}>Retour</Button>
            <Button
            variant="primary"
            disabled={!name.trim()}
            onClick={() => {
              e.confirmName(name.trim());
              setName('');
            }}>
            
              Enregistrer
            </Button>
          </>
        }>
        
        <Field label="Nom">
          <input autoFocus value={name} onChange={(ev) => setName(ev.target.value)} className={inputClass} placeholder={`Nom du ${entityLabel}`} />
        </Field>
      </Modal>
    </>);

}