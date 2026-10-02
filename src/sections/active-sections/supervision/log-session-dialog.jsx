
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Autocomplete from '@mui/material/Autocomplete';

import { Iconify } from 'src/components/iconify';
import { Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

// ----------------------------------------------------------------------

const TOPIC_OPTIONS = ['Wellbeing', 'Training needs', 'Caseload', 'Performance', 'Safeguarding'];

function LogSessionDialog({ open, row, onClose, onSave }) {

    const [dateHeld, setDateHeld] = useState(dayjs(new Date()));

    const [topics, setTopics] = useState([]);

    const [actionsNeeded, setActionsNeeded] = useState('');

    const [notes, setNotes] = useState('');

    const [nextDue, setNextDue] = useState(dayjs(new Date()));

    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setDateHeld(dayjs(new Date()));
            setTopics([]);
            setActionsNeeded('');
            setNotes('');
            setNextDue(dayjs(new Date()));
            setError('');
        }
    }, [open]);

    const handleSave = () => {
        if (!nextDue) {
            setError('Set the next session due date');
            return;
        }
        onSave?.({
            staffId: row?.id,
            dateHeld,
            topics,
            actionsNeeded,
            notes,
            nextDue,
        });
    };

    if (!row) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Stack spacing={0.5}>

                    <Typography variant="subtitle1">Log session</Typography>

                    <Typography variant="caption" color="text.secondary">
                        {row.name} · {row.role}
                    </Typography>
                </Stack>
                <IconButton onClick={onClose} size="small">
                    <Iconify icon="mingcute:close-line" />
                </IconButton>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.5} sx={{ pt: 0.5 }}>

                    <DatePicker
                        label="Date held"
                        value={dateHeld}
                        onChange={(event) => setDateHeld(event.target.value)}
                    />

                    <DatePicker
                        label="Next session due"
                        value={nextDue}
                        onChange={(event) => setNextDue(event.target.value)}
                    />


                    <Autocomplete
                        multiple
                        freeSolo
                        options={TOPIC_OPTIONS}
                        value={topics}
                        onChange={(event, newValue) => setTopics(newValue)}
                        renderTags={(selected, getTagProps) =>
                            selected.map((topic, index) => (
                                <Chip
                                    {...getTagProps({ index })}
                                    key={topic}
                                    label={topic}
                                    size="small"
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Topics discussed"
                                placeholder="Pick a topic or type your own"
                            />
                        )}
                    />

                    <TextField
                        label="Actions needed"
                        placeholder={'e.g. Book safeguarding refresher\nReview workload next month'}
                        helperText="One action point per line — each can be signed off individually from the session history."
                        value={actionsNeeded}
                        onChange={(event) => setActionsNeeded(event.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                    />

                    <TextField
                        label="Notes"
                        placeholder="What was discussed, agreed, or flagged"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                    />

                    <Alert severity="info" color="text.secondary">
                        {row.name.split(' ')[0]} sees only the status and date on mobile. Notes stay on web.
                    </Alert>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button color="inherit" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" color="inherit" onClick={handleSave}>
                    Save session
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default LogSessionDialog;

LogSessionDialog.propTypes = {
    open: PropTypes.bool,
    row: PropTypes.object,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
};