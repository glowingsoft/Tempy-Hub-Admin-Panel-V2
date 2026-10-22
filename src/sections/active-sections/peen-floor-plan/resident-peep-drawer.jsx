import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from 'react';

import { Iconify } from 'src/components/iconify';
import { PEEP_LEVELS } from './mocks/data';
import { Avatar } from '@mui/material';


export function ResidentPeepDrawer({
  resident,
  open,
  inline = false,
  onClose,
  onUpdate,
}) {
  if (!resident) return null;

  return (
    inline ? (
      <DetailPanel resident={resident} inline onClose={onClose} onUpdate={onUpdate} />
    ) : (
      <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 420 } } }}>
        <DetailPanel resident={resident} onClose={onClose} onUpdate={onUpdate} />
      </Drawer>
    )
  );
}

function DetailPanel({ resident, inline = false, onClose, onUpdate }) {
  const level = PEEP_LEVELS[resident.peepLevel];
  const [expandedSection, setExpandedSection] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // `supportNeeds`/`primaryRoute`/etc are set by the Add Pin wizard; older
  // seed residents don't have them, so fall back to the generic level
  // description / notes field they were created with.
  const sections = [
    { label: 'Support needs', icon: 'solar:users-group-rounded-linear', content: resident.supportNeeds || level.description },
    { label: 'Primary evacuation route', icon: 'solar:running-round-linear', content: resident.primaryRoute || resident.notes || 'No primary route recorded.' },
    { label: 'Secondary route', icon: 'solar:running-round-linear', content: resident.secondaryRoute || 'No secondary route recorded.' },
    { label: 'Equipment required', icon: 'icon-park-outline:wheelchair', content: resident.equipmentRequired || resident.peepSummary },
    { label: 'Staff responsibilities', icon: 'solar:user-linear', content: resident.responsibleStaff || `Contact ${resident.emergencyContact?.name || 'the resident emergency contact'} if assistance is required.` },
  ];

  const handleSave = (updates) => {
    onUpdate?.({ ...resident, ...updates });
    setEditOpen(false);
  };

  return (
    <Stack sx={{ height: inline ? 'auto' : 1 }}>
      {/* Inline usage (e.g. Resident detail page) already shows a header with
          the resident's name/avatar, so this panel's own header is redundant there. */}
      {!inline && (
        <>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: 2 }}
          >
            <Typography variant="subtitle2">PEEP detail — selected resident</Typography>

            <IconButton onClick={onClose}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>

          <Divider />

          <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={2} alignItems="center">

              <Avatar alt={resident.name} src={resident.avatar || resident.image} />

              <Box>
                <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
                  {resident.name}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Room {resident.roomNumber}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ mb: 2 }} />
        </>
      )}

      {sections.map((section) => {
        const expanded = expandedSection === section.label;

        return (
          <Box key={section.label} sx={{ mx: inline ? 0 : 2, mb: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
            <Button
              fullWidth
              color="inherit"
              onClick={() => setExpandedSection(expanded ? null : section.label)}
              sx={{ justifyContent: 'flex-start', px: 1.5, py: 1.25, textTransform: 'none', gap: 1.25 }}
              startIcon={<Iconify icon={section.icon} width={20} color="text.secondary" />}
              endIcon={<Iconify icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} width={17} color="text.secondary" />}
            >
              <Typography variant="body2" sx={{ flex: 1, textAlign: 'left' }}>{section.label}</Typography>
            </Button>
            {expanded && <Typography variant="body2" color="text.secondary" sx={{ px: 5, pb: 1.5 }}>{section.content}</Typography>}
          </Box>
        );
      })}

      <Box sx={{ mx: inline ? 0 : 2, mt: 1, px: 1.5, py: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Iconify icon="solar:bell-linear" width={20} color="text.secondary" />
        <Typography variant="body2" sx={{ flex: 1 }}>Fire drill notifications enabled</Typography>
        <Box onClick={() => setNotificationsEnabled((current) => !current)} sx={{ width: 29, height: 18, borderRadius: 9, bgcolor: notificationsEnabled ? 'success.main' : 'grey.400', p: 0.25, cursor: 'pointer' }}><Box sx={{ bgcolor: 'common.white', width: 14, height: 14, borderRadius: '50%', ml: notificationsEnabled ? 'auto' : 0 }} /></Box>
      </Box>

      {!inline && <Box sx={{ flex: 1 }} />}

      <Box sx={{ p: inline ? 0 : 3, pt: inline ? 2 : 3 }}>
        <Button
          fullWidth={!inline}
          variant="contained"
          startIcon={<Iconify icon="solar:pen-bold" />}
          onClick={() => setEditOpen(true)}
        >
          Edit PEEP Record
        </Button>
      </Box>

      <EditPeepDialog open={editOpen} resident={resident} onClose={() => setEditOpen(false)} onSave={handleSave} />
    </Stack>
  );
}

function EditPeepDialog({ open, resident, onClose, onSave }) {
  const [name, setName] = useState(resident.name);
  const [roomNumber, setRoomNumber] = useState(resident.roomNumber);
  const [peepLevel, setPeepLevel] = useState(resident.peepLevel);

  const handleOpen = () => {
    setName(resident.name);
    setRoomNumber(resident.roomNumber);
    setPeepLevel(resident.peepLevel);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" TransitionProps={{ onEnter: handleOpen }}>
      <DialogTitle>Edit PEEP record</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField label="Resident name" value={name} onChange={(event) => setName(event.target.value)} />
          <TextField label="Room number" value={roomNumber} onChange={(event) => setRoomNumber(event.target.value)} />
          <TextField select label="PEEP level" value={peepLevel} onChange={(event) => setPeepLevel(event.target.value)}>
            {Object.entries(PEEP_LEVELS).map(([key, item]) => <MenuItem key={key} value={key}>{item.label}</MenuItem>)}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave({ name, roomNumber, peepLevel })}>Save changes</Button>
      </DialogActions>
    </Dialog>
  );
}