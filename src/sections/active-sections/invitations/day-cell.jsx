import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';


export default function DayCell({ cell, onSelect }) {
    const { label, muted, selected, outlined, dotted } = cell;

    if (muted) {
        return <Box sx={{ aspectRatio: '1/1', borderRadius: 1.5 }} />;
    }

    return (
        <ButtonBase
            onClick={() => onSelect?.(cell)}
            sx={{
                aspectRatio: '1/1',
                width: 1,
                borderRadius: 1.5,
                typography: 'subtitle2',
                flexDirection: 'column',
                gap: 0.5,
                transition: (theme) =>
                    theme.transitions.create(['background-color', 'border-color']),

                ...(selected && {
                    color: 'common.white',
                    bgcolor: 'text.primary',
                    '&:hover': { bgcolor: 'grey.700' },
                }),

                ...(!selected &&
                    outlined && {
                    color: 'text.primary',
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                    border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.32)}`,
                    '&:hover': {
                        borderColor: 'text.disabled',
                    },
                }),

                ...(!selected &&
                    !outlined && {
                    color: 'text.disabled',
                    bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                    '&:hover': {
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.16),
                    },
                }),
            }}
        >
            <Box component="span">{label}</Box>

            {dotted && (
                <Box
                    component="span"
                    sx={{
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        bgcolor: selected ? 'common.white' : 'text.primary',
                    }}
                />
            )}
        </ButtonBase>
    );
}

DayCell.propTypes = {
    cell: PropTypes.shape({
        label: PropTypes.string,
        muted: PropTypes.bool,
        selected: PropTypes.bool,
        outlined: PropTypes.bool,
        dotted: PropTypes.bool,
    }).isRequired,
    onSelect: PropTypes.func,
};