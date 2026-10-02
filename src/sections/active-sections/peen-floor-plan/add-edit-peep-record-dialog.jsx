import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';

import { Field, Form } from 'src/components/hook-form';

export function AddEditRecordDialog({ open, onClose, editingRecord = null }) {

  const isEdit = Boolean(editingRecord);

  const peepRecordSchema = zod.object({
    name: zod.string().min(1, { message: 'Name is required!' }),
    roomNumber: zod.string().min(1, { message: 'Room number is required!' }),
    peepLevel: zod.string().min(1, { message: 'PEEP level is required!' }),
  });

  const methods = useForm({
    resolver: zodResolver(peepRecordSchema),
    defaultValues: {
      name: '',
      roomNumber: '',
      peepLevel: 'low',
    },
  });

  useEffect(() => {
    if (!open) return;

    if (editingRecord) {
      methods.reset({
        name: editingRecord.name || '',
        roomNumber: editingRecord.roomNumber || '',
        peepLevel: editingRecord.peepLevel || 'low',
      });
    } else {
      methods.reset({
        name: '',
        roomNumber: '',
        peepLevel: 'low',
      });
    }
  }, [open, editingRecord, methods]);

  const handleClose = () => {
    methods.reset({
      name: '',
      roomNumber: '',
      peepLevel: 'low',
    });

    onClose();
  };

  const submitHandler = (data) => {
    const trimmedName = data.name.trim();

    const initials = trimmedName
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {isEdit ? 'Edit PEEP record' : 'Add PEEP record'}
      </DialogTitle>

      <DialogContent>

        <Form methods={methods} onSubmit={methods.handleSubmit(submitHandler)}>

          <Stack spacing={2} sx={{ pt: 1 }}>

            <Field.Text name="name" label="Resident name" />

            <Field.Text name="roomNumber" label="Room number" />

            <Field.Text name="peepLevel" label="PEEP level" />

          </Stack>

        </Form>
      </DialogContent>

      <DialogActions>
        <Button
          color="inherit"
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={methods.isSubmitting}
        >
          {isEdit ? 'Save changes' : 'Add record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}