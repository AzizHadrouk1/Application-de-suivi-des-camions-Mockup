import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';

export function AppShell() {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-canvas">
      <TopBar />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>);

}