import Tab from '@mui/material/Tab';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import { tabClasses } from '@mui/material/Tab';

import { Iconify } from 'src/components/iconify';

import { VIEW_TABS } from '../constants';

// ----------------------------------------------------------------------

export function AttendanceViewTabs({ value, onChange }) {
  return (
    <Tabs
      value={value}
      onChange={onChange}
      variant="scrollable"
      allowScrollButtonsMobile
      sx={{
        mb: 3,
        minHeight: 48,
        borderBottom: 1,
        borderColor: 'divider',
        [`& .${tabsClasses.indicator}`]: {
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
        [`& .${tabClasses.root}`]: {
          minHeight: 48,
          minWidth: 'auto',
          px: 2.5,
          mr: 1,
          textTransform: 'none',
          fontWeight: 600,
          color: 'text.secondary',
          [`&.${tabClasses.selected}`]: {
            color: 'text.primary',
          },
        },
      }}
    >
      {VIEW_TABS.map((tab) => (
        <Tab
          key={tab.value}
          value={tab.value}
          label={tab.label}
          icon={<Iconify icon={tab.icon} width={18} />}
          iconPosition="start"
        />
      ))}
    </Tabs>
  );
}
