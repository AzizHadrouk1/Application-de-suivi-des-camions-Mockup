import React, { useEffect, useState } from 'react';
import { useFleetData } from '../../contexts/FleetDataContext';
import { truckTypes } from '../../data/trucks';
import type { Truck } from '../../types/fleet';
import { nextId } from '../../utils/collections';
import { gpsMeta, truckStatusMeta } from '../../utils/status';
import { Button } from '../ui/Button';
import { Field, inputClass } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { SelectInput } from '../ui/SelectInput';

interface TruckFormProps {
  open: boolean;
  initial: Truck | null;
  onClose: () => void;
  onSubmit: (t: Truck) => void;
}

export function TruckForm({ open, initial, onClose, onSubmit }: TruckFormProps) {
  const { trucks, drivers } = useFleetData();
  const blank = (): Truck => ({
    id: nextId('TRK-', trucks.map((t) => t.id)),
    plate: '',
    name: '',
    type: truckTypes[0],
    driverId: null,
    missionId: null,
    status: 'available',
    health: 'normal',
    gps: 'online',
    tripsDone: 0,
    tripsTarget: 0,
    cycleAvg: 0,
    delays: 0,
    timeStock: 0,
    timePort: 0,
    timeWorkshop: 0,
    timePause: 0,
    workshopVisits: 0,
    cycleOffset: Math.round(Math.random() * 30),
    speedFactor: 1
  });
  const [form, setForm] = useState<Truck>(blank);

  useEffect(() => {
    if (open) setForm(initial ?? blank());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = <K extends keyof Truck,>(k: K, v: Truck[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Modifier ${initial.id}` : 'Ajouter un camion'}
      description="Le boîtier GPS est associé au code camion."
      footer={
      <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" disabled={!form.plate.trim()} onClick={() => onSubmit(form)}>
            Enregistrer
          </Button>
        </>
      }>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Immatriculation">
          <input value={form.plate} onChange={(e) => set('plate', e.target.value)} className={inputClass} placeholder="214 TU 8812" />
        </Field>
        <Field label="Code camion" hint={initial ? 'Non modifiable' : 'Généré automatiquement'}>
          <input value={form.id} disabled className={`${inputClass} bg-canvas font-mono text-ink-muted`} />
        </Field>
        <Field label="Nom">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="Benne Salin 13" />
        </Field>
        <Field label="Type" hint="Détermine les temps standards par défaut">
          <SelectInput value={form.type} onChange={(e) => set('type', e.target.value)} options={truckTypes.map((t) => ({ value: t, label: t }))} />
        </Field>
        <Field label="Chauffeur">
          <SelectInput value={form.driverId ?? ''} onChange={(e) => set('driverId', e.target.value || null)} placeholder="Sans chauffeur" options={drivers.map((d) => ({ value: d.id, label: d.name }))} />
        </Field>
        <Field label="Statut">
          <SelectInput value={form.status} onChange={(e) => set('status', e.target.value as Truck['status'])} options={Object.entries(truckStatusMeta).map(([value, m]) => ({ value, label: m.label }))} />
        </Field>
        <Field label="Statut GPS" className="sm:col-span-2">
          <SelectInput value={form.gps} onChange={(e) => set('gps', e.target.value as Truck['gps'])} options={Object.entries(gpsMeta).map(([value, m]) => ({ value, label: m.label }))} />
        </Field>
      </div>
    </Modal>);

}