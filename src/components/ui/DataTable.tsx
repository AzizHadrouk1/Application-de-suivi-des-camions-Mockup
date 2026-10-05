import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
  align?: 'left' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  selectedKey?: string | null;
  empty?: React.ReactNode;
  dense?: boolean;
}

export function DataTable<T>({ columns, rows, rowKey, onRowClick, selectedKey, empty, dense = false }: DataTableProps<T>) {
  const pad = dense ? 'px-3 py-2' : 'px-4 py-3';
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {columns.map((c) =>
            <th
              key={c.key}
              scope="col"
              className={`sticky top-0 z-[1] whitespace-nowrap bg-brand-600 ${pad} text-[13px] font-semibold text-white ${c.align === 'right' ? 'text-right' : 'text-left'}`}>
              
                {c.header}
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 &&
          <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-ink-muted">
                {empty ?? 'Aucun résultat'}
              </td>
            </tr>
          }
          {rows.map((row) => {
            const key = rowKey(row);
            const selected = selectedKey === key;
            return (
              <tr
                key={key}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`${onRowClick ? 'cursor-pointer' : ''} ${selected ? 'bg-brand-50' : onRowClick ? 'hover:bg-canvas/70' : ''} transition-colors duration-150`}>
                
                {columns.map((c) =>
                <td
                  key={c.key}
                  className={`whitespace-nowrap border-b border-line ${pad} align-middle text-ink ${c.align === 'right' ? 'text-right' : ''} ${c.className ?? ''}`}>
                  
                    {c.render(row)}
                  </td>
                )}
              </tr>);

          })}
        </tbody>
      </table>
    </div>);

}