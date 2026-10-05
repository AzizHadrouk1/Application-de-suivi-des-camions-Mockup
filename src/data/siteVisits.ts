import type { SiteVisit } from '../types/fleet';

export const workshopVisits: SiteVisit[] = [
{ id: 'WV-118', siteId: 'WS-01', truckId: 'TRK-007', entry: '13:26', exit: null, durationMin: 48, reason: 'Flexible hydraulique benne' },
{ id: 'WV-117', siteId: 'WS-01', truckId: 'TRK-005', entry: '11:02', exit: '11:14', durationMin: 12, reason: 'Contrôle pression pneumatiques' },
{ id: 'WV-116', siteId: 'WS-01', truckId: 'TRK-007', entry: '09:48', exit: '10:31', durationMin: 43, reason: 'Fuite circuit de freinage' },
{ id: 'WV-115', siteId: 'WS-02', truckId: 'TRK-015', entry: '08:55', exit: '09:30', durationMin: 35, reason: 'Remplacement pneu avant' },
{ id: 'WV-114', siteId: 'WS-01', truckId: 'TRK-013', entry: '07:12', exit: '07:58', durationMin: 46, reason: 'Graissage préventif' },
{ id: 'WV-113', siteId: 'WS-01', truckId: 'TRK-011', entry: '06:20', exit: '07:31', durationMin: 71, reason: 'Diagnostic moteur' }];


export const pauseSessions: SiteVisit[] = [
{ id: 'PS-221', siteId: 'PZ-01', truckId: 'TRK-010', entry: '13:56', exit: null, durationMin: 18, reason: 'Pause déjeuner' },
{ id: 'PS-220', siteId: 'PZ-01', truckId: 'TRK-004', entry: '12:40', exit: '13:02', durationMin: 22, reason: 'Pause déjeuner' },
{ id: 'PS-219', siteId: 'PZ-01', truckId: 'TRK-010', entry: '12:12', exit: '12:54', durationMin: 42, reason: 'Pause déjeuner' },
{ id: 'PS-218', siteId: 'PZ-02', truckId: 'TRK-014', entry: '12:05', exit: '12:16', durationMin: 11, reason: 'Attente quai' },
{ id: 'PS-217', siteId: 'PZ-01', truckId: 'TRK-016', entry: '11:30', exit: '12:08', durationMin: 38, reason: 'Pause déjeuner' },
{ id: 'PS-216', siteId: 'PZ-01', truckId: 'TRK-012', entry: '10:02', exit: '10:17', durationMin: 15, reason: 'Pause café' }];