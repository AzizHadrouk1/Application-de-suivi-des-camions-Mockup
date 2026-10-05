export const TRIPS_TARGET_PER_HOUR = 10;

export const tripsPerHour: {hour: string;trips: number | null;current?: boolean;}[] = [
{ hour: '06h', trips: 8 },
{ hour: '07h', trips: 10 },
{ hour: '08h', trips: 11 },
{ hour: '09h', trips: 12 },
{ hour: '10h', trips: 10 },
{ hour: '11h', trips: 9 },
{ hour: '12h', trips: 7 },
{ hour: '13h', trips: 11 },
{ hour: '14h', trips: 9, current: true },
{ hour: '15h', trips: null },
{ hour: '16h', trips: null },
{ hour: '17h', trips: null }];


export const postePerformance = [
{ id: 'stock', label: 'Zone de stock', avg: 8.6, standard: 10, visits: 87 },
{ id: 'trajet', label: 'Trajet aller + retour', avg: 17.5, standard: 20, visits: 174 },
{ id: 'port', label: 'Port · déchargement', avg: 5.9, standard: 5, visits: 87 },
{ id: 'atelier', label: 'Atelier mécanique', avg: 42, standard: 45, visits: 5 },
{ id: 'pause', label: 'Zone pause', avg: 24, standard: 30, visits: 14 }];


export const zoneTimesByHour = [
{ hour: '06h', stock: 9.1, port: 5.2, trajet: 18.4 },
{ hour: '07h', stock: 8.4, port: 5.4, trajet: 17.6 },
{ hour: '08h', stock: 8.2, port: 5.6, trajet: 17.1 },
{ hour: '09h', stock: 8.0, port: 5.8, trajet: 16.9 },
{ hour: '10h', stock: 8.7, port: 6.1, trajet: 17.3 },
{ hour: '11h', stock: 9.0, port: 6.4, trajet: 18.0 },
{ hour: '12h', stock: 9.6, port: 6.2, trajet: 18.8 },
{ hour: '13h', stock: 8.3, port: 5.9, trajet: 17.2 },
{ hour: '14h', stock: 8.8, port: 7.1, trajet: 17.9 }];