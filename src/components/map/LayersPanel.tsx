import React from 'react';
import { motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { layerOptions } from '../../data/mapTools';
import type { LayerState } from '../../types/map';

interface LayersPanelProps {
  layers: LayerState;
  onChange: (l: LayerState) => void;
  onClose: () => void;
}

export function LayersPanel({ layers, onChange, onClose }: LayersPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
      className="pointer-events-auto w-64 origin-top-left rounded-xl bg-white p-2 shadow-pop ring-1 ring-line">
      
      <div className="flex items-center justify-between px-2 pb-1 pt-1">
        <p className="text-sm font-semibold text-ink">Couches de la carte</p>
        <button type="button" onClick={onClose} aria-label="Fermer" className="grid h-7 w-7 place-items-center rounded-md text-ink-muted hover:bg-canvas">
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <ul>
        {layerOptions.map((o) =>
        <li key={o.key}>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm text-ink transition-colors duration-150 hover:bg-canvas">
              <input
              type="checkbox"
              checked={layers[o.key]}
              onChange={(e) => onChange({ ...layers, [o.key]: e.target.checked })}
              className="h-4 w-4 rounded border-line accent-brand-600" />
            
              <span className={`h-2.5 w-2.5 rounded-sm ${o.swatch}`} aria-hidden />
              {o.label}
            </label>
          </li>
        )}
      </ul>
      <p className="mt-1 border-t border-line px-2 pt-2 text-[11px] text-ink-subtle">Trafic en temps réel indisponible pour la zone portuaire.</p>
    </motion.div>);

}