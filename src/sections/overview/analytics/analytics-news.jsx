import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import CardHeader from '@mui/material/CardHeader';
import ListItemText from '@mui/material/ListItemText';

import { fToNow } from 'src/utils/format-time';

import { EmptyContent } from 'src/components/empty-content';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AnalyticsNews({ title, subheader, list, sx, ...other }) {
  return (
    <Card
      {...other}
      sx={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sx }}
    >
      <CardHeader
        title={title}
        subheader={subheader}
        sx={{ mb: 1 }}
        action={
          <Button
            size="small"
            color="inherit"
            sx={{ minWidth: 'auto', p: 0 }}
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
          >
            View all
          </Button>
        }
      />

      {!list?.length ? (
        <EmptyContent
          filled
          title="No data available"
          slotProps={{ img: { maxWidth: 96 } }}
          sx={{ height: 'auto', flex: 1, minHeight: 0, m: 2.5, mt: 0, py: 3, overflow: 'hidden' }}
        />
      ) : (
        <Scrollbar sx={{ height: 520 }}>
          <Box>
            {list.map((item) => (
              <Item key={item.id} item={item} />
            ))}
          </Box>
        </Scrollbar>
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

function Item({ item, sx, ...other }) {
  return (
    <Box
      sx={{
        py: 1.5,
        px: 2,
        gap: 1.5,
        display: 'flex',
        alignItems: 'center',
        borderBottom: (theme) =>
          `1px solid ${theme.vars.palette.divider}`,
        ...sx,
      }}
      {...other}
    >
      {/* Activity dot */}
      <Box
        sx={{
          width: 7,
          height: 7,
          flexShrink: 0,
          borderRadius: '50%',
          bgcolor:
            item.color === 'success'
              ? 'success.main'
              : item.color === 'error'
                ? 'error.main'
                : 'grey.400',
        }}
      />

      {/* Activity content */}
      <ListItemText
        primary={item.title}
        secondary={item.description}
        primaryTypographyProps={{
          noWrap: true,
          typography: 'body2',
        }}
        secondaryTypographyProps={{
          noWrap: true,
          typography: 'caption',
          color: 'text.secondary',
          sx: {
            mt: 0.25,
          },
        }}
        sx={{
          minWidth: 0,
          flex: 1,
        }}
      />

      {/* Time */}
      <Box
        sx={{
          flexShrink: 0,
          color: 'text.disabled',
          typography: 'caption',
        }}
      >
        {fToNow(item.postedAt)}
      </Box>
    </Box>
  );
}