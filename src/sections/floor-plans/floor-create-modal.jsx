import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';

import { Field, Form } from 'src/components/hook-form';
import { toast } from 'src/components/snackbar';

// import { useCreateFloorMutation } from 'src/store/Reducer/floor-plans-api';

// ----------------------------------------------------------------------

const FloorSchema = zod.object({
  name: zod.string().min(1, { message: 'Floor name is required!' }),
  branchId: zod.string().min(1, { message: 'Site is required!' }),
});

// ----------------------------------------------------------------------

// A floor is just a label + site to start with — no PDF needed yet, that's
// uploaded later from the list (see FloorPlanUploadDialog).
export function FloorCreateModal({ open, onClose, siteOptions, defaultBranchId, onSuccess }) {
  const defaultValues = useMemo(
    () => ({ name: '', branchId: defaultBranchId || siteOptions[0]?.value || '' }),
    [defaultBranchId, siteOptions]
  );

  const methods = useForm({ resolver: zodResolver(FloorSchema), defaultValues });

  const handleClose = () => {
    onClose();
    methods.reset(defaultValues);
  };

  const onSubmit = methods.handleSubmit(async (data) => {
    try {
      // TODO: replace with the real mutation once the endpoint is wired up.
      // await createFloor(data).unwrap();

      onSuccess?.(data);
      toast.success('Floor added successfully!');
      handleClose();
    } catch (error) {
      toast.error(error?.data?.message || 'Something went wrong. Please try again.');
    }
  });

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ pb: 0 }}>Add Floor</DialogTitle>

        <DialogContent>
          <Box sx={{ mt: 3, gap: 2, display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)' }}>
            <Field.Select name="branchId" label="Site">
              {siteOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Field.Select>

            <Field.Text name="name" label="Floor / wing label" placeholder="e.g. Second Floor" />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>

          <LoadingButton type="submit" variant="contained" loading={methods.formState.isSubmitting}>
            Add Floor
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
