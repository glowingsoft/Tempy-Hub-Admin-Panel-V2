import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { Field, Form } from 'src/components/hook-form';

import { createPeepRecord, PEEP_LEVELS, RESIDENTS, updatePeepRecord } from './mocks/data';

const PeepRecordSchema = zod.object({
    residentId: zod.string().min(1, { message: 'Resident is required!' }),
    peepLevel: zod.string().min(1, { message: 'PEEP level is required!' }),
    supportNeeds: zod.string().min(1, { message: 'Support needs are required!' }),
    primaryRoute: zod.string(),
    secondaryRoute: zod.string(),
    equipmentRequired: zod.string(),
    responsibleStaff: zod.string(),
});

export function PeepRecordNewEditForm({ currentRecord, ownerDashboard = true }) {
    const router = useRouter();
    const isEdit = Boolean(currentRecord);
    const base = ownerDashboard ? paths.owner : paths.siteManager;

    const defaultValues = useMemo(
        () => ({
            residentId: currentRecord?.residentId || '',
            peepLevel: currentRecord?.peepLevel || 'low',
            supportNeeds: currentRecord?.supportNeeds || '',
            primaryRoute: currentRecord?.primaryRoute || '',
            secondaryRoute: currentRecord?.secondaryRoute || '',
            equipmentRequired: currentRecord?.equipmentRequired || '',
            responsibleStaff: currentRecord?.responsibleStaff || '',
        }),
        [currentRecord]
    );

    const methods = useForm({ resolver: zodResolver(PeepRecordSchema), defaultValues });
    const { handleSubmit, formState: { isSubmitting } } = methods;

    const onSubmit = handleSubmit(async (values) => {
        try {
            const saved = isEdit ? updatePeepRecord(currentRecord.id, values) : createPeepRecord(values);
            toast.success(isEdit ? 'PEEP record updated successfully!' : 'PEEP record created successfully!');
            if (saved) router.push(base.peepAndFloorPlans.records.root);
        } catch (error) {
            toast.error(error?.message || 'Something went wrong. Please try again.');
        }
    });

    return (
        <Form methods={methods} onSubmit={onSubmit}>
            <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 3 }}>PEEP record</Typography>
                    <Box rowGap={3} columnGap={2} display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, 1fr)' }}>
                        <Field.Select name="residentId" label="Resident" disabled={isEdit}>
                            {RESIDENTS.map((resident) => (
                                <MenuItem key={resident.id} value={resident.id}>{resident.name} - Room {resident.roomNumber}</MenuItem>
                            ))}
                        </Field.Select>
                        <Field.Select name="peepLevel" label="PEEP level">
                            {Object.entries(PEEP_LEVELS).map(([value, level]) => (
                                <MenuItem key={value} value={value}>{level.label} - {level.description}</MenuItem>
                            ))}
                        </Field.Select>
                        <Field.Text name="supportNeeds" label="Support needs" multiline rows={3} sx={{ gridColumn: { sm: '1 / -1' } }} />
                        <Field.Text name="primaryRoute" label="Primary route" multiline rows={3} />
                        <Field.Text name="secondaryRoute" label="Secondary route" multiline rows={3} />
                        <Field.Text name="equipmentRequired" label="Equipment required" multiline rows={3} />
                        <Field.Text name="responsibleStaff" label="Responsible staff" multiline rows={3} />
                    </Box>
                </Card>
                <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                    <Button color="inherit" onClick={() => router.push(base.peepAndFloorPlans.records.root)}>Cancel</Button>
                    <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                        {isEdit ? 'Save changes' : 'Create PEEP record'}
                    </LoadingButton>
                </Stack>
            </Stack>
        </Form>
    );
}
