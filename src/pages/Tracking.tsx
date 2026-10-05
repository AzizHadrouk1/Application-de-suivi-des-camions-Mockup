import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ListIcon, XIcon } from 'lucide-react';
import { BaseMapToggle } from '../components/map/BaseMapToggle';
import { FleetMap } from '../components/map/FleetMap';
import { GeoToolPanel } from '../components/map/GeoToolPanel';
import { LayersPanel } from '../components/map/LayersPanel';
import { MapControls } from '../components/map/MapControls';
import { MapToolbar } from '../components/map/MapToolbar';
import { MissionDrawer } from '../components/tracking/MissionDrawer';
import { TruckDetailDrawer } from '../components/tracking/TruckDetailDrawer';
import { TruckListPanel } from '../components/tracking/TruckListPanel';
import { TruckSummaryCard } from '../components/tracking/TruckSummaryCard';
import { useTrackingView } from '../hooks/useTrackingView';

const LEGEND = [
{ label: 'Trajet aller', className: 'h-1 w-4 rounded-full bg-brand-600' },
{ label: 'Retour', className: 'h-1 w-4 rounded-full bg-accent-500' },
{ label: 'Port', className: 'h-2.5 w-2.5 rounded-sm border-2 border-navy-800 bg-navy-800/10' },
{ label: 'Stock', className: 'h-2.5 w-2.5 rounded-sm border-2 border-accent-600 bg-accent-600/10' }];


export function Tracking() {
  const v = useTrackingView();

  const list = (className: string) =>
  <TruckListPanel trucks={v.live} selectedId={v.selectedId} onSelect={v.selectTruck} onOpenMission={(id) => v.setMissionId(id)} className={className} />;


  return (
    <div className="flex h-full min-h-0">
      {list('hidden w-[560px] shrink-0 lg:flex xl:w-[640px] 2xl:w-[720px]')}

      <div ref={v.wrapRef} className="relative isolate min-w-0 flex-1 bg-canvas">
        <FleetMap
          baseMap={v.baseMap}
          layers={v.layers}
          trucks={v.live}
          selectedTruckId={v.selectedId}
          onSelectTruck={v.selectTruck}
          trail={v.trail}
          highlightId={v.highlightId}
          onReady={v.setMap}
          onMapClick={() => v.setLayersOpen(false)} />
        

        <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col items-start gap-2 md:left-4 md:top-4">
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => v.setListOpen(true)}
              className="flex h-10 items-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 text-sm font-medium text-ink shadow-pop ring-1 ring-line lg:hidden">
              
              <ListIcon className="h-4 w-4" aria-hidden />
              Camions <span className="tabular-nums text-ink-subtle">{v.live.length}</span>
            </button>
            <MapToolbar
              activeTool={v.tool}
              onToolChange={(t) => {
                v.setTool(t);
                v.setHighlightId(null);
              }}
              layersOpen={v.layersOpen}
              onToggleLayers={() => v.setLayersOpen(!v.layersOpen)} />
            
          </div>
          <AnimatePresence>{v.layersOpen && <LayersPanel layers={v.layers} onChange={v.setLayers} onClose={() => v.setLayersOpen(false)} />}</AnimatePresence>
          <AnimatePresence mode="wait">
            {v.selected && !v.layersOpen &&
            <TruckSummaryCard
              key={v.selected.id}
              truck={v.selected}
              onClose={() => v.selectTruck(null)}
              onOpenDetails={(tab) => v.setDetail({ id: v.selected!.id, tab })}
              onOpenMission={(id) => v.setMissionId(id)}
              follow={v.follow}
              onToggleFollow={() => v.setFollow(!v.follow)} />

            }
          </AnimatePresence>
        </div>

        <div className="absolute right-3 top-3 z-10 md:right-4 md:top-4">
          <BaseMapToggle value={v.baseMap} onChange={v.setBaseMap} />
        </div>

        <AnimatePresence>
          {v.tool &&
          <div className="pointer-events-none absolute bottom-4 right-3 top-[60px] z-20 md:right-4 md:top-[64px]">
              <GeoToolPanel
              key={v.tool}
              tool={v.tool}
              highlightId={v.highlightId}
              onClose={() => {
                v.setTool(null);
                v.setHighlightId(null);
              }}
              onFocusShape={v.focusShape}
              onSelectTruck={(id) => v.selectTruck(id)}
              onOpenMission={(id) => v.setMissionId(id)} />
            
            </div>
          }
        </AnimatePresence>

        <div className={`absolute bottom-8 z-10 right-3 ${v.tool ? 'md:right-[372px]' : 'md:right-4'}`}>
          <MapControls map={v.map} onLocate={v.locateAll} onToggleFullscreen={v.toggleFullscreen} isFullscreen={v.fullscreen} />
        </div>

        <div className="absolute bottom-8 left-4 z-10 hidden items-center gap-4 rounded-lg bg-white/95 px-3 py-2 text-[11px] text-ink-muted shadow-pop ring-1 ring-line md:flex">
          {LEGEND.map((l) =>
          <span key={l.label} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className={l.className} aria-hidden />
              {l.label}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {v.listOpen &&
        <div className="fixed inset-0 z-[1100] lg:hidden">
            <motion.div className="absolute inset-0 bg-navy-950/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={() => v.setListOpen(false)} />
            <motion.div
            className="absolute inset-x-0 bottom-0 top-16 flex flex-col overflow-hidden rounded-t-2xl bg-white"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
            
              <div className="flex items-center justify-between border-b border-line px-4 py-2">
                <span className="mx-auto h-1 w-10 rounded-full bg-line" aria-hidden />
                <button type="button" onClick={() => v.setListOpen(false)} aria-label="Fermer la liste" className="absolute right-3 grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-canvas">
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
              {list('min-h-0 flex-1 border-r-0')}
            </motion.div>
          </div>
        }
      </AnimatePresence>

      <TruckDetailDrawer
        truckId={v.detail?.id ?? null}
        tab={v.detail?.tab ?? 'overview'}
        onTabChange={(tab) => v.setDetail(v.detail ? { ...v.detail, tab } : null)}
        onClose={() => v.setDetail(null)}
        onOpenMission={(id) => {
          v.setDetail(null);
          v.setMissionId(id);
        }} />
      
      <MissionDrawer
        missionId={v.missionId}
        onClose={() => v.setMissionId(null)}
        onSelectTruck={(id) => {
          v.setMissionId(null);
          v.selectTruck(id);
        }} />
      
    </div>);

}