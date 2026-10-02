import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import { useSearchParams } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';

import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

import { fTime, fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { AnalyticsNews } from 'src/sections/overview/analytics/analytics-news';
import { AnalyticsTasks } from 'src/sections/overview/analytics/analytics-tasks';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';
import { AnalyticsOrderTimeline } from 'src/sections/overview/analytics/analytics-order-timeline';

import {
    staffMember,
    staffSite,
    staffCounts,
    staffEvacuation,
    staffOpenShifts,
    staffTodayShift,
    staffWeeklyHours,
    staffHoursThisWeek,
    staffNotifications,
    staffUpcomingShifts,
    staffComplianceItems,
    staffComplianceTotals,
    isStaffModuleActive,
    isStaffDashboardWidgetVisible,
} from '../../mocks/data';
import { useStaffClock } from '../../use-staff-clock';
import {
    getWorkedMinutes,
    fDurationFromMinutes,
    getComplianceScore,
    getComplianceUrgencyLabel,
    getBreakEntitlementMinutes,
} from '../../utils';
import { StaffAttendanceBar } from '../components/staff-attendance-bar';
import { StaffEmergencyAlertBanner } from '../components/staff-emergency-alert-banner';
import { StaffQuickActions } from '../components/staff-quick-actions';
import { StaffShiftCalendarStrip } from '../components/staff-shift-calendar-strip';
import { staffSupervisionSummary } from '../../supervision/mocks/data';

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;
const TIMELINE_TYPES = ['order1', 'order2', 'order3', 'order4', 'order5'];
// Shared height for the "at a glance" list cards below, so short lists
// (e.g. Training) and long ones (e.g. Next Assigned shifts) line up instead
// of each card sizing to its own content.
const GLANCE_CARD_HEIGHT = 380;
const NOTIFICATION_COLOR = { approval: 'success', reminder: 'error', announcement: 'info' };

// Client feedback: Compliance, Training and Supervision & Appraisal need their
// own separate lists rather than one mixed "Compliance & supervision" card.
const mapComplianceItems = (type) =>
    staffComplianceItems
        .filter((item) => item.type === type)
        .map((item) => ({ id: item._id, name: `${item.title} — ${getComplianceUrgencyLabel(item.urgency)}` }));

export function StaffDashboardView() {
    const { user } = useSelector((state) => state.user);
    const searchParams = useSearchParams();
    const { clock, clockIn, clockOut, startBreak, endBreak } = useStaffClock();
    const safeAtAssembly = useBoolean(false);
    const [nowTs, setNowTs] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNowTs(Date.now()), 30_000);
        return () => clearInterval(timer);
    }, []);

    const firstName = (user?.basicInfo?.name || staffMember.name).split(' ')[0];
    // Client feedback: Check In / Pending Leave need to be removable from the
    // home screen as an option. Owner-controlled display preference, set on
    // the Owner Dashboard's "Staff Dashboard Settings" page — separate from
    // the module-access gates below (Open Shifts, Evacuation), which are
    // feature entitlements rather than display preferences.
    const checkInActive = isStaffDashboardWidgetVisible('checkIn');
    const pendingLeaveVisible = isStaffDashboardWidgetVisible('pendingLeave');
    const shiftBiddingActive = isStaffModuleActive('shiftBidding');
    const evacuationActive =
        isStaffModuleActive('fireDrillEvacuation') &&
        (staffEvacuation.active || searchParams.get('evac') === '1');
    const onSiteTodayMinutes = clock?.clockInAt ? getWorkedMinutes(clock, nowTs) : 0;
    const onSiteToday = clock?.clockInAt ? fDurationFromMinutes(onSiteTodayMinutes) : '—';

    // Client feedback: breaks need to be a removable option (some
    // organizations don't use them) — driven by the site's own setting,
    // same one already editable on the Owner's Site form. When breaks are on
    // and unpaid, show today's entitlement from the site's break rules.
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

    // Client feedback: "My weekly hours" needs a running total (so far this
    // week, live) and a total for the whole week. Reuses the same live clock
    // data already driving "On-site today" — no new state or timer.
    const workedHoursByDay = staffWeeklyHours.series.find((series) => series.name === 'Worked')?.data || [];
    const todayIndex = (dayjs().day() + 6) % 7; // categories are Mon-first; dayjs().day() is 0=Sun..6=Sat
    const priorDaysHours = workedHoursByDay.slice(0, todayIndex).reduce((sum, hours) => sum + hours, 0);
    const todayLiveHours = onSiteTodayMinutes / 60;
    const hoursThisWeekRunning = Math.round((priorDaysHours + todayLiveHours) * 10) / 10;

    // Client feedback: show earnings once an hourly rate is set on the staff's
    // profile — reuses the hours already computed above, no new logic. Hidden
    // entirely (see below) when no rate has been entered.
    const hourlyRate = staffMember.hourlyRate;
    const hasHourlyRate = !!hourlyRate;
    const earnedThisWeek = hasHourlyRate ? fCurrency(hoursThisWeekRunning * hourlyRate, { code: 'en-GB', currency: 'GBP' }) : null;
    const earnedThisWeekTitle = hasHourlyRate
        ? `Earned this week · ${fCurrency(hourlyRate, { code: 'en-GB', currency: 'GBP' })}/hr`
        : 'Earned this week';

    // Client feedback: "Today's shifts" doesn't need to be separate — folded
    // into the same calendar strip as one more day (today is highlighted
    // there already).
    const calendarShifts = useMemo(() => [staffTodayShift, ...staffUpcomingShifts], []);

    const openShiftsList = useMemo(
        () => staffOpenShifts.map((shift, index) => ({
            id: shift._id,
            type: shift.urgentCover ? 'order5' : TIMELINE_TYPES[index % TIMELINE_TYPES.length],
            title: `${fDate(shift.startsAt, 'ddd DD MMM')} · ${shift.siteName} · ${fTime(shift.startsAt)}–${fTime(shift.endsAt)}${shift.urgentCover ? ' · Urgent' : ''}`,
            time: shift.startsAt,
        })),
        []
    );

    const complianceTasks = useMemo(() => mapComplianceItems('compliance'), []);
    const trainingTasks = useMemo(() => mapComplianceItems('training'), []);
    const supervisionTasks = useMemo(() => mapComplianceItems('supervision'), []);

    // Client feedback: Compliance and (in the same way) My Training should
    // each show a compliance score, not just the items needing action.
    // Reuses the exact same items/urgency data already computed above.
    const complianceScore = getComplianceScore(complianceTasks.length, staffComplianceTotals.compliance);
    const trainingScore = getComplianceScore(trainingTasks.length, staffComplianceTotals.training);

    // Client feedback: Supervision & Appraisal needs the same score. This one
    // reuses real completed/expected counts already tracked on the full
    // "My Supervision & Appraisal" page instead of a separate placeholder
    // total — "needs action" here is just what hasn't been completed yet.
    const supervisionExpected =
        staffSupervisionSummary.supervision.expectedThisYear + staffSupervisionSummary.appraisal.expectedThisYear;
    const supervisionCompleted =
        staffSupervisionSummary.supervision.completedThisYear + staffSupervisionSummary.appraisal.completedThisYear;
    const supervisionScore = getComplianceScore(supervisionExpected - supervisionCompleted, supervisionExpected);

    const notificationsList = useMemo(
        () => staffNotifications.map((item) => ({
            id: item._id,
            title: item.title,
            description: item.body,
            postedAt: item.createdAt,
            color: NOTIFICATION_COLOR[item.type] || 'info',
        })),
        []
    );

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

            <Grid container spacing={3}>
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
                <Grid xs={12} sm={6} md={3}><CourseWidgetSummary title="On-site today" total={onSiteToday} color="primary" icon={icon('ic-clock')} /></Grid>
                <Grid xs={12} sm={6} md={3}><CourseWidgetSummary title="Hours this week" total={hoursThisWeekRunning} color="info" icon={icon('ic-rota')} /></Grid>
                {hasHourlyRate ? (
                    <Grid xs={12} sm={6} md={3}>
                        <CourseWidgetSummary title={earnedThisWeekTitle} total={earnedThisWeek} color="success" icon={icon('ic-banking')} />
                    </Grid>
                ) : null}
                {pendingLeaveVisible ? (
                    <Grid xs={12} sm={6} md={3}><CourseWidgetSummary title="Pending leave" total={staffCounts.pendingLeave} color="warning" icon={icon('ic-calendar')} /></Grid>
                ) : null}
                <Grid xs={12} sm={6} md={3}><CourseWidgetSummary title="Compliance due" total={staffCounts.complianceDue} color="error" icon={icon('ic-compliance')} /></Grid>
                <Grid xs={12}>
                    <StaffQuickActions />
                </Grid>
                <Grid xs={12}>
                    <AnalyticsWebsiteVisits
                        title="My weekly hours"
                        subheader={`Worked vs target · ${hoursThisWeekRunning}h so far · ${staffHoursThisWeek}h total this week`}
                        chart={{ categories: staffWeeklyHours.categories, series: staffWeeklyHours.series }}
                    />
                </Grid>
                <Grid xs={12}>
                    <StaffShiftCalendarStrip title="Next Assigned shifts" shifts={calendarShifts} />
                </Grid>
                <Grid xs={12}>
                    <AnalyticsNews title="Communication" subheader="Announcements, approvals and reminders" list={notificationsList} />
                </Grid>
                <Grid xs={12} md={6} lg={4}>
                    <AnalyticsTasks
                        title="Compliance"
                        subheader={complianceScore != null ? `${complianceScore}% compliant` : undefined}
                        list={complianceTasks}
                        sx={{ height: GLANCE_CARD_HEIGHT }}
                    />
                </Grid>
                <Grid xs={12} md={6} lg={4}>
                    <AnalyticsTasks
                        title="My Training"
                        subheader={trainingScore != null ? `${trainingScore}% compliant` : undefined}
                        list={trainingTasks}
                        sx={{ height: GLANCE_CARD_HEIGHT }}
                    />
                </Grid>
                <Grid xs={12} md={6} lg={4}>
                    <AnalyticsTasks
                        title="Supervision & Appraisal"
                        subheader={supervisionScore != null ? `${supervisionScore}% compliant` : undefined}
                        list={supervisionTasks}
                        sx={{ height: GLANCE_CARD_HEIGHT }}
                    />
                </Grid>
                {shiftBiddingActive ? <Grid xs={12} md={6} lg={4}><AnalyticsOrderTimeline title="Open shifts to claim" list={openShiftsList} sx={{ height: GLANCE_CARD_HEIGHT }} /></Grid> : null}
            </Grid>
        </DashboardContent>
    );
}
