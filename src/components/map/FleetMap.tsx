import React, { useRef } from 'react';
import type L from 'leaflet';
import { Circle, MapContainer, Marker, Polygon, Polyline, TileLayer, Tooltip, useMapEvents } from 'react-leaflet';
import { useFleetData } from '../../contexts/FleetDataContext';
import { MAP_CENTER } from '../../data/geo';
import type { LatLng, LiveTruck } from '../../types/fleet';
import type { BaseMap, LayerState } from '../../types/map';
import { MAP_COLORS, siteIcon, truckIcon } from '../../utils/mapIcons';

interface FleetMapProps {
  baseMap: BaseMap;
  layers: LayerState;
  trucks?: LiveTruck[];
  selectedTruckId?: string | null;
  onSelectTruck?: (id: string) => void;
  trail?: LatLng[];
  highlightId?: string | null;
  hiddenShapeId?: string | null;
  onShapeClick?: (id: string) => void;
  onMapClick?: (p: LatLng) => void;
  onReady?: (map: L.Map | null) => void;
  drawing?: boolean;
  children?: React.ReactNode;
}

const TILES: Record<BaseMap, {url: string;attribution: string;}> = {
  plan: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagerie &copy; Esri'
  }
};

function ClickCatcher({ onClick }: {onClick?: (p: LatLng) => void;}) {
  const ref = useRef(onClick);
  ref.current = onClick;
  useMapEvents({
    click(e) {
      ref.current?.([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export function FleetMap({
  baseMap,
  layers,
  trucks = [],
  selectedTruckId,
  onSelectTruck,
  trail,
  highlightId,
  hiddenShapeId,
  onShapeClick,
  onMapClick,
  onReady,
  drawing = false,
  children
}: FleetMapProps) {
  const { stockZones, ports, routes, workshops, pauseZones, missions } = useFleetData();
  const running = missions.filter((m) => m.status === 'running');
  const missionTag = (zoneId: string, key: 'stockZoneId' | 'portId') => {
    if (!layers.missions) return '';
    const ids = running.filter((m) => m[key] === zoneId).map((m) => m.id);
    return ids.length ? ` · ${ids.join(', ')}` : '';
  };
  const hi = (id: string) => highlightId === id;
  const shortName = (n: string) => n.split(' · ')[0];

  return (
    <div className={`relative isolate h-full w-full ${drawing ? '[&_.leaflet-container]:cursor-crosshair' : ''}`}>
      <MapContainer ref={onReady} center={MAP_CENTER} zoom={15} zoomControl={false} scrollWheelZoom className="h-full w-full">
        <TileLayer key={baseMap} url={TILES[baseMap].url} attribution={TILES[baseMap].attribution} maxZoom={19} />
        <ClickCatcher onClick={onMapClick} />

        {layers.stock &&
        stockZones.map((z) =>
        z.id === hiddenShapeId ? null :
        <Polygon
          key={`${z.id}-${z.coords.length}-${z.active}`}
          positions={z.coords}
          pathOptions={{ color: z.active ? MAP_COLORS.stock : MAP_COLORS.inactive, weight: hi(z.id) ? 3.5 : 2, fillOpacity: hi(z.id) ? 0.3 : 0.14, dashArray: z.active ? undefined : '4 6' }}
          eventHandlers={{ click: () => onShapeClick?.(z.id) }}>
          
                <Tooltip permanent direction="center" className="zone-label">
                  {shortName(z.name)}
                  {missionTag(z.id, 'stockZoneId')}
                </Tooltip>
              </Polygon>

        )}

        {layers.ports &&
        ports.map((p) =>
        p.id === hiddenShapeId ? null :
        <Polygon
          key={`${p.id}-${p.coords.length}-${p.active}`}
          positions={p.coords}
          pathOptions={{ color: p.active ? MAP_COLORS.port : MAP_COLORS.inactive, weight: hi(p.id) ? 3.5 : 2, fillOpacity: hi(p.id) ? 0.26 : 0.1, dashArray: p.active ? undefined : '4 6' }}
          eventHandlers={{ click: () => onShapeClick?.(p.id) }}>
          
                <Tooltip permanent direction="center" className="zone-label">
                  {p.berth ? `Port · ${p.berth}` : shortName(p.name)}
                  {missionTag(p.id, 'portId')}
                </Tooltip>
              </Polygon>

        )}

        {layers.routes &&
        routes.map((r) =>
        r.id === hiddenShapeId ? null :
        <Polyline
          key={`${r.id}-${r.coords.length}-${r.active}`}
          positions={r.coords}
          pathOptions={{
            color: !r.active ? MAP_COLORS.inactive : r.direction === 'retour' ? MAP_COLORS.retour : MAP_COLORS.aller,
            weight: hi(r.id) ? 7 : 4.5,
            opacity: 0.85,
            dashArray: r.active ? undefined : '6 8',
            lineCap: 'round',
            lineJoin: 'round'
          }}
          eventHandlers={{ click: () => onShapeClick?.(r.id) }}>
          
                <Tooltip sticky>{r.name}</Tooltip>
              </Polyline>

        )}

        {layers.workshops &&
        workshops.map((w) =>
        w.id === hiddenShapeId ? null :
        <React.Fragment key={w.id}>
                <Circle center={w.coords[0]} radius={w.radiusM} pathOptions={{ color: MAP_COLORS.port, weight: hi(w.id) ? 2.5 : 1, fillOpacity: hi(w.id) ? 0.18 : 0.06, dashArray: '3 5' }} />
                <Marker position={w.coords[0]} icon={siteIcon('workshop', w.active)} eventHandlers={{ click: () => onShapeClick?.(w.id) }}>
                  <Tooltip direction="right" offset={[14, 0]} className="zone-label">
                    {w.name}
                  </Tooltip>
                </Marker>
              </React.Fragment>

        )}

        {layers.pause &&
        pauseZones.map((p) =>
        p.id === hiddenShapeId ? null :
        <React.Fragment key={p.id}>
                <Circle center={p.coords[0]} radius={p.radiusM} pathOptions={{ color: '#5B6478', weight: hi(p.id) ? 2.5 : 1, fillOpacity: hi(p.id) ? 0.18 : 0.06, dashArray: '3 5' }} />
                <Marker position={p.coords[0]} icon={siteIcon('pause', p.active)} eventHandlers={{ click: () => onShapeClick?.(p.id) }}>
                  <Tooltip direction="right" offset={[14, 0]} className="zone-label">
                    {p.name}
                  </Tooltip>
                </Marker>
              </React.Fragment>

        )}

        {layers.trails && trail && trail.length > 1 &&
        <Polyline positions={trail} pathOptions={{ color: MAP_COLORS.trail, weight: 3, opacity: 0.7, dashArray: '2 7', lineCap: 'round' }} />
        }

        {layers.trucks &&
        trucks.map((t) => {
          const selected = t.id === selectedTruckId;
          return (
            <Marker
              key={t.id}
              position={t.position}
              icon={truckIcon(t.health, selected, layers.alerts && t.health === 'alert')}
              zIndexOffset={selected ? 1000 : t.health === 'alert' ? 500 : 0}
              eventHandlers={{ click: () => onSelectTruck?.(t.id) }}
              title={`${t.id} · ${t.plate}`}
              alt={`Camion ${t.id}`}>
              
                <Tooltip key={selected ? 'p' : 'h'} permanent={selected} direction="top" offset={[0, -16]} className="truck-label">
                  {t.id}
                </Tooltip>
              </Marker>);

        })}

        {children}
      </MapContainer>
    </div>);

}