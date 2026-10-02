import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Iconify } from 'src/components/iconify';
import { Button } from '@mui/material';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

const DEFAULT_ITEMS = [
    {
        id: 1,
        title: 'Upcoming meeting',
        status: 'Confirmed',
    },
    {
        id: 2,
        title: 'Upcoming meeting',
        status: 'Pending',
    },
    {
        id: 3,
        title: 'Upcoming meeting',
        status: 'Confirmed',
    },
    {
        id: 4,
        title: 'Upcoming meeting',
        status: 'Rejected',
    },
    {
        id: 5,
        title: 'Upcoming meeting',
        status: 'Confirmed',
    }
];

// ----------------------------------------------------------------------

const STATUS_STYLES = {
    Confirmed: "success",
    Pending: "warning",
    Rejected: "error"
};

// ----------------------------------------------------------------------

function UpcomingItem({ item }) {
    const statusStyle = STATUS_STYLES[item.status] ?? STATUS_STYLES.Confirmed;

    return (
        <Box
            sx={{
                border: '1px solid',
                borderColor: '#E0E0E0',
                borderRadius: 1.5,
                px: 1.5,
                pt: 2,
                minHeight: 86,
            }}
        >
            <Stack spacing={0.8}>
                <Box
                    sx={{
                        width: '90%',
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#E3E3E3',
                    }}
                />

                <Box
                    sx={{
                        width: '60%',
                        height: 10,
                        borderRadius: 5,
                        bgcolor: '#E3E3E3',
                    }}
                />


                <Box> <Label color={statusStyle}>{item.status}</Label></Box>
            </Stack>
        </Box>
    );
}

// ----------------------------------------------------------------------

export function UpcomingList({
    items = DEFAULT_ITEMS,
    onViewAll,
    title = 'Upcoming',
}) {
    return (
        <Card sx={{ p: 2 }}
        >
            {/* Header */}
            <Stack
                direction="row"
                alignItems="flex-start"
                justifyContent="space-between"
                sx={{ mb: 1.5 }}
            >

                <Typography variant="subtitle1">{title}</Typography>
                <Box sx={{ textAlign: 'right' }}>
                    <Button
                        size="small"
                        color="inherit"
                        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
                    >
                        View all
                    </Button>
                </Box>
            </Stack>

            {/* Items */}
            <Stack spacing={1.25}>
                {items.map((item) => (
                    <UpcomingItem key={item.id} item={item} />
                ))}
            </Stack>
        </Card>
    );
}

UpcomingList.propTypes = {
    items: PropTypes.array,
    onViewAll: PropTypes.func,
    title: PropTypes.string,
};