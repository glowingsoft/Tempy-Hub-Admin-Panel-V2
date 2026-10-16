import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { useColorScheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { useSettingsContext } from 'src/components/settings/context';

// ----------------------------------------------------------------------

export function ThemeToggleButton({ sx, ...other }) {
  const settings = useSettingsContext();
  const { mode, setMode } = useColorScheme();

  const isDark = (mode || settings.colorScheme) === 'dark';
  const nextMode = isDark ? 'light' : 'dark';

  const handleToggle = () => {
    settings.onUpdateField('colorScheme', nextMode);
    setMode(nextMode);
  };

  return (
    <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
      <IconButton
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={handleToggle}
        sx={{ p: 0, width: 40, height: 40, ...sx }}
        {...other}
      >
        <Iconify icon={isDark ? 'solar:sun-2-bold' : 'famicons:moon-sharp'} width={22} />
      </IconButton>
    </Tooltip>
  );
}
