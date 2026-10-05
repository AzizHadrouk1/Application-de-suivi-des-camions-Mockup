import React from 'react';
import { LayersIcon } from 'lucide-react';
import { mapTools } from '../../data/mapTools';
import type { GeoTool } from '../../types/map';

interface MapToolbarProps {
  activeTool: GeoTool | null;
  onToolChange: (t: GeoTool | null) => void;
  layersOpen: boolean;
  onToggleLayers: () => void;
}

export function MapToolbar({ activeTool, onToolChange, layersOpen, onToggleLayers }: MapToolbarProps) {
  const groups = [mapTools.filter((t) => t.group === 'fleet'), mapTools.filter((t) => t.group === 'zones')];
  return (
    <div role="toolbar" aria-label="Outils géo-opérations" className="flex items-center gap-0.5 rounded-xl bg-white p-1 shadow-pop ring-1 ring-line">
      {groups.map((g, gi) =>
      <React.Fragment key={gi}>
          <div className="hidden items-center gap-0.5 md:flex">
            {g.map((tool) => {
            const active = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                aria-pressed={active}
                aria-label={tool.label}
                onClick={() => onToolChange(active ? null : tool.id)}
                className={`group relative flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors duration-150 ${active ? 'bg-brand-600 text-white' : 'text-ink-muted hover:bg-canvas hover:text-ink'}`}>
                
                  <tool.icon className="h-4 w-4" aria-hidden />
                  <span className="hidden whitespace-nowrap 2xl:inline">{tool.label}</span>
                  <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-navy-950 px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 2xl:hidden">
                    {tool.label}
                  </span>
                </button>);

          })}
          </div>
          <span className="mx-1 hidden h-5 w-px bg-line md:block" aria-hidden />
        </React.Fragment>
      )}
      <button
        type="button"
        aria-pressed={layersOpen}
        onClick={onToggleLayers}
        className={`flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors duration-150 ${layersOpen ? 'bg-navy-900 text-white' : 'text-ink hover:bg-canvas'}`}>
        
        <LayersIcon className="h-4 w-4" aria-hidden />
        Couches
      </button>
    </div>);

}