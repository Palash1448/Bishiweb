/**
 * Utility to download an array of objects as a clean CSV file
 */
export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  headers?: { key: keyof T; label: string }[]
) {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  const columnHeaders =
    headers ||
    (Object.keys(rows[0]).map((key) => ({
      key: key as keyof T,
      label: key,
    })) as { key: keyof T; label: string }[]);

  const csvRows: string[] = [];

  // Header line
  csvRows.push(columnHeaders.map((h) => `"${String(h.label).replace(/"/g, '""')}"`).join(','));

  // Data rows
  for (const row of rows) {
    const values = columnHeaders.map((h) => {
      const rawVal = row[h.key];
      let strVal = '';
      if (rawVal === undefined || rawVal === null) {
        strVal = '';
      } else if (typeof rawVal === 'object') {
        strVal = JSON.stringify(rawVal);
      } else {
        strVal = String(rawVal);
      }
      return `"${strVal.replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
