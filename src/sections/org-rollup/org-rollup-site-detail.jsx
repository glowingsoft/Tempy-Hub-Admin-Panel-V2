import { useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Unstable_Grid2';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { PEEP_RECORDS } from 'src/sections/peep-records/mocks/data';
import { mockFloors, getFloorStatusMeta } from 'src/sections/floor-plans/mocks/data';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

// ----------------------------------------------------------------------

const EMPTY_LEVELS = { low: 0, medium: 0, high: 0, total: 0 };
const EMPTY_FLOORS = { total: 0, uploaded: 0, floors: [] };

export function OrgRollupSiteDetail({
  site: siteProp,
  levels: levelsProp,
  floorsSummary: floorsSummaryProp,
  ownerDashboard = true,
}) {
  const theme = useTheme();
  const params = useParams();
  const currentSiteId = siteProp?._id || params.siteId;
  const base = ownerDashboard ? paths.owner : paths.siteManager;

  const site = useMemo(() => {
    if (siteProp) return siteProp;
    return mockBranches.find((branch) => branch._id === currentSiteId);
  }, [siteProp, currentSiteId]);

  const levels = useMemo(() => {
    if (levelsProp) return levelsProp;
    if (!currentSiteId) return EMPTY_LEVELS;

    const counts = { low: 0, medium: 0, high: 0, total: 0 };
    PEEP_RECORDS.filter((r) => r.branchId === currentSiteId).forEach((record) => {
      if (record.peepLevel && counts[record.peepLevel] !== undefined) {
        counts[record.peepLevel] += 1;
      }
      counts.total += 1;
    });
    return counts;
  }, [levelsProp, currentSiteId]);

  const floorsSummary = useMemo(() => {
    if (floorsSummaryProp) return floorsSummaryProp;
    if (!currentSiteId) return EMPTY_FLOORS;

    const floors = mockFloors.filter((f) => f.branchId === currentSiteId);
    const uploaded = floors.filter((f) => f.status === 'uploaded').length;
    return { total: floors.length, uploaded, floors };
  }, [floorsSummaryProp, currentSiteId]);

  if (!site) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Site Not Found"
          links={[
            { name: 'Dashboard', href: base.root },
            { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
            { name: 'Site' },
          ]}
          sx={{ mb: 3 }}
        />
        <Card sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Site not found</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            The requested site could not be found or you do not have permission to view it.
          </Typography>
          <Button component={RouterLink} href={base.peepAndFloorPlans.root} variant="contained">
            Back to PEEP &amp; Floor Plans
          </Button>
        </Card>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ mb: 2 }}>
        <Button
          component={RouterLink}
          href={base.peepAndFloorPlans.root}
          size="small"
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          All sites
        </Button>
      </Box>

      {/* Breadcrumbs with Top Action Buttons relocated to header; Site Dropdown is cleanly omitted */}
      <CustomBreadcrumbs
        heading={site.name}
        links={[
          { name: 'Dashboard', href: base.root },
          { name: 'PEEP & Floor Plans', href: base.peepAndFloorPlans.root },
          { name: site.name },
        ]}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              component={RouterLink}
              href={base.peepAndFloorPlans.map(site._id)}
              variant="contained"
              startIcon={<Iconify icon="solar:map-point-wave-bold" />}
            >
              View Floor Map
            </Button>
            <Button
              component={RouterLink}
              href={base.peepAndFloorPlans.records.bySite(site._id)}
              variant="outlined"
              startIcon={<Iconify icon="solar:users-group-rounded-bold" />}
            >
              View PEEP Records
            </Button>
            <Button
              component={RouterLink}
              href={base.peepAndFloorPlans.floorPlans.bySite(site._id)}
              variant="outlined"
              startIcon={<Iconify icon="solar:layers-bold" />}
            >
              View Floor Plans
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6">{site.name}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {levels.total} {levels.total === 1 ? 'resident' : 'residents'} with a PEEP record
          </Typography>

          <Grid container spacing={3}>
            <Grid xs={12} md={5}>
              <AnalyticsCurrentVisits
                title="PEEP level breakdown"
                chart={{
                  colors: [theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main],
                  series: [
                    { label: 'Low', value: levels.low },
                    { label: 'Medium', value: levels.medium },
                    { label: 'High', value: levels.high },
                  ],
                }}
              />
            </Grid>

            <Grid xs={12} md={7}>
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Floor plans
              </Typography>

              {floorsSummary.floors.length ? (
                <Stack spacing={1.5} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
                  {floorsSummary.floors.map((floor) => {
                    const statusMeta = getFloorStatusMeta(floor.status);
                    return (
                      <Stack
                        key={floor.id}
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Stack>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {floor.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {floor.pinsCount || 0} pins placed
                          </Typography>
                        </Stack>

                        <Label color={statusMeta.color}>{statusMeta.label}</Label>
                      </Stack>
                    );
                  })}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  No floors set up for this site yet.
                </Typography>
              )}
            </Grid>
          </Grid>
        </Box>
      </Card>
    </DashboardContent>
  );
}
