import React, { useEffect, useState } from 'react';
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PlayIcon } from 'lucide-react';
import { useFleetData } from '../../contexts/FleetDataContext';
import { STANDARD_CYCLE } from '../../data/missions';
import type { CycleStandard, Mission, MissionAssignment } from '../../types/fleet';
import { nextId } from '../../utils/collections';
import { cycleTotal } from '../../utils/simulation';
import { Button } from '../ui/Button';
import { Field, inputClass } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { SelectInput } from '../ui/SelectInput';
import { MissionAssignmentRows } from './MissionAssignmentRows';

interface MissionFormProps {
  open: boolean;
  initial: Mission | null;
  onClose: () => void;
  onSubmit: (m: Mission, launch: boolean) => void;
}

const STEPS = [
{ title: 'Mission', hint: 'Navire, départ et trajet' },
{ title: 'Camions & chauffeurs', hint: 'Affectation des voyages' },
{ title: 'Temps de cycle', hint: 'Estimation et notes' }];


const STAGES: {key: keyof CycleStandard;label: string;}[] = [
{ key: 'loading', label: 'Chargement' },
{ key: 'outbound', label: 'Trajet aller' },
{ key: 'unloading', label: 'Déchargement port' },
{ key: 'return', label: 'Retour' }];


export function MissionForm({ open, initial, onClose, onSubmit }: MissionFormProps) {
  const { missions, ships, stockZones, ports, trucks, drivers } = useFleetData();
  const [step, setStep] = useState(0);

  const blank = (): Mission => ({
    id: nextId('NAVIRE-', missions.map((m) => m.id)),
    shipId: '',
    date: '2026-10-05',
    start: '16:00',
    end: '22:00',
    stockZoneId: '',
    portId: '',
    truckIds: [],
    assignments: [{ truckId: '', driverId: '', trips: 1 }],
    tripsTarget: 40,
    tripsDone: 0,
    status: 'planned',
    standardCycle: { ...STANDARD_CYCLE },
    contingency: 0,
    actualCycle: { loading: 0, outbound: 0, unloading: 0, return: 0 },
    notes: ''
  });

  const fromInitial = (m: Mission): Mission => {
    if (m.assignments?.length) return m;
    const per = m.truckIds.length ? Math.ceil(m.tripsTarget / m.truckIds.length) : 1;
    const rows: MissionAssignment[] = m.truckIds.map((id) => ({ truckId: id, driverId: trucks.find((t) => t.id === id)?.driverId ?? '', trips: per }));
    return { ...m, assignments: rows.length ? rows : [{ truckId: '', driverId: '', trips: 1 }] };
  };

  const [form, setForm] = useState<Mission>(blank);

  useEffect(() => {
    if (open) {
      setForm(initial ? fromInitial(initial) : blank());
      setStep(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const set = <K extends keyof Mission,>(k: K, v: Mission[K]) => setForm((f) => ({ ...f, [k]: v }));
  const rows = form.assignments ?? [];
  const validRows = rows.filter((r) => r.truckId);

  const stepValid = [
  !!form.shipId && !!form.date && !!form.start && !!form.stockZoneId && !!form.portId && form.tripsTarget >= 1,
  validRows.length > 0 && validRows.every((r) => r.driverId && r.trips >= 1),
  STAGES.every((s) => form.standardCycle[s.key] >= 1)];

  const canSave = stepValid.every(Boolean);
  const isLast = step === STEPS.length - 1;

  const finalize = (launch: boolean) => {
    const assignments = validRows;
    onSubmit({ ...form, assignments, truckIds: assignments.map((r) => r.truckId) }, launch);
  };

  const total = cycleTotal(form.standardCycle) + (form.contingency ?? 0);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? `Modifier ${initial.id}` : 'Nouvelle mission de chargement navire'}
      footer={
      <>
          {step === 0 ?
        <Button onClick={onClose}>Annuler</Button> :

        <Button icon={ChevronLeftIcon} onClick={() => setStep((s) => s - 1)}>
              Précédent
            </Button>
        }
          <span className="flex-1" />
          {!isLast ?
        <Button variant="primary" disabled={!stepValid[step]} onClick={() => setStep((s) => s + 1)}>
              Suivant
              <ChevronRightIcon className="h-4 w-4" aria-hidden />
            </Button> :

        <>
              <Button disabled={!canSave} onClick={() => finalize(false)}>
                {initial ? 'Enregistrer' : 'Enregistrer comme planifiée'}
              </Button>
              {form.status !== 'running' && form.status !== 'done' &&
          <Button variant="primary" icon={PlayIcon} disabled={!canSave} onClick={() => finalize(true)}>
                  Lancer la mission
                </Button>
          }
            </>
        }
        </>
      }>
      
      <ol className="mb-6 grid grid-cols-3 gap-2" aria-label="Étapes">
        {STEPS.map((s, i) => {
          const done = i < step;
          const current = i === step;
          const reachable = i <= step || stepValid.slice(0, i).every(Boolean);
          return (
            <li key={s.title}>
              <button
                type="button"
                disabled={!reachable}
                onClick={() => setStep(i)}
                aria-current={current ? 'step' : undefined}
                className="flex w-full items-center gap-2.5 text-left disabled:cursor-not-allowed">
                
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors duration-150 ${
                  current ? 'bg-brand-600 text-white' : done ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-ink-subtle ring-1 ring-inset ring-line'}`
                  }>
                  
                  {done ? <CheckIcon className="h-3.5 w-3.5" aria-hidden /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className={`block truncate text-sm font-semibold ${current ? 'text-ink' : 'text-ink-muted'}`}>{s.title}</span>
                  <span className="hidden truncate text-xs text-ink-subtle sm:block">{s.hint}</span>
                </span>
              </button>
              <span className={`mt-3 block h-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-line'}`} aria-hidden />
            </li>);

        })}
      </ol>

      {step === 0 &&
      <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nom du navire" className="sm:col-span-2">
            <SelectInput
            value={form.shipId}
            placeholder="Choisir un navire"
            onChange={(e) => set('shipId', e.target.value)}
            options={ships.map((s) => ({ value: s.id, label: `${s.name} · ${s.imo}` }))} />
          
          </Field>
          <Field label="Date et heure de démarrage">
            <input
            type="datetime-local"
            value={`${form.date}T${form.start}`}
            onChange={(e) => {
              const [d, t] = e.target.value.split('T');
              setForm((f) => ({ ...f, date: d ?? '', start: t ?? '' }));
            }}
            className={inputClass} />
          
          </Field>
          <Field label="Nombre de voyages">
            <input type="number" min={1} value={form.tripsTarget} onChange={(e) => set('tripsTarget', Math.max(1, Number(e.target.value) || 1))} className={`${inputClass} tabular-nums`} />
          </Field>
          <Field label="Zone de stockage d’origine">
            <SelectInput value={form.stockZoneId} placeholder="Choisir une zone" onChange={(e) => set('stockZoneId', e.target.value)} options={stockZones.map((z) => ({ value: z.id, label: z.name }))} />
          </Field>
          <Field label="Port de destination">
            <SelectInput value={form.portId} placeholder="Choisir un port" onChange={(e) => set('portId', e.target.value)} options={ports.map((p) => ({ value: p.id, label: p.name }))} />
          </Field>
        </div>
      }

      {step === 1 &&
      <MissionAssignmentRows rows={rows} trucks={trucks} drivers={drivers} missionId={form.id} tripsTarget={form.tripsTarget} onChange={(r) => set('assignments', r)} />
      }

      {step === 2 &&
      <div className="space-y-6">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-ink">Temps de cycle attendu (estimation)</legend>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {STAGES.map((s) =>
            <Field key={s.key} label={s.label}>
                  <MinutesInput value={form.standardCycle[s.key]} min={1} onChange={(v) => set('standardCycle', { ...form.standardCycle, [s.key]: v })} />
                </Field>
            )}
              <Field label="Aléas (optionnel)">
                <MinutesInput value={form.contingency ?? 0} min={0} onChange={(v) => set('contingency', v)} />
              </Field>
            </div>
            <div className="mt-4 flex items-baseline justify-between rounded-lg bg-brand-50 px-4 py-3">
              <span className="text-sm text-brand-800">Cycle total estimé</span>
              <span className="text-xl font-semibold tabular-nums text-brand-800">{total} min</span>
            </div>
          </fieldset>

          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={3} className={`${inputClass} h-auto py-2`} placeholder="Consignes de chargement, cales, priorités…" />
          </Field>
        </div>
      }
    </Modal>);

}

function MinutesInput({ value, min, onChange }: {value: number;min: number;onChange: (v: number) => void;}) {
  return (
    <div className="relative">
      <input type="number" min={min} value={value} onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))} className={`${inputClass} pr-11 tabular-nums`} />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-subtle">min</span>
    </div>);

}