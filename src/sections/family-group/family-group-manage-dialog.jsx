import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { alpha, useTheme } from '@mui/material/styles';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const RELATIONSHIP_OPTIONS = [
  'Daughter',
  'Son',
  'Spouse / Partner',
  'Granddaughter',
  'Grandson',
  'Sister',
  'Brother',
  'Niece',
  'Nephew',
  'Legal Guardian',
  'Family Friend',
  'Other Relative',
];

const ROLE_OPTIONS = [
  { value: 'Primary Admin', label: 'Primary Admin' },
  { value: 'Member', label: 'Member' },
  { value: 'Visitor', label: 'Visitor / Contact' },
];

// ----------------------------------------------------------------------

export function FamilyGroupManageDialog({ open, onClose, group, onUpdateGroup }) {
  const theme = useTheme();

  // Form states for adding a member
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Daughter');
  const [role, setRole] = useState('Member');
  const [isNok, setIsNok] = useState(false);
  const [errors, setErrors] = useState({});

  const residentName = group?.resident || group?.name || 'Resident';
  const membersList = group?.membersList || [];

  const handleResetForm = useCallback(() => {
    setName('');
    setEmail('');
    setPhone('');
    setRelation('Daughter');
    setRole('Member');
    setIsNok(false);
    setErrors({});
  }, []);

  const handleAddMember = useCallback(() => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const newMember = {
      id: `mem-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '—',
      relation,
      role,
      isNok: Boolean(isNok),
      status: 'Active',
    };

    const updatedList = [...membersList, newMember];

    const updatedGroup = {
      ...group,
      membersList: updatedList,
      members: updatedList.length,
      status: group.status === 'no_family' ? 'active' : group.status,
      statusLabel: group.status === 'no_family' ? 'Active' : group.statusLabel,
    };

    if (isNok) {
      updatedGroup.nextOfKin = newMember.name;
      updatedGroup.nextOfKinRelationship = newMember.relation;
      updatedGroup.nextOfKinEmail = newMember.email;
      updatedGroup.nextOfKinPhone = newMember.phone;
    }

    onUpdateGroup?.(updatedGroup);
    toast.success(`Added ${newMember.name} to ${residentName}'s family group!`);
    handleResetForm();
  }, [
    name,
    email,
    phone,
    relation,
    role,
    isNok,
    membersList,
    group,
    residentName,
    onUpdateGroup,
    handleResetForm,
  ]);

  const handleRemoveMember = useCallback(
    (memberId) => {
      const removed = membersList.find((m) => m.id === memberId);
      const updatedList = membersList.filter((m) => m.id !== memberId);

      const updatedGroup = {
        ...group,
        membersList: updatedList,
        members: updatedList.length,
        status: updatedList.length === 0 ? 'no_family' : group.status,
        statusLabel: updatedList.length === 0 ? 'No family' : group.statusLabel,
      };

      if (removed?.isNok) {
        const nextNok = updatedList.find((m) => m.isNok) || null;
        updatedGroup.nextOfKin = nextNok ? nextNok.name : null;
        updatedGroup.nextOfKinRelationship = nextNok ? nextNok.relation : '';
        updatedGroup.nextOfKinEmail = nextNok ? nextNok.email : '';
        updatedGroup.nextOfKinPhone = nextNok ? nextNok.phone : '';
      }

      onUpdateGroup?.(updatedGroup);
      toast.info(`Removed ${removed?.name || 'member'} from family group`);
    },
    [membersList, group, onUpdateGroup]
  );

  if (!group) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              alt={residentName}
              src={group.avatarUrl || group.image}
              sx={{
                width: 44,
                height: 44,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: 'primary.main',
                fontWeight: 700,
              }}
            >
              {residentName.charAt(0)}
            </Avatar>
            <Stack spacing={0.25}>
              <Typography variant="h6">Manage Family Group</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {residentName} · Room {group.room || group.roomNumber || '—'}
              </Typography>
            </Stack>
          </Stack>

          <IconButton onClick={onClose} size="small">
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5, pb: 3 }}>
        {/* Existing Members Section */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Linked Family Members ({membersList.length})
            </Typography>
          </Stack>

          {membersList.length === 0 ? (
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.grey[500], 0.04),
                border: `1px dashed ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No family members linked to this resident yet. Use the form below to add members.
              </Typography>
            </Card>
          ) : (
            <Stack spacing={1.5}>
              {membersList.map((member) => (
                <Card
                  key={member.id}
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: member.isNok
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.grey[500], 0.15),
                        color: member.isNok ? 'primary.main' : 'text.primary',
                        fontWeight: 600,
                      }}
                    >
                      {member.name.charAt(0)}
                    </Avatar>

                    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {member.name}
                        </Typography>
                        {member.isNok && (
                          <Chip
                            size="small"
                            label="Next of Kin"
                            color="primary"
                            variant="soft"
                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                          />
                        )}
                        <Label
                          variant="soft"
                          color={member.status?.toLowerCase() === 'active' ? 'success' : 'warning'}
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        >
                          {member.status || 'Active'}
                        </Label>
                      </Stack>

                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {member.relation} · {member.role || 'Member'} · {member.email} · {member.phone}
                      </Typography>
                    </Stack>
                  </Stack>

                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveMember(member.id)}
                    sx={{ ml: 1 }}
                    title="Remove member"
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Add Member Form Section */}
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Add Family Member to Group
          </Typography>

          <Stack spacing={2.5}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                label="Full Name"
                placeholder="e.g. Sarah Hughes"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                error={Boolean(errors.name)}
                helperText={errors.name}
                fullWidth
                size="small"
                required
              />

              <TextField
                label="Email Address"
                placeholder="e.g. sarah.h@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                error={Boolean(errors.email)}
                helperText={errors.email}
                fullWidth
                size="small"
                required
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
              }}
            >
              <TextField
                label="Phone Number"
                placeholder="e.g. +44 7700 900123"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                fullWidth
                size="small"
              />

              <TextField
                select
                label="Relationship to Resident"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                fullWidth
                size="small"
              >
                {RELATIONSHIP_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
                alignItems: 'center',
              }}
            >
              <TextField
                select
                label="Portal Role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                fullWidth
                size="small"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <FormControlLabel
                control={
                  <Switch
                    checked={isNok}
                    onChange={(e) => setIsNok(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Stack spacing={0}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Designate as Next of Kin (NOK)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Primary contact for care & emergency notices
                    </Typography>
                  </Stack>
                }
              />
            </Box>

            <Stack direction="row" justifyContent="flex-end" sx={{ pt: 1 }}>
              <Button
                variant="contained"
                startIcon={<Iconify icon="solar:user-plus-bold" />}
                onClick={handleAddMember}
              >
                Add Member to Group
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
}

FamilyGroupManageDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  group: PropTypes.object,
  onUpdateGroup: PropTypes.func,
};