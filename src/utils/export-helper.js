import dayjs from 'dayjs';

import { store } from 'src/store/store';
import { toast } from 'src/components/snackbar';

// ----------------------------------------------------------------------

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/;
const MIDNIGHT_REGEX = /T00:00:00(?:\.000)?Z?$/i;
const NUMERIC_LITERAL_REGEX = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
const FORMULA_PREFIX_REGEX = /^[=+\-@]/;
const DATE_COLUMN_REGEX =
  /\b(?:date|time|created at|updated at|last session|last review|next due|scheduled(?: at)?|approved (?:date|at|time)|approval date|completed at|conducted at)\b/i;

function isDateColumn(header) {
  const normalizedHeader = String(header || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ');

  return DATE_COLUMN_REGEX.test(normalizedHeader);
}

/**
 * Parses raw CSV text into a 2D array of cells according to RFC 4180 rules.
 * Handles quoted fields, escaped quotes, embedded commas, and multiline cells.
 *
 * @param {string} text - Raw CSV content
 * @returns {Array<Array<string>>}
 */
export function parseCsv(text) {
  if (!text || typeof text !== 'string') return [];

  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuotes = false;
  let i = 0;

  // Strip initial UTF-8 BOM if already present
  let cleanText = text;
  if (cleanText.charCodeAt(0) === 0xfeff) {
    cleanText = cleanText.slice(1);
  }

  while (i < cleanText.length) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i += 2;
        continue;
      }
      insideQuotes = !insideQuotes;
      i += 1;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell);
      currentCell = '';
      i += 1;
      continue;
    }

    if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = '';
      i += 1;
      continue;
    }

    currentCell += char;
    i += 1;
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  // Filter out completely empty trailing lines
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

/**
 * Sanitizes a single cell value for CSV export:
 * - Empty / null / undefined / placeholder values are converted to blank ('')
 * - Overflow hashes (######) are converted to blank ('')
 * - ISO date/time strings are formatted to clean standard dates (YYYY-MM-DD or YYYY-MM-DD HH:mm)
 *
 * @param {any} val - Cell value
 * @param {boolean} isHeader - Whether this cell belongs to the header row
 * @returns {string}
 */
export function cleanCell(val, isHeader = false) {
  if (val === null || val === undefined) return '';

  const str = String(val).trim();
  if (isHeader) return str;

  const lower = str.toLowerCase();
  if (
    str === '' ||
    lower === 'null' ||
    lower === 'undefined' ||
    lower === 'nan' ||
    str === '—' ||
    str === '–' ||
    str === '-' ||
    str === '--' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'none' ||
    lower === 'nil' ||
    lower.startsWith('invalid date') ||
    lower.startsWith('invalid time') ||
    /^#+$/.test(str)
  ) {
    return '';
  }

  // Normalize ISO dates/timestamps to clean Excel-compatible strings
  if (ISO_DATE_REGEX.test(str)) {
    // Pure date (YYYY-MM-DD) or explicit midnight UTC timestamp
    if (/^\d{4}-\d{2}-\d{2}$/.test(str) || MIDNIGHT_REGEX.test(str)) {
      return str.slice(0, 10);
    }
    const d = dayjs(str);
    if (d.isValid()) {
      return d.format('YYYY-MM-DD HH:mm');
    }
  }

  return str;
}

function serializeCsvCell(value, { isHeader = false, isDateColumn = false } = {}) {
  const rawCell = typeof value === 'string' ? value.trim() : '';
  const isDateCell = !isHeader && isDateColumn;
  const isIsoDateCell = isDateCell && ISO_DATE_REGEX.test(rawCell);
  let cell = isIsoDateCell ? rawCell.replace('T', ' ') : cleanCell(value, isHeader);

  if (!isHeader && cell) {
    if (isDateCell || (FORMULA_PREFIX_REGEX.test(cell) && !NUMERIC_LITERAL_REGEX.test(cell))) {
      cell = `'${cell}`;
    }
  }

  return `"${cell.replace(/"/g, '""')}"`;
}

/**
 * Sanitizes an entire CSV text string by parsing all rows and cells,
 * cleaning missing/invalid values to blank, and normalizing date formats.
 * Date values in date/time columns are emitted as text for spreadsheet compatibility.
 *
 * @param {string} rawCsvText - Raw CSV content from backend
 * @returns {string} Cleaned CSV content
 */
export function sanitizeCsvText(rawCsvText) {
  const rows = parseCsv(rawCsvText);
  if (!rows.length) return '';

  const dateColumns = rows[0].map((header) => isDateColumn(cleanCell(header, true)));

  const sanitizedRows = rows.map((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    return row
      .map((cell, cellIndex) =>
        serializeCsvCell(cell, {
          isHeader,
          isDateColumn: dateColumns[cellIndex],
        })
      )
      .join(',');
  });

  return sanitizedRows.join('\r\n');
}

/**
 * Helper to export JSON/Array data to CSV format and trigger browser download
 * @param {Array<Object>} data - Array of row objects or formatted values
 * @param {string} filename - Output filename (e.g. 'compliance-report.csv')
 * @param {Array<{id: string, label: string}>} columns - Optional column definitions
 */
