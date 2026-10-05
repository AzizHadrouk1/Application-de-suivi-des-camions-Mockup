import React, { useEffect, useState } from 'react';
import { useFleetData } from '../../contexts/FleetDataContext';
import type { Driver } from '../../types/fleet';
import { nextId } from '../../utils/collections';
import { driverStatusMeta } from '../../utils/status';
import { Button } from '../ui/Button';
import { Field, inputClass } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { SelectInput } from '../ui/SelectInput';

interface DriverFormProps {
  open: boolean;
  initial: Driver | null;
  onClose: () => void;
  onSubmit: (d: Driver) => void;
}

export function DriverForm({ open, initial, onClose, onSubmit }: DriverFormProps) {
  const { drivers, trucks } = useFleetData();
  const blank = (): Driver => ({ id: nextId('DRV-', drivers.map((d) => d.id), 2), name: '', phone: '+216 ', truckId: null, status: 'off_duty', licence: '', trips: 0, cycleAvg: 0, delays: 0, alerts: 0, since: '2026' });
  const [form, setForm] = useState<Driver>(blank);

  useEffect(() => {
    if (open) setForm(initial ?? blank());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = <K extends keyof Driver,>(k: K, v: Driver[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Modifier ${initial.name}` : 'Ajouter un chauffeur'}
      footer={
      <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" disabled={!form.name.trim()} onClick={() => onSubmit({ ...form, name: form.name.trim() })}>
            Enregistrer
          </Button>
        </>
      }>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom complet" className="sm:col-span-2">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="Prénom Nom" />
        </Field>
        <Field label="Téléphone">
          <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Permis">
          <input value={form.licence} onChange={(e) => set('licence', e.target.value)} className={inputClass} placeholder="C+E · 00/000000" />
        </Field>
        <Field label="Camion affecté">
          <SelectInput value={form.truckId ?? ''} onChange={(e) => set('truckId', e.target.value || null)} placeholder="Aucun camion" options={trucks.map((t) => ({ value: t.id, label: `${t.id} · ${t.plate}` }))} />
        </Field>
        <Field label="Statut">
          <SelectInput value={form.status} onChange={(e) => set('status', e.target.value as Driver['status'])} options={Object.entries(driverStatusMeta).map(([value, m]) => ({ value, label: m.label }))} />
        </Field>
      </div>
    </Modal>);

}