import React, { useEffect, useState } from 'react';
import { useFleetData } from '../../contexts/FleetDataContext';
import type { Ship } from '../../types/fleet';
import { nextId } from '../../utils/collections';
import { shipStatusMeta } from '../../utils/status';
import { Button } from '../ui/Button';
import { Field, inputClass } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { SelectInput } from '../ui/SelectInput';

interface ShipFormProps {
  open: boolean;
  initial: Ship | null;
  onClose: () => void;
  onSubmit: (s: Ship) => void;
}

export function ShipForm({ open, initial, onClose, onSubmit }: ShipFormProps) {
  const { ships, ports, missions } = useFleetData();
  const blank = (): Ship => ({ id: nextId('SHP-', ships.map((s) => s.id), 2), name: '', imo: '', flag: '', date: '2026-10-06', portId: ports[0]?.id ?? '', missionId: null, tonnage: 0, status: 'expected', notes: '' });
  const [form, setForm] = useState<Ship>(blank);

  useEffect(() => {
    if (open) setForm(initial ?? blank());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = <K extends keyof Ship,>(k: K, v: Ship[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? `Modifier ${initial.name}` : 'Ajouter un navire'}
      description="Les navires sont rattachés à une mission de chargement."
      footer={
      <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" disabled={!form.name.trim()} onClick={() => onSubmit({ ...form, name: form.name.trim().toUpperCase() })}>
            Enregistrer
          </Button>
        </>
      }>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nom du navire" className="sm:col-span-2">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputClass} placeholder="MV SALT STAR" />
        </Field>
        <Field label="Numéro IMO">
          <input value={form.imo} onChange={(e) => set('imo', e.target.value)} className={inputClass} placeholder="IMO 9384721" />
        </Field>
        <Field label="Pavillon">
          <input value={form.flag} onChange={(e) => set('flag', e.target.value)} className={inputClass} placeholder="Tunisie" />
        </Field>
        <Field label="Date d’accostage">
          <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className={inputClass} />
        </Field>
        <Field label="Port">
          <SelectInput value={form.portId} onChange={(e) => set('portId', e.target.value)} options={ports.map((p) => ({ value: p.id, label: p.name }))} />
        </Field>
        <Field label="Mission">
          <SelectInput value={form.missionId ?? ''} onChange={(e) => set('missionId', e.target.value || null)} placeholder="Aucune mission" options={missions.map((m) => ({ value: m.id, label: m.id }))} />
        </Field>
        <Field label="Tonnage à charger (t)">
          <input type="number" min={0} value={form.tonnage} onChange={(e) => set('tonnage', Number(e.target.value))} className={inputClass} />
        </Field>
        <Field label="Statut" className="sm:col-span-2">
          <SelectInput value={form.status} onChange={(e) => set('status', e.target.value as Ship['status'])} options={Object.entries(shipStatusMeta).map(([value, m]) => ({ value, label: m.label }))} />
        </Field>
        <Field label="Notes" className="sm:col-span-2">
          <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className={`${inputClass} h-auto py-2`} />
        </Field>
      </div>
    </Modal>);

}