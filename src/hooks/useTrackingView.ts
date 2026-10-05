import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import { useLiveFleet } from '../contexts/LiveFleetContext';
import { defaultLayers } from '../data/mapTools';
import type { LatLng } from '../types/fleet';
import type { BaseMap, GeoTool, LayerState, TruckDetailTab } from '../types/map';

export function useTrackingView() {
  const { live, liveById, getTrail } = useLiveFleet();
  const [params, setParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(params.get('truck'));
  const [map, setMap] = useState<L.Map | null>(null);
  const [baseMap, setBaseMap] = useState<BaseMap>('plan');
  const [layers, setLayers] = useState<LayerState>(defaultLayers);
  const [layersOpen, setLayersOpen] = useState(false);
  const [tool, setTool] = useState<GeoTool | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{id: string;tab: TruckDetailTab;} | null>(null);
  const [missionId, setMissionId] = useState<string | null>(params.get('mission'));
  const [follow, setFollow] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selected = selectedId ? liveById[selectedId] ?? null : null;
  const posRef = useRef<LatLng | undefined>(selected?.position);
  posRef.current = selected?.position;

  useEffect(() => {
    if (!map || !selectedId) return;
    const p = posRef.current;
    if (p) map.flyTo(p, Math.max(map.getZoom(), 16), { duration: 0.6 });
  }, [map, selectedId]);

  const lat = selected?.position[0];
  const lng = selected?.position[1];
  useEffect(() => {
    if (follow && map && lat !== undefined && lng !== undefined) map.panTo([lat, lng], { animate: true, duration: 0.8 });
  }, [follow, map, lat, lng]);

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => map?.invalidateSize(), 60);
    return () => window.clearTimeout(id);
  }, [fullscreen, map]);

  const selectTruck = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      setListOpen(false);
      if (!id) setFollow(false);
      setParams(id ? { truck: id } : {}, { replace: true });
    },
    [setParams]
  );

  const focusShape = (id: string, coords: LatLng[]) => {
    setHighlightId(id);
    if (!map || coords.length === 0) return;
    if (coords.length === 1) map.flyTo(coords[0], 17, { duration: 0.6 });else
    map.fitBounds(L.latLngBounds(coords), { padding: [80, 80], maxZoom: 17 });
  };

  const locateAll = () => {
    if (!map || live.length === 0) return;
    map.fitBounds(L.latLngBounds(live.map((t) => t.position)), { padding: [60, 60] });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();else
    void wrapRef.current?.requestFullscreen?.().catch(() => undefined);
  };

  const trail = selectedId && layers.trails ? getTrail(selectedId) : undefined;

  return {
    live,
    selected,
    selectedId,
    selectTruck,
    map,
    setMap,
    baseMap,
    setBaseMap,
    layers,
    setLayers,
    layersOpen,
    setLayersOpen,
    tool,
    setTool,
    highlightId,
    setHighlightId,
    detail,
    setDetail,
    missionId,
    setMissionId,
    follow,
    setFollow,
    listOpen,
    setListOpen,
    fullscreen,
    toggleFullscreen,
    wrapRef,
    focusShape,
    locateAll,
    trail
  };
}