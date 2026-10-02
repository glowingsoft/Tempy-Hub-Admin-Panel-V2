import { Tab, useTheme } from '@mui/material';

import { CustomTabs } from 'src/components/custom-tabs';
import { Iconify } from 'src/components/iconify';

import { REPORT_CONFIG } from './mocks/data';
import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

export function ReportsTabs({
  selectedReport,
  onSelectReport,
  reports,
}) {

  const isMd = useResponsive("up", "md");

  return (
    <CustomTabs
      value={selectedReport}
      onChange={(_, value) => onSelectReport(value)}
      variant="scrollable"
      sx={{
        mb: 2,
        borderRadius: 1,
        width: isMd ? "720px" : "100%"

      }}
    >
      {reports.map((report) => {
        const config = REPORT_CONFIG[report];

        return (
          <Tab
            key={report}
            value={report}
            label={config.label}
            icon={<Iconify icon={config.icon} width={18} />}
            iconPosition="start"
          />
        );
      })}
    </CustomTabs>
  );
}