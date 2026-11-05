import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';
import { AnalyticsNews } from 'src/sections/overview/analytics/analytics-news';
import { AnalyticsOrderTimeline } from 'src/sections/overview/analytics/analytics-order-timeline';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { DashboardGlanceTable } from 'src/sections/overview/analytics/dashboard-glance-table';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { EmptyDashboardCard } from 'src/sections/owner/empty-dashboard-card';
import { useGetOrganizationStaffHomeDashboardQuery } from 'src/store/Reducer/organizations-api';

import {
    isStaffDashboardWidgetVisible,
    isStaffModuleActive,
    staffEvacuation,
    staffMember,
    staffSite,
    staffTodayShift,
} from '../../mocks/data';
import { useStaffClock } from '../../use-staff-clock';
import { fDurationFromMinutes, getBreakEntitlementMinutes, getWorkedMinutes } from '../../utils';
import { StaffAttendanceBar } from '../components/staff-attendance-bar';
import { StaffEmergencyAlertBanner } from '../components/staff-emergency-alert-banner';
import { StaffQuickActions } from '../components/staff-quick-actions';
import { StaffShiftCalendarStrip } from '../components/staff-shift-calendar-strip';
import { formatOnSiteToday, mapStaffDashboard, scoreLabel } from '../map-staff-dashboard';

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;
const GLANCE_CARD_HEIGHT = 380;

