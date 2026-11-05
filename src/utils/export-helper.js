/**
 * Helper to export JSON/Array data to CSV format and trigger browser download
 * @param {Array<Object>} data - Array of row objects or formatted values
 * @param {string} filename - Output filename (e.g. 'compliance-report.csv')
 * @param {Array<{id: string, label: string}>} columns - Optional column definitions
 */
export function exportToCSV(data = [], filename = 'export.csv', columns = null) {
  if (!data || !data.length) return;

  let headers = [];
  let rows = [];

  if (columns && columns.length) {
    headers = columns.map((col) => `"${col.label.replace(/"/g, '""')}"`);
    rows = data.map((row) =>
      columns
        .map((col) => {
          const val = row[col.id] !== undefined && row[col.id] !== null ? String(row[col.id]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
  } else {
    const keys = Object.keys(data[0]);
    headers = keys.map((key) => `"${key.replace(/"/g, '""')}"`);
    rows = data.map((row) =>
      keys
        .map((key) => {
          const val = row[key] !== undefined && row[key] !== null ? String(row[key]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(',')
    );
  }

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadBlob(blob, filename = 'export.csv') {
  if (!(blob instanceof Blob)) return;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Helper to trigger print view for PDF export
 * @param {string} title - Document title for the PDF export
 * @param {Array<{id: string, label: string}>} columns - Column titles
 * @param {Array<Object>} data - Row data
 */
export function exportToPDF(title = 'Report', columns = [], data = []) {
  if (!data || !data.length) return;

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const headerHtml = columns.map((col) => `<th style="border:1px solid #ddd; padding:8px; text-align:left;">${col.label}</th>`).join('');
  const rowsHtml = data
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => `<td style="border:1px solid #ddd; padding:8px;">${row[col.id] !== undefined ? row[col.id] : '—'}</td>`)
          .join('')}</tr>`
    )
    .join('');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          h2 { color: #111; margin-bottom: 5px; }
          .timestamp { color: #666; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f4f6f8; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <div class="timestamp">Generated on: ${new Date().toLocaleString()}</div>
        <table>
          <thead><tr>${headerHtml}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
