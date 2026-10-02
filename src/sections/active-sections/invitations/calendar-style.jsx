
import { GlobalStyles } from '@mui/material';

export const calendarStyles = (
  <GlobalStyles
    styles={(theme) => ({
      '.attendance-calendar .fc': {
        '--fc-border-color': 'transparent',
        '--fc-page-bg-color': theme.vars.palette.background.paper,
        '--fc-neutral-bg-color': theme.vars.palette.background.neutral,
        '--fc-list-event-hover-bg-color': theme.vars.palette.action.hover,
      },
       
      // Calendar main background
      '.attendance-calendar .fc-scrollgrid-section-body > td': {
        backgroundColor: theme.vars.palette.background.paper,
      },

      // Day grid
      '.attendance-calendar .fc-daygrid-body': {
        backgroundColor: theme.vars.palette.background.paper,
      },

      '.attendance-calendar .fc-daygrid-day': {
        border: 'none',
        padding: 3,
        backgroundColor: 'transparent',
      },

      // Header row background
      '.attendance-calendar .fc-col-header': {
        backgroundColor: theme.vars.palette.background.paper,
      },

      '.attendance-calendar .fc-col-header-cell': {
        paddingBottom: 12,
        backgroundColor: theme.vars.palette.background.paper,
      },

      '.attendance-calendar .fc-col-header-cell-cushion': {
        color: theme.vars.palette.text.disabled,
        fontSize: 13,
        fontWeight: 600,
        textDecoration: 'none',
      },

      // Remove FullCalendar borders
      '.attendance-calendar .fc-theme-standard td, .attendance-calendar .fc-theme-standard th, .attendance-calendar .fc-scrollgrid':
      {
        border: 'none',
      },

      '.attendance-calendar .fc-daygrid-day-frame': {
        minHeight: 0,
        padding: 0,
      },

      '.attendance-calendar .fc-daygrid-day-top': {
        flexDirection: 'row',
        justifyContent: 'center',
      },

      '.attendance-calendar .fc-daygrid-day-events': {
        display: 'none',
      },

      // Your custom day pill
      '.attendance-calendar .day-pill': {
        width: 44,
        height: 44,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        borderRadius: 14,
        backgroundColor: theme.vars.palette.background.neutral,
        color: theme.vars.palette.text.primary,
        fontSize: 14,
        fontWeight: 600,
        cursor: 'pointer',
        userSelect: 'none',
        transition: theme.transitions.create('background-color'),
      },

      '.attendance-calendar .day-pill--outside': {
        color: theme.vars.palette.text.disabled,
        backgroundColor: 'transparent',
      },

      '.attendance-calendar .day-pill--marked': {
        backgroundColor: theme.vars.palette.background.paper,
        boxShadow: `inset 0 0 0 1px ${theme.vars.palette.divider}`,
      },

      '.attendance-calendar .day-pill--selected': {
        backgroundColor: theme.vars.palette.text.primary,
        color: theme.vars.palette.background.paper,
      },

      '.attendance-calendar .day-pill__dot': {
        width: 4,
        height: 4,
        borderRadius: '50%',
        backgroundColor: theme.vars.palette.text.disabled,
      },

      '.attendance-calendar .day-pill--selected .day-pill__dot': {
        backgroundColor: theme.vars.palette.background.paper,
      },
    })}
  />
);