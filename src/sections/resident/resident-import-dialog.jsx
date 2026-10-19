import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Field, Form } from 'src/components/hook-form';

const REQUIRED_COLUMNS = ['name', 'email', 'roomNumber'];

const parseCsv = (text) => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) return { rows: [], error: 'The CSV file must include a header and at least one resident.' };

    const headers = lines[0].split(',').map((header) => header.trim().replace(/^"|"$/g, ''));
    const missingColumns = REQUIRED_COLUMNS.filter((column) => !headers.includes(column));
    if (missingColumns.length) {
        return { rows: [], error: `Missing required columns: ${missingColumns.join(', ')}` };
    }

    const rows = lines.slice(1).map((line) => {
        const values = line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''));
        return headers.reduce((row, header, index) => ({ ...row, [header]: values[index] || '' }), {});
    });

    return { rows, error: '' };
};

export function ResidentImportDialog({ open, onClose, onImport }) {
    const [rows, setRows] = useState([]);
    const [error, setError] = useState('');
    const methods = useForm({ defaultValues: { file: null } });
    const { reset, setValue, watch } = methods;
    const file = watch('file');

    const clearDialog = () => {
        setRows([]);
        setError('');
        reset({ file: null });
    };

    const handleClose = () => {
        clearDialog();
        onClose();
    };

    useEffect(() => {
        if (!file) {
            setRows([]);
            setError('');
            return undefined;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const result = parseCsv(String(reader.result || ''));
            setRows(result.rows);
            setError(result.error);
        };
        reader.onerror = () => setError('Unable to read this file.');
        reader.readAsText(file);

        return () => reader.abort();
    }, [file]);

    const handleImport = methods.handleSubmit(() => {
        if (!rows.length || error) return;
        onImport(rows);
        handleClose();
    });

    return (
        <Dialog fullWidth maxWidth="sm" open={open} onClose={handleClose}>
            <DialogTitle>Import residents from CSV</DialogTitle>
            <Form methods={methods} onSubmit={handleImport}>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Required columns: name, email, roomNumber. Optional columns: phone, careLevel, status.
                        </Typography>
                        <Field.Upload
                            name="file"
                            accept={{ 'text/csv': ['.csv'] }}
                            maxSize={5 * 1024 * 1024}
                            helperText="CSV files only, up to 5 MB"
                            onDelete={() => setValue('file', null, { shouldValidate: true })}
                        />
                        {error && <Alert severity="error">{error}</Alert>}
                        {!error && rows.length > 0 && (
                            <Alert severity="success">{rows.length} resident{rows.length === 1 ? '' : 's'} ready to import.</Alert>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" color="primary" disabled={!rows.length || !!error} startIcon={<Iconify icon="solar:upload-bold" />}>
                        Import residents
                    </Button>
                </DialogActions>
            </Form>
        </Dialog>
    );
}