export function exportToCSV(data = [], filename = 'export.csv', columns = null) {
  if (!data || !data.length) return;

  const exportColumns =
    columns?.length > 0
      ? columns
      : Object.keys(data[0]).map((key) => ({ id: key, label: key }));
  const dateColumns = exportColumns.map((column) => isDateColumn(column.label));
  const headers = exportColumns.map((column) =>
    serializeCsvCell(column.label, { isHeader: true })
  );
  const rows = data.map((row) =>
    exportColumns
      .map((column, index) =>
        serializeCsvCell(row[column.id], { isDateColumn: dateColumns[index] })
      )
      .join(',')
  );

  // Prepend UTF-8 BOM so Excel opens with proper UTF-8 decoding
  const csvContent = `\uFEFF${[headers.join(','), ...rows].join('\r\n')}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

  const headerHtml = columns
    .map((col) => `<th style="border:1px solid #ddd; padding:8px; text-align:left;">${col.label}</th>`)
    .join('');
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

/**
 * Helper to resolve the authenticated JWT token for export downloads.
 */
function getAuthToken() {
  try {
    const state = store?.getState?.();
    const token = state?.user?.user?.token;
    if (token) return token;
  } catch (_) {}

  try {
    const rawRoot = localStorage.getItem('persist:root');
    if (rawRoot) {
      const parsedRoot = JSON.parse(rawRoot);
      if (parsedRoot?.user) {
        const userSlice = JSON.parse(parsedRoot.user);
        const token = userSlice?.user?.token || userSlice?.token;
        if (token) return token;
      }
    }
  } catch (_) {}

  try {
    const jwt = sessionStorage.getItem('jwt_access_token');
    if (jwt) return jwt;
  } catch (_) {}

  return null;
}

/**
 * Downloads a CSV file directly from an authenticated backend endpoint.
 * Cleans and sanitizes the content to prevent Excel formatting bugs (like ############),
 * replaces null/undefined/placeholder values with blank, and applies UTF-8 BOM encoding.
 *
 * @param {string} endpoint - Relative API route (e.g. from API_ROUTES)
 * @param {string} defaultFilename - Output filename (e.g. 'attendance.csv')
 * @param {object} [params] - Optional query parameters (branchId, keyword, date range, etc.)
 * @param {string} [organizationId] - Organization ID for `x-org-id` header
 */
export async function downloadCsvFromApi(endpoint, defaultFilename = 'export.csv', params = {}, organizationId = null) {
  if (!endpoint) {
    toast.error('Export endpoint is missing');
    return;
  }

  const toastId = toast.loading('Preparing CSV export...');

  try {
    const baseUrl = (import.meta.env.VITE_BASE_URL || '').replace(/\/+$/, '');
    const cleanPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const fullUrlString = endpoint.startsWith('http://') || endpoint.startsWith('https://')
      ? endpoint
      : `${baseUrl}${cleanPath}`;

    const url = new URL(fullUrlString);

    // Ensure format=csv is set
    url.searchParams.set('format', 'csv');

    // Append any extra filter params
    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'all') {
          url.searchParams.set(key, String(val));
        }
      });
    }

    const token = getAuthToken();
    const headers = {
      Accept: 'text/csv, application/csv, text/plain, */*',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (organizationId) {
      headers['x-org-id'] = organizationId;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Export failed with status ${response.status}`;
      try {
        const errorJson = await response.json();
        errorMessage = errorJson?.message || errorJson?.msg || errorJson?.error || errorMessage;
      } catch (_) {
        try {
          const errorText = await response.text();
          if (errorText) errorMessage = errorText;
        } catch (_) {}
      }
      throw new Error(errorMessage);
    }

    const rawText = await response.text();

    // Check if the response content is an unexpected JSON error
    try {
      const trimmed = rawText.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const errorJson = JSON.parse(trimmed);
        if (errorJson?.message || errorJson?.error) {
          throw new Error(errorJson.message || errorJson.error || 'Export returned an error payload');
        }
      }
    } catch (parseErr) {
      if (parseErr.message && !parseErr.message.includes('Unexpected token') && !parseErr.message.includes('is not valid JSON')) {
        throw parseErr;
      }
    }

    // Determine filename from Content-Disposition if provided
    let filename = defaultFilename;
    const contentDisposition = response.headers.get('content-disposition');
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match?.[1]) {
        filename = match[1].replace(/['"]/g, '').trim();
      }
    }

    if (!filename.toLowerCase().endsWith('.csv')) {
      filename = `${filename}.csv`;
    }

    // Sanitize CSV content (fix ############ issues, convert null/missing to blank, format ISO dates)
    const sanitizedCsv = sanitizeCsvText(rawText);
    const finalContent = sanitizedCsv || rawText;

    // Build Blob with UTF-8 BOM so Excel opens with proper UTF-8 decoding
    const blob = new Blob([`\uFEFF${finalContent}`], { type: 'text/csv;charset=utf-8;' });

    // Trigger browser download
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);

    toast.dismiss(toastId);
    toast.success(`Downloaded ${filename}`);
  } catch (error) {
    console.error('Failed to download CSV:', error);
    toast.dismiss(toastId);
    toast.error(error?.message || 'Failed to download CSV');
  }
}
