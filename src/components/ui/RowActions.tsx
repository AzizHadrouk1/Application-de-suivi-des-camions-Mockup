import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { EllipsisIcon, BoxIcon } from "lucide-react";
export interface RowAction {
  label: string;
  icon: BoxIcon;
  onClick: () => void;
  danger?: boolean;
}
interface RowActionsProps {
  inline?: RowAction[];
  menu?: RowAction[];
}
export function RowActions({
  inline = [],
  menu = []
}: RowActionsProps) {
  const [pos, setPos] = useState<{
    top?: number;
    bottom?: number;
    right: number;
  } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pos) return;
    const close = () => setPos(null);
    const onDown = (e: MouseEvent) => {
      if (menuRef.current?.contains(e.target as Node) || btnRef.current?.contains(e.target as Node)) return;
      close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [pos]);
  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pos) return setPos(null);
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const right = window.innerWidth - r.right;
    if (r.bottom + 240 > window.innerHeight) setPos({
      bottom: window.innerHeight - r.top + 4,
      right
    });else setPos({
      top: r.bottom + 4,
      right
    });
  };
  return <div className="flex items-center justify-end gap-0.5" onClick={(e) => e.stopPropagation()}>
      {inline.map((a) => <button key={a.label} type="button" title={a.label} aria-label={a.label} onClick={a.onClick} className={`grid h-8 w-8 place-items-center rounded-lg transition-colors duration-150 ${a.danger ? 'text-danger-600 hover:bg-danger-50' : 'text-ink-muted hover:bg-canvas hover:text-ink'}`}>
          <a.icon className="h-4 w-4" aria-hidden />
        </button>)}
      {menu.length > 0 && <button ref={btnRef} type="button" aria-label="Plus d’actions" aria-haspopup="menu" aria-expanded={!!pos} onClick={openMenu} className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-canvas hover:text-ink">
          <EllipsisIcon className="h-4 w-4" aria-hidden />
        </button>}
      {pos && createPortal(<div ref={menuRef} role="menu" style={{
      position: 'fixed',
      top: pos.top,
      bottom: pos.bottom,
      right: pos.right
    }} className="z-[1300] min-w-[200px] rounded-lg border border-line bg-white p-1 shadow-pop">
            {menu.map((a) => <button key={a.label} role="menuitem" type="button" onClick={() => {
        setPos(null);
        a.onClick();
      }} className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 ${a.danger ? 'text-danger-600 hover:bg-danger-50' : 'text-ink hover:bg-canvas'}`}>
                <a.icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                {a.label}
              </button>)}
          </div>, document.body)}
    </div>;
}