import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { FleetDataProvider } from './contexts/FleetDataContext';
import { LiveFleetProvider } from './contexts/LiveFleetContext';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { Dashboard } from './pages/Dashboard';
import { Drivers } from './pages/Drivers';
import { Missions } from './pages/Missions';
import { PauseZones } from './pages/PauseZones';
import { Ports } from './pages/Ports';
import { RoutesManagement } from './pages/RoutesManagement';
import { Ships } from './pages/Ships';
import { StockZones } from './pages/StockZones';
import { Tracking } from './pages/Tracking';
import { Trucks } from './pages/Trucks';
import { Workshops } from './pages/Workshops';

export function App() {
  return (
    <BrowserRouter>
      <FleetDataProvider>
        <LiveFleetProvider>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Dashboard />} />
              <Route path="suivi" element={<Tracking />} />
              <Route path="missions" element={<Missions />} />
              <Route path="alertes" element={<Alerts />} />
              <Route path="analytique" element={<Analytics />} />
              <Route path="navires" element={<Ships />} />
              <Route path="camions" element={<Trucks />} />
              <Route path="chauffeurs" element={<Drivers />} />
              <Route path="trajets" element={<RoutesManagement />} />
              <Route path="ports" element={<Ports />} />
              <Route path="zones-stock" element={<StockZones />} />
              <Route path="zones-atelier" element={<Workshops />} />
              <Route path="zones-pause" element={<PauseZones />} />
              <Route path="*" element={<Dashboard />} />
            </Route>
          </Routes>
          <Toaster position="bottom-right" closeButton toastOptions={{ style: { fontFamily: 'Inter, system-ui, sans-serif' } }} />
        </LiveFleetProvider>
      </FleetDataProvider>
    </BrowserRouter>);

}