import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Label } from 'src/components/label';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { _courseStats, _departmentStats } from '../mocks/data';
import { TeamComplianceTable } from '../team-compliance-table';

// ----------------------------------------------------------------------

function TeamComplianceListView({ dashboardHref: dashboardHrefProp }) {
  const pathname = usePathname();
  const isSiteManager = pathname.startsWith(paths.siteManager.root);
  const { organizationId, user } = useCurrentOrganization();

  const dashboardHref =
    dashboardHrefProp ||
    (isSiteManager
      ? paths.siteManager.root
      : pathname.startsWith(paths.owner.root)
        ? paths.owner.root
        : paths.lineManager.root);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Team Compliance"
        links={[
          { name: 'Dashboard', href: dashboardHref },
          { name: 'Team Compliance' },
        ]}
        sx={{ mb: 3 }}
      />

      {/* Compliance Statistics Overview Section (reverted exactly as seen previously) */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Course Compliance Rates */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Compliance Statistics per Course
            </Typography>
            <Stack spacing={2}>
              {_courseStats.map((course) => (
                <Box key={course.key}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {course.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.compliance}% ({course.compliant}/{course.total} Compliant)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={course.compliance}
                    color={
                      course.compliance >= 90
                        ? 'success'
                        : course.compliance >= 75
                          ? 'warning'
                          : 'error'
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Department Compliance Stats */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Department Compliance Overview
            </Typography>
            <Stack spacing={2}>
              {_departmentStats.map((dept) => (
                <Stack
                  key={dept.department}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Stack>
                    <Typography variant="subtitle2">{dept.department}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dept.staffCount} Staff members
                    </Typography>
                  </Stack>
                  <Label
                    variant="soft"
                    color={
                      dept.compliance >= 90
                        ? 'success'
                        : dept.compliance >= 75
                          ? 'warning'
                          : 'error'
                    }
                  >
                    {dept.compliance}%
                  </Label>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Staff Compliance Matrix Table */}
      <TeamComplianceTable
        organizationId={organizationId}
        isSiteManager={isSiteManager}
        siteManagerBranchId={user?.branchId || user?.branch?._id}
      />
    </DashboardContent>
  );
}

export default TeamComplianceListView;