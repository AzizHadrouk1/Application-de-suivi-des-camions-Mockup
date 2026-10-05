import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Field } from '../ui/Field';
import { Modal } from '../ui/Modal';
import { SelectInput, type Option } from '../ui/SelectInput';

interface AssignModalProps {
  open: boolean;
  title: string;
  description?: string;
  label: string;
  options: Option[];
  initialValue: string;
  emptyLabel?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export function AssignModal({ open, title, description, label, options, initialValue, emptyLabel = 'Aucun', onClose, onSubmit }: AssignModalProps) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => {
    if (open) setValue(initialValue);
  }, [open, initialValue]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
      <>
          <Button onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={() => onSubmit(value)}>
            Affecter
          </Button>
        </>
      }>
      
      <Field label={label}>
        <SelectInput value={value} onChange={(e) => setValue(e.target.value)} placeholder={emptyLabel} options={options} />
      </Field>
    </Modal>);

}