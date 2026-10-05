import React from 'react';
import { LOGO_URL } from '../../data/navigation';

export function BrandLogo() {
  return (
    <span className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-card">
      <img src={LOGO_URL} alt="TUNAV" className="h-8 w-8 object-contain" />
    </span>);

}