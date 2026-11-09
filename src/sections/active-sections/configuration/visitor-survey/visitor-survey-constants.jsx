import PropTypes from 'prop-types';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export const ALL_SITES_OPTION = { value: 'all', label: 'All sites' };

export const mapVisitorBranchOption = (branch) => ({
  value: branch._id,
  label: branch.name,
});

export const mapVisitorStaffOption = (profile) => {
  const branch = profile.branchId || profile.branch;

  return {
    value: profile._id,
    label: profile.userId?.name || profile.user?.name || profile.employeeCode || profile._id,
    branchId: typeof branch === 'object' ? branch?._id : branch,
  };
};

export const RATING_LABELS = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export const RATING_COLORS = {
  1: 'error',
  2: 'warning',
  3: 'info',
  4: 'primary',
  5: 'success',
};

export const QUESTION_TYPE_LABELS = {
  yesNo: 'Yes / No',
  singleSelect: 'Single Select',
  rating: 'Star Rating',
  text: 'Text / Comment',
};

export const QUESTION_TYPE_COLORS = {
  yesNo: 'primary',
  singleSelect: 'info',
  rating: 'warning',
  text: 'secondary',
};

export const QUESTION_TYPES = [
  {
    value: 'yesNo',
    label: 'Yes / No',
    description: 'Two-choice yes or no answers',
    icon: 'solar:list-check-bold',
    color: 'primary',
  },
  {
    value: 'singleSelect',
    label: 'Single Select',
    description: 'Pick one option from a list',
    icon: 'solar:menu-dots-square-bold',
    color: 'info',
  },
  {
    value: 'rating',
    label: 'Star Rating',
    description: '1 to 5 stars visual rating scale',
    icon: 'solar:star-bold',
    color: 'warning',
  },
  {
    value: 'text',
    label: 'Text Comment',
    description: 'Free-form comment or notes box',
    icon: 'solar:text-bold',
    color: 'secondary',
  },
];

export const QUICK_PRESETS = [
  { label: 'Yes / No', values: ['Yes', 'No'] },
  { label: 'Rating Scale', values: ['Excellent', 'Good', 'Fair', 'Poor'] },
  { label: 'Agreement', values: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree'] },
];

// ----------------------------------------------------------------------

export function CompactOptionCard({ icon, label, checked, onChange, disabled }) {
  return (
    <Card
      variant="outlined"
      onClick={() => {
        if (!disabled) onChange(!checked);
      }}
      sx={{
        py: 1,
        px: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
        borderRadius: 1.25,
        borderColor: checked ? 'primary.main' : 'divider',
        bgcolor: (theme) =>
          checked
            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.04)
            : 'background.paper',
        transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
        '&:hover': {
          borderColor: disabled ? undefined : 'primary.main',
        },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Iconify
          icon={icon}
          width={18}
          sx={{ color: checked ? 'primary.main' : 'text.disabled' }}
        />
        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>
          {label}
        </Typography>
      </Stack>

      <Switch
        size="small"
        disabled={disabled}
        checked={Boolean(checked)}
        onChange={(e) => {
          e.stopPropagation();
          if (!disabled) onChange(e.target.checked);
        }}
      />
    </Card>
  );
}

CompactOptionCard.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

// ----------------------------------------------------------------------

export function SectionTitle({ icon, title }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Iconify icon={icon} width={17} sx={{ color: 'text.secondary' }} />
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
    </Stack>
  );
}

SectionTitle.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};

