import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { OwnerBranchFilterActions } from 'src/sections/branch/owner-branch-select';

// ----------------------------------------------------------------------

export function AttendanceHeader({ ownerDashboard, branchId, onBranchChange, onExportCSV }) {
  const exportButton = (
    <Button
      variant="contained"
      color="primary"
      startIcon={<Iconify icon="solar:export-bold" />}
      onClick={onExportCSV}
    >
      Export to CSV
    </Button>
  );

  return (
    <CustomBreadcrumbs
      heading="Attendance"
      links={[
        {
          name: 'Dashboard',
          href: ownerDashboard ? paths.owner.root : paths.lineManager.root,
        },
        { name: 'Attendance' },
      ]}
      action={
        ownerDashboard ? (
          <OwnerBranchFilterActions value={branchId} onChange={onBranchChange}>
            {exportButton}
          </OwnerBranchFilterActions>
        ) : (
          exportButton
        )
      }
      sx={{ mb: { xs: 3, md: 5 } }}
    />
  );
}
