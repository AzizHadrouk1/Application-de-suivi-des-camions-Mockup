import React from "react";
import L from "leaflet";
import { LocateFixedIcon, MaximizeIcon, MinimizeIcon, MinusIcon, PlusIcon, BoxIcon } from "lucide-react";
interface MapControlsProps {
  map: L.Map | null;
  onLocate?: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}
export function MapControls({
  map,
  onLocate,
  onToggleFullscreen,
  isFullscreen = false
}: MapControlsProps) {
  const btn = (label: string, Icon: BoxIcon, onClick: () => void) => <button key={label} type="button" title={label} aria-label={label} onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition-colors duration-150 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700">
      <Icon className="h-[18px] w-[18px]" />
    </button>;
  return <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-pop ring-1 ring-line">
      {btn('Zoom avant', PlusIcon, () => map?.zoomIn())}
      {btn('Zoom arrière', MinusIcon, () => map?.zoomOut())}
      {onLocate && btn('Recentrer sur la flotte', LocateFixedIcon, onLocate)}
      {onToggleFullscreen && btn(isFullscreen ? 'Quitter le plein écran' : 'Plein écran', isFullscreen ? MinimizeIcon : MaximizeIcon, onToggleFullscreen)}
    </div>;
}