import {
  BellRingIcon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  MapPinnedIcon,
  TrendingUpIcon,
  type LucideIcon } from
'lucide-react';

export interface NavItem {
  label: string;
  shortLabel: string;
  path: string;
  icon: LucideIcon;
  badge?: 'alerts';
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Géo-zones (trajets, ports, stock, atelier, pause) are managed from the Suivi map tools.
export const navGroups: NavGroup[] = [
{
  label: 'Opérations',
  items: [
  { label: 'Dashboard', shortLabel: 'Dashboard', path: '/', icon: LayoutDashboardIcon },
  { label: 'Suivi', shortLabel: 'Suivi', path: '/suivi', icon: MapPinnedIcon },
  { label: 'Gestion Missions', shortLabel: 'Missions', path: '/missions', icon: ClipboardListIcon },
  { label: 'Gestion Alertes', shortLabel: 'Alertes', path: '/alertes', icon: BellRingIcon, badge: 'alerts' },
  { label: 'Analytique', shortLabel: 'Analytique', path: '/analytique', icon: TrendingUpIcon }]

}];


export const LOGO_URL = "/tunav_logo.png";