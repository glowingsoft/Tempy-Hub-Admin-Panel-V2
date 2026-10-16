import PropTypes from 'prop-types';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function StaffResidentFamilyDialog({ open, onClose, resident }) {
  if (!resident) return null;

  const familyMembers = resident.familyMembers || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            alt={resident.resident}
            src={resident.avatarUrl}
            sx={{ width: 44, height: 44 }}
          >
            {resident.resident?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h6">{resident.resident}</Typography>
            <Typography variant="body2" color="text.secondary">
              Room {resident.room} · Family Contacts Directory
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5 }}>
        {familyMembers.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.neutral',
              borderRadius: 1.5,
            }}
          >
            <Iconify
              icon="solar:users-group-rounded-linear"
              width={48}
              sx={{ color: 'text.secondary', mb: 1 }}
            />
            <Typography variant="subtitle2">No family members linked yet</Typography>
            <Typography variant="caption" color="text.secondary">
              Only a manager can link or invite family contacts for this resident.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {familyMembers.map((member, index) => (
              <Card
                key={member.id || index}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: 1.5,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: member.isNok ? 'primary.main' : 'grey.600' }}>
                    {member.name?.charAt(0)}
                  </Avatar>

                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle2">{member.name}</Typography>
                      {member.isNok && (
                        <Label variant="soft" color="primary">
                          Next of Kin
                        </Label>
                      )}
                      <Chip
                        size="small"
                        label={member.relationship}
                        variant="outlined"
                        sx={{ fontSize: 11, height: 20 }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={2} sx={{ color: 'text.secondary', fontSize: 13 }}>
                      {member.phone && (
                        <Stack direction="row" spacing={0.5} alignItems="center" component="a" href={`tel:${member.phone}`} sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                          <Iconify icon="solar:phone-bold" width={14} />
                          <span>{member.phone}</span>
                        </Stack>
                      )}
                      {member.email && (
                        <Stack direction="row" spacing={0.5} alignItems="center" component="a" href={`mailto:${member.email}`} sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
                          <Iconify icon="solar:letter-bold" width={14} />
                          <span>{member.email}</span>
                        </Stack>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

StaffResidentFamilyDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  resident: PropTypes.object,
};

export default StaffResidentFamilyDialog;