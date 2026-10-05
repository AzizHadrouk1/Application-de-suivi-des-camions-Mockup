import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EyeIcon, PencilIcon, PlusIcon, PowerIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import { useLiveFleet } from '../../contexts/LiveFleetContext';
import { mapTools } from '../../data/mapTools';
import type { LatLng } from '../../types/fleet';
import type { GeoTool } from '../../types/map';
import { removeWithUndo, toggleActive } from '../../utils/collections';
import { fmtDate, fmtMin } from '../../utils/format';
import { trucksInZone } from '../../utils/performance';
import { driverStatusMeta, healthMeta, shipStatusMeta, stageMeta } from '../../utils/status';
import { Badge, type Tone } from '../ui/Badge';
import { Button } from '../ui/Button';

interface GeoToolPanelProps {
  tool: GeoTool;
  highlightId: string | null;
  onClose: () => void;
  onFocusShape: (id: string, coords: LatLng[]) => void;
  onSelectTruck: (id: string) => void;
  onOpenMission: (id: string) => void;
}

interface PanelRow {
  id: string;
  title: string;
  subtitle: string;
  badge: {label: string;tone: Tone;};
  active?: boolean;
  onView: () => void;
  onEdit: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
}

const META: Record<GeoTool, {title: string;add: string;path: string;}> = {
  navire: { title: 'Gestion des navires', add: 'Ajouter un navire', path: '/navires' },
  camion: { title: 'Gestion des camions', add: 'Ajouter un camion', path: '/camions' },
  chauffeur: { title: 'Gestion des chauffeurs', add: 'Ajouter un chauffeur', path: '/chauffeurs' },
  trajet: { title: 'Gestion des trajets', add: 'Ajouter un trajet', path: '/trajets' },
  port: { title: 'Gestion des ports', add: 'Ajouter un port', path: '/ports' },
  stock: { title: 'Zones de stock', add: 'Ajouter une zone', path: '/zones-stock' },
  atelier: { title: 'Zones atelier', add: 'Ajouter un atelier', path: '/zones-atelier' },
  pause: { title: 'Zones pause', add: 'Ajouter une zone', path: '/zones-pause' }
};

const activeBadge = (a: boolean) => a ? { label: 'Actif', tone: 'ok' as Tone } : { label: 'Inactif', tone: 'neutral' as Tone };

export function GeoToolPanel({ tool, highlightId, onClose, onFocusShape, onSelectTruck, onOpenMission }: GeoToolPanelProps) {
  const d = useFleetData();
  const { live } = useLiveFleet();
  const navigate = useNavigate();
  const meta = META[tool];
  const Icon = mapTools.find((t) => t.id === tool)?.icon ?? EyeIcon;

  const rows: PanelRow[] = (() => {
    switch (tool) {
      case 'port':
        return d.ports.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: `${trucksInZone(live, d.missions, 'port', p.id).length} camion(s) présents · déch. moy. ${fmtMin(p.avgUnloading)}`,
          badge: activeBadge(p.active),
          active: p.active,
          onView: () => onFocusShape(p.id, p.coords),
          onEdit: () => navigate(`/ports?edit=${p.id}`),
          onToggle: () => toggleActive(d.setPorts, p),
          onDelete: () => removeWithUndo(d.setPorts, p, 'Port')
        }));
      case 'stock':
        return d.stockZones.map((z) => ({
          id: z.id,
          title: z.name,
          subtitle: `${trucksInZone(live, d.missions, 'stock', z.id).length} camion(s) en chargement · ${z.loadingStatus}`,
          badge: activeBadge(z.active),
          active: z.active,
          onView: () => onFocusShape(z.id, z.coords),
          onEdit: () => navigate(`/zones-stock?edit=${z.id}`),
          onToggle: () => toggleActive(d.setStockZones, z),
          onDelete: () => removeWithUndo(d.setStockZones, z, 'Zone de stock')
        }));
      case 'trajet':
        return d.routes.map((r) => ({
          id: r.id,
          title: r.name,
          subtitle: `${r.distanceKm.toLocaleString('fr-FR')} km · ${r.expectedMin} min prévues`,
          badge: activeBadge(r.active),
          active: r.active,
          onView: () => onFocusShape(r.id, r.coords),
          onEdit: () => navigate(`/trajets?edit=${r.id}`),
          onToggle: () => toggleActive(d.setRoutes, r),
          onDelete: () => removeWithUndo(d.setRoutes, r, 'Trajet')
        }));
      case 'atelier':
        return d.workshops.map((w, i) => ({
          id: w.id,
          title: w.name,
          subtitle: `${trucksInZone(live, d.missions, 'workshop', w.id, i === 0).length} présent(s) · ${w.visitsToday} passages aujourd’hui`,
          badge: activeBadge(w.active),
          active: w.active,
          onView: () => onFocusShape(w.id, w.coords),
          onEdit: () => navigate(`/zones-atelier?edit=${w.id}`),
          onToggle: () => toggleActive(d.setWorkshops, w),
          onDelete: () => removeWithUndo(d.setWorkshops, w, 'Atelier')
        }));
      case 'pause':
        return d.pauseZones.map((p, i) => ({
          id: p.id,
          title: p.name,
          subtitle: `${trucksInZone(live, d.missions, 'pause', p.id, i === 0).length} présent(s) · pause moy. ${fmtMin(p.avgMin)}`,
          badge: activeBadge(p.active),
          active: p.active,
          onView: () => onFocusShape(p.id, p.coords),
          onEdit: () => navigate(`/zones-pause?edit=${p.id}`),
          onToggle: () => toggleActive(d.setPauseZones, p),
          onDelete: () => removeWithUndo(d.setPauseZones, p, 'Zone pause')
        }));
      case 'navire':
        return d.ships.map((s) => ({
          id: s.id,
          title: s.name,
          subtitle: `${s.missionId ?? 'Sans mission'} · ${fmtDate(s.date)}`,
          badge: shipStatusMeta[s.status],
          onView: () => s.missionId ? onOpenMission(s.missionId) : navigate('/navires'),
          onEdit: () => navigate(`/navires?edit=${s.id}`),
          onDelete: () => removeWithUndo(d.setShips, s, 'Navire')
        }));
      case 'camion':
        return live.map((t) => ({
          id: t.id,
          title: `${t.id} · ${t.plate}`,
          subtitle: `${t.driverId ? d.driverById[t.driverId]?.name ?? '—' : 'Sans chauffeur'} · ${stageMeta[t.stage].label}`,
          badge: healthMeta[t.health],
          onView: () => onSelectTruck(t.id),
          onEdit: () => navigate(`/camions?edit=${t.id}`)
        }));
      case 'chauffeur':
        return d.drivers.map((dr) => ({
          id: dr.id,
          title: dr.name,
          subtitle: `${dr.truckId ?? 'Sans camion'} · ${dr.trips} voyages aujourd’hui`,
          badge: driverStatusMeta[dr.status],
          onView: () => dr.truckId ? onSelectTruck(dr.truckId) : navigate('/chauffeurs'),
          onEdit: () => navigate(`/chauffeurs?edit=${dr.id}`)
        }));
    }
  })();

  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      aria-label={meta.title}
      className="pointer-events-auto flex h-full w-[340px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-xl bg-white shadow-pop ring-1 ring-line">
      
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-700">
          <Icon className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-ink">{meta.title}</h2>
          <p className="text-xs text-ink-muted">{rows.length} élément(s)</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-canvas hover:text-ink">
          <XIcon className="h-4 w-4" />
        </button>
      </header>
      <div className="flex gap-2 border-b border-line px-4 py-3">
        <Button variant="primary" size="sm" icon={PlusIcon} onClick={() => navigate(`${meta.path}?${['navire', 'camion', 'chauffeur'].includes(tool) ? 'new' : 'draw'}=1`)}>
          {meta.add}
        </Button>
        <Button size="sm" onClick={() => navigate(meta.path)}>
          Ouvrir la gestion
        </Button>
      </div>
      <ul className="flex-1 divide-y divide-line overflow-y-auto">
        {rows.map((r) =>
        <li key={r.id} className={`px-4 py-3 transition-colors duration-150 ${highlightId === r.id ? 'bg-brand-50' : ''}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{r.title}</p>
                <p className="mt-0.5 truncate text-xs text-ink-muted">{r.subtitle}</p>
              </div>
              <Badge tone={r.badge.tone}>{r.badge.label}</Badge>
            </div>
            <div className="mt-2 flex items-center gap-1">
              <Button size="sm" variant="ghost" icon={EyeIcon} onClick={r.onView} className="px-2">
                Visualiser
              </Button>
              <Button size="sm" variant="ghost" icon={PencilIcon} onClick={r.onEdit} className="px-2">
                Modifier
              </Button>
              {r.onToggle &&
            <Button size="sm" variant="ghost" icon={PowerIcon} onClick={r.onToggle} className="px-2">
                  {r.active ? 'Désactiver' : 'Activer'}
                </Button>
            }
              {r.onDelete &&
            <button type="button" onClick={r.onDelete} aria-label={`Supprimer ${r.title}`} title="Supprimer" className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-danger-600 hover:bg-danger-50">
                  <Trash2Icon className="h-3.5 w-3.5" />
                </button>
            }
            </div>
          </li>
        )}
      </ul>
    </motion.aside>);

}