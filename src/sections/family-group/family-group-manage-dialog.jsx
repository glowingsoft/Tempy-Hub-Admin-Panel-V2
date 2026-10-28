import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetResidentsQuery } from 'src/store/Reducer/residents-api';
import {
  useGetFamilyRelationshipsQuery,
  useInviteFamilyMemberMutation,
  useDecideFamilyInvitationMutation,
} from 'src/store/Reducer/family-invitations-api';

import { getInvitationId } from './mocks/data';

// ----------------------------------------------------------------------

const mapResidentOption = (resident) => ({
  value: resident._id || resident.id,
  label: resident.name
    ? resident.roomNumber
      ? `${resident.name} - Room ${resident.roomNumber}`
      : resident.name
    : resident._id,
});

export function FamilyGroupManageDialog({ open, onClose, invitation = null, defaultResident = null }) {
  const invitationId = getInvitationId(invitation);
  const isEdit = Boolean(invitationId);
  const { organizationId } = useCurrentOrganization();
  const residentQueryArgs = useMemo(() => ({ organizationId }), [organizationId]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isNok, setIsNok] = useState(false);
  const [resident, setResident] = useState(null);
  const [errors, setErrors] = useState({});

  const { data: relationshipOptions = [] } = useGetFamilyRelationshipsQuery(undefined, {
    skip: !open,
  });

  const [inviteFamilyMember, { isLoading: isInviting }] = useInviteFamilyMemberMutation();
  const [decideFamilyInvitation, { isLoading: isSaving }] = useDecideFamilyInvitationMutation();
  const saving = isInviting || isSaving;

  useEffect(() => {
    if (!open) return;

    setName(invitation?.name || '');
    setEmail(invitation?.email || '');
    setRelationship(invitation?.relationship || '');
    setIsNok(Boolean(invitation?.isNextOfKin));
    setResident(
      invitation?.residentId
        ? {
            value: invitation.residentId,
            label: invitation.residentName
              ? invitation.roomNumber
                ? `${invitation.residentName} - Room ${invitation.roomNumber}`
                : invitation.residentName
              : 'Selected resident',
          }
        : defaultResident
    );
    setErrors({});
  }, [open, invitation, defaultResident]);

  const handleClose = () => {
    if (saving) return;
    onClose?.();
  };

  const validate = useCallback(() => {
    const nextErrors = {};
    if (!name.trim()) nextErrors.name = 'Full name is required';
    if (!isEdit) {
      if (!email.trim()) nextErrors.email = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(email.trim())) nextErrors.email = 'Enter a valid email address';
      if (!resident?.value) nextErrors.resident = 'Please select a resident';
    }
    if (!relationship) nextErrors.relationship = 'Please select a relationship';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }, [email, isEdit, name, relationship, resident]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    try {
      if (isEdit) {
        await decideFamilyInvitation({
          organizationId,
          familyInvitationId: invitationId,
          action: 'edit',
          name: name.trim(),
          relationship,
        }).unwrap();
        toast.success('Invitation updated');
      } else {
        await inviteFamilyMember({
          organizationId,
          email: email.trim(),
          name: name.trim(),
          residentId: resident.value,
          relationship,
          isNextOfKin: isNok,
        }).unwrap();
        toast.success('Family invitation sent');
      }
      onClose?.();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Unable to save invitation');
    }
  }, [
    decideFamilyInvitation,
    email,
    invitationId,
    inviteFamilyMember,
    isEdit,
    isNok,
    name,
    onClose,
    organizationId,
    relationship,
    resident,
    validate,
  ]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{isEdit ? 'Edit invitation' : 'Invite family member'}</Typography>
          <IconButton onClick={handleClose} size="small" disabled={saving}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5, pb: 3 }}>
        <Stack spacing={2.5}>
          <InfiniteAutocomplete
            value={resident}
            onChange={(option) => {
              setResident(option);
              if (errors.resident) setErrors((prev) => ({ ...prev, resident: '' }));
            }}
            useQuery={useGetResidentsQuery}
            queryArgs={residentQueryArgs}
            mapOption={mapResidentOption}
            label="Resident"
            placeholder="Search resident..."
            error={Boolean(errors.resident)}
            helperText={errors.resident}
            disabled={!organizationId || isEdit || Boolean(defaultResident?.value)}
            enabled={Boolean(open && organizationId)}
            size="small"
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <TextField
              label="Full name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              size="small"
              required
            />

            <TextField
              label="Email address"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              error={Boolean(errors.email)}
              helperText={errors.email}
              fullWidth
              size="small"
              required
              disabled={isEdit}
            />
          </Box>

          <TextField
            select
            label="Relationship"
            value={relationship}
            onChange={(event) => {
              setRelationship(event.target.value);
              if (errors.relationship) setErrors((prev) => ({ ...prev, relationship: '' }));
            }}
            error={Boolean(errors.relationship)}
            helperText={errors.relationship}
            fullWidth
            size="small"
            required
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  sx: { maxHeight: 220 },
                },
              },
            }}
          >
            {relationshipOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          {!isEdit && (
            <FormControlLabel
              control={
                <Switch
                  checked={isNok}
                  onChange={(event) => setIsNok(event.target.checked)}
                  color="primary"
                />
              }
              label={
                <Stack spacing={0}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Next of kin
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Primary contact for care and emergency notices
                  </Typography>
                </Stack>
              }
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {isEdit ? 'Save changes' : 'Send invitation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FamilyGroupManageDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  invitation: PropTypes.object,
  defaultResident: PropTypes.object,
};