export function StaffDashboardView() {
    const { user } = useSelector((state) => state.user);
    const searchParams = useSearchParams();
    const { organizationId } = useCurrentOrganization();
    const { clock, clockIn, clockOut, startBreak, endBreak } = useStaffClock();
    const safeAtAssembly = useBoolean(false);
    const [nowTs, setNowTs] = useState(() => Date.now());

    const { data, isLoading } = useGetOrganizationStaffHomeDashboardQuery(organizationId, {
        skip: !organizationId,
    });

    const dashboard = useMemo(() => mapStaffDashboard(data), [data]);
    const { summary } = dashboard;

    useEffect(() => {
        const timer = setInterval(() => setNowTs(Date.now()), 30_000);
        return () => clearInterval(timer);
    }, []);

    const firstName = (user?.basicInfo?.name || staffMember.name).split(' ')[0];
    const checkInActive = isStaffDashboardWidgetVisible('checkIn');
    const pendingLeaveVisible = isStaffDashboardWidgetVisible('pendingLeave');
    const shiftBiddingActive = isStaffModuleActive('shiftBidding');
    const evacuationActive =
        isStaffModuleActive('fireDrillEvacuation') &&
        (staffEvacuation.active || searchParams.get('evac') === '1');

    const isClockedIn = !!clock?.clockInAt;
    const liveMinutes = isClockedIn ? getWorkedMinutes(clock, nowTs) : 0;
    const onSiteToday = formatOnSiteToday(summary.onSiteTodayMinutes, liveMinutes, isClockedIn);

    const canBreak = !!staffSite.settings?.enableBreaks;
    const todayShiftHours = dayjs(staffTodayShift.endsAt).diff(dayjs(staffTodayShift.startsAt), 'hour', true);
    const breakEntitlementMinutes = canBreak
        ? getBreakEntitlementMinutes(todayShiftHours, staffSite.settings?.breakRules)
        : 0;
    const breakNote = staffSite.settings?.breaksPaid
        ? 'Breaks are paid.'
        : breakEntitlementMinutes
            ? `${fDurationFromMinutes(breakEntitlementMinutes)} unpaid break today.`
            : null;

    const hoursSubheader = dashboard.weeklyHours.targetHours === '—'
        ? `Worked vs target · ${dashboard.weeklyHours.workedHours}h so far`
        : `Worked vs target · ${dashboard.weeklyHours.workedHours}h so far · ${dashboard.weeklyHours.targetHours}h scheduled`;

    return (
        <DashboardContent maxWidth="xl">
            <StaffEmergencyAlertBanner
                alert={evacuationActive ? { ...staffEvacuation, active: true } : staffEvacuation}
                acknowledged={safeAtAssembly.value}
                onAcknowledge={safeAtAssembly.onTrue}
            />

            <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
                Hi, {firstName} 👋
            </Typography>

            <Grid container spacing={3} sx={{ opacity: isLoading ? 0.72 : 1 }}>
                {checkInActive ? (
                    <Grid xs={12}>
                        <StaffAttendanceBar
                            clock={clock}
                            onClockIn={clockIn}
                            onClockOut={clockOut}
                            onStartBreak={startBreak}
                            onEndBreak={endBreak}
                            canBreak={canBreak}
                            breakNote={breakNote}
                        />
                    </Grid>
                ) : null}
                <Grid xs={12} sm={6} md={3}>
                    <CourseWidgetSummary title="On-site today" total={onSiteToday} color="primary" icon={icon('ic-clock')} sx={{ width: 1 }} />
                </Grid>

                <Grid xs={12} sm={6} md={3}>
                    <CourseWidgetSummary title="Hours this week" total={summary.hoursThisWeek} color="info" icon={icon('ic-rota')} sx={{ width: 1 }} />
                </Grid>

                {summary.hasHourlyRate ? (
                    <Grid xs={12} sm={6} md={3}>
                        <CourseWidgetSummary title={summary.earnedThisWeekTitle} total={summary.earnedThisWeek ?? '—'} color="success" icon={icon('ic-banking')} sx={{ width: 1 }} />
                    </Grid>
                ) : null}

                {pendingLeaveVisible ? (
                    <Grid xs={12} sm={6} md={3}>
                        <CourseWidgetSummary title="Pending leave" total={summary.pendingLeave} color="warning" icon={icon('ic-calendar')} sx={{ width: 1 }} />
                    </Grid>
                ) : null}

                <Grid xs={12} sm={6} md={3}>
                    <CourseWidgetSummary title="Compliance due" total={summary.complianceDue} color="error" icon={icon('ic-compliance')} sx={{ width: 1 }} />
                </Grid>

                <Grid xs={12}>
                    <StaffQuickActions counts={dashboard.quickActionCounts} />
                </Grid>

                <Grid xs={12}>
                    {dashboard.weeklyHours.hasData ? (
                        <AnalyticsWebsiteVisits
                            title="My weekly hours"
                            subheader={hoursSubheader}
                            chart={{
                                categories: dashboard.weeklyHours.categories,
                                series: dashboard.weeklyHours.series,
                            }}
                        />
                    ) : (
                        <EmptyDashboardCard title="My weekly hours" subheader="Worked vs target" />
                    )}
                </Grid>

                <Grid xs={12}>
                    <StaffShiftCalendarStrip
                        title="Next Assigned shifts"
                        shifts={dashboard.nextShifts.calendarShifts}
                        scheduledHours={dashboard.nextShifts.scheduledHours}
                    />
                </Grid>

                <Grid xs={12}>
                    <AnalyticsNews
                        title="Communication"
                        subheader="Announcements, approvals and reminders"
                        list={dashboard.communication}
                    />
                </Grid>

                <Grid xs={12} md={6} lg={4}>
                    <DashboardGlanceTable
                        title="Compliance"
                        subheader={scoreLabel(dashboard.compliance.percent)}
                        columns={dashboard.compliance.columns}
                        rows={dashboard.compliance.rows}
                        sx={{ height: GLANCE_CARD_HEIGHT }}
                    />
                </Grid>

                <Grid xs={12} md={6} lg={4}>
                    <DashboardGlanceTable
                        title="My Training"
                        subheader={scoreLabel(dashboard.training.percent)}
                        columns={dashboard.training.columns}
                        rows={dashboard.training.rows}
                        sx={{ height: GLANCE_CARD_HEIGHT }}
                    />
                </Grid>

                <Grid xs={12} md={6} lg={4}>
                    <DashboardGlanceTable
                        title="Supervision & Appraisal"
                        subheader={scoreLabel(dashboard.supervisionAppraisal.percent)}
                        columns={dashboard.supervisionAppraisal.columns}
                        rows={dashboard.supervisionAppraisal.rows}
                        sx={{ height: GLANCE_CARD_HEIGHT }}
                    />
                </Grid>
                
                {shiftBiddingActive ? (
                    <Grid xs={12} md={6} lg={4}>
                        <AnalyticsOrderTimeline
                            title="Open shifts to claim"
                            list={dashboard.openShifts}
                            sx={{ height: GLANCE_CARD_HEIGHT }}
                        />
                    </Grid>
                ) : null}
            </Grid>
        </DashboardContent>
    );
}
