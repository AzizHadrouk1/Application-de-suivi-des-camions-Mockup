import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { BellIcon, ChevronDownIcon, LogOutIcon, MenuIcon, SettingsIcon, XIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import { useLiveFleet } from '../../contexts/LiveFleetContext';
import { navGroups } from '../../data/navigation';
import { BrandLogo } from './BrandLogo';

const EASE = [0.23, 1, 0.32, 1] as const;
const items = navGroups.flatMap((g) => g.items);

export function TopBar() {
  const { pathname } = useLocation();
  const { alerts } = useFleetData();
  const { live } = useLiveFleet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const connected = live.filter((t) => t.gps !== 'offline').length;
  const openAlerts = alerts.filter((a) => a.status !== 'resolved').length;

  useEffect(() => {
    setMobileOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!userOpen) return;
    const onDown = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setUserOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [userOpen]);

  const alertBadge = (cls: string) =>
  openAlerts > 0 &&
  <span className={`grid h-[18px] min-w-[18px] place-items-center rounded-full bg-danger-500 px-1 text-[10px] font-bold leading-none tabular-nums text-white ring-2 ring-brand-700 ${cls}`}>
        {openAlerts}
      </span>;


  return (
    <header className="relative z-[1050] shrink-0 bg-brand-700 shadow-[0_1px_0_rgba(255,255,255,0.08)]">
      <div className="flex h-16 items-center gap-3 px-3 md:px-4">
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          className="grid h-10 w-10 place-items-center rounded-lg text-white/80 transition-colors duration-150 hover:bg-white/10 hover:text-white lg:hidden">
          
          {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>

        <Link to="/" aria-label="TUNAV — Accueil" className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
          <BrandLogo />
        </Link>

        <nav aria-label="Navigation principale" className="ml-6 hidden lg:block">
          <ul className="flex items-center gap-1.5">
            {items.map((item) =>
            <li key={item.path}>
                <NavLink
                to={item.path}
                end={item.path === '/'}
                title={item.label}
                className={({ isActive }) =>
                `relative flex h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition-colors duration-150 ${
                isActive ? 'bg-white/20 text-white ring-1 ring-inset ring-white/25' : 'text-white/75 hover:bg-white/10 hover:text-white'}`

                }>
                
                  <span className="relative">
                    <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                  </span>
                  {item.shortLabel}
                  {item.badge === 'alerts' && alertBadge('absolute -right-1.5 -top-1.5')}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden h-10 items-center gap-2 rounded-lg bg-white/10 px-3 text-xs font-medium text-white/85 xl:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-ok-500 opacity-60 motion-safe:animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-ok-500" />
            </span>
            GPS <span className="tabular-nums">{connected}/{live.length}</span>
          </div>

          <Link
            to="/alertes"
            aria-label={`${openAlerts} alertes actives`}
            className="relative grid h-10 w-10 place-items-center rounded-lg bg-white/10 text-white transition-colors duration-150 hover:bg-white/20">
            
            <BellIcon className="h-[18px] w-[18px]" />
            {alertBadge('absolute -right-1.5 -top-1.5')}
          </Link>

          <div ref={userRef} className="relative">
            <button
              type="button"
              onClick={() => setUserOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={userOpen}
              aria-label="Compte utilisateur"
              className="flex h-10 items-center gap-2 rounded-lg bg-white/10 pl-1.5 pr-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/20">
              
              <span className="grid h-7 w-7 place-items-center rounded-md bg-white text-xs font-bold text-brand-700">AM</span>
              <span className="hidden sm:inline">Admin</span>
              <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform duration-150 ${userOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            <AnimatePresence>
              {userOpen &&
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: EASE }}
                className="absolute right-0 top-12 w-60 origin-top-right rounded-xl border border-line bg-white p-1.5 shadow-pop">
                
                  <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-semibold text-ink">Amine Mabrouk</p>
                    <p className="truncate text-xs text-ink-subtle">Superviseur d’exploitation</p>
                  </div>
                  <div className="my-1 h-px bg-line" />
                  <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    toast('Paramètres', { description: 'Temps standards, utilisateurs et intégrations GPS.' });
                  }}
                  className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
                  
                    <SettingsIcon className="h-4 w-4" aria-hidden /> Paramètres
                  </button>
                  <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setUserOpen(false);
                    toast('Déconnexion', { description: 'Session fermée (démo).' });
                  }}
                  className="flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
                  
                    <LogOutIcon className="h-4 w-4" aria-hidden /> Déconnexion
                  </button>
                </motion.div>
              }
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen &&
        <motion.nav
          aria-label="Navigation principale"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: EASE }}
          className="absolute inset-x-0 top-16 border-t border-white/10 bg-brand-700 px-3 pb-4 pt-2 shadow-pop lg:hidden">
          
            <ul className="grid gap-1 sm:grid-cols-2">
              {items.map((item) =>
            <li key={item.path}>
                  <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                `flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors duration-150 ${isActive ? 'bg-white/20 text-white' : 'text-white/80 hover:bg-white/10 hover:text-white'}`
                }>
                
                    <item.icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                    <span className="truncate">{item.label}</span>
                    {item.badge === 'alerts' && alertBadge('ml-auto')}
                  </NavLink>
                </li>
            )}
            </ul>
          </motion.nav>
        }
      </AnimatePresence>
    </header>);

}