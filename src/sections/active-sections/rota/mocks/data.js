// ----------------------------------------------------------------------
// Static mock data for the Rota (fortnight schedule) page.
// Swap this file for a real API call (e.g. useGetRota()) once the
// backend endpoint is ready — every component below only depends on
// this shape, not on where it comes from.
// ----------------------------------------------------------------------

export const ROTA_LOCATIONS = [
  { id: 'loc-1', name: 'All locations', count: 3 },
  { id: 'loc-2', name: 'Riverside House', count: 1 },
  { id: 'loc-3', name: 'Oakfield Manor', count: 1 },
  { id: 'loc-4', name: 'Maple Court', count: 1 },
];

export const ROTA_SUMMARY = {
  totalHours: 113,
  totalCost: 33590,
  totalShifts: 15,
};

// 14 columns, Mon 10 Aug -> Sun 23 Aug
export const ROTA_DAYS = [
  { date: '2025-08-10', label: 'Mon 10 Aug', hours: '72.0h', weather: 'cloud' },
  { date: '2025-08-11', label: 'Tue 11 Aug', hours: '35.9h', weather: 'cloud' },
  { date: '2025-08-12', label: 'Wed 12 Aug', hours: '35.4h', weather: 'cloud' },
  { date: '2025-08-13', label: 'Thu 13 Aug', hours: '34.9h', weather: 'cloud' },
  { date: '2025-08-14', label: 'Fri 14 Aug', hours: '34.9h', weather: 'cloud' },
  { date: '2025-08-15', label: 'Sat 15 Aug', hours: '34.6h', weather: 'cloud' },
  { date: '2025-08-16', label: 'Sun 16 Aug', hours: '34.6h', weather: 'cloud' },
  { date: '2025-08-17', label: 'Mon 17 Aug', hours: '36.2h', weather: 'cloud' },
  { date: '2025-08-18', label: 'Tue 18 Aug', hours: '38h', weather: 'cloud' },
  { date: '2025-08-19', label: 'Wed 19 Aug', hours: '35h', weather: 'sun' },
  { date: '2025-08-20', label: 'Thu 20 Aug', hours: '34.2h', weather: 'cloud' },
  { date: '2025-08-21', label: 'Fri 21 Aug', hours: '34.7h', weather: 'cloud' },
  { date: '2025-08-22', label: 'Sat 22 Aug', hours: '34.6h', weather: 'cloud' },
  { date: '2025-08-23', label: 'Sun 23 Aug', hours: '35.3h', weather: 'cloud' },
];

// Shift "type" drives the visual treatment in <RotaShiftChip />
//   default   -> solid grey block, e.g. "9:00a 5:00p"
//   sleepover -> outlined violet block, label "Sleepover"
//   vacant    -> italic placeholder, no time
export const ROTA_TEAMS = [
  {
    id: 'team-1',
    name: 'Care Senior Day Care',
    color: '#FF5630',
    stats: { staff: 2, teams: 0, breaks: 3, hours: '24h' },
    staff: [
      {
        id: 'staff-1',
        name: 'Huzaifa dev',
        totalHours: '16h',
        breakRequired: true,
        role: 'Staff',
        // Optional — same as the Staff Profile field. Drives the "Money Earnt"
        // stat when viewing your own rota. TODO: source from the real staff
        // profile once rota rows are linked to a real staffId.
        hourlyRate: 12.5,
        shifts: {
          '2025-08-19': [{ start: '9:00a', end: '5:00p', type: 'default' }],
          '2025-08-20': [{ start: '9:00a', end: '5:00p', type: 'default' }],
        },
      },
      {
        id: 'staff-2',
        name: 'epm',
        totalHours: '8h',
        role: 'Staff',
        shifts: {
          '2025-08-20': [{ start: '9:00a', end: '5:00p', type: 'default' }],
        },
      },
    ],
  },
  {
    id: 'team-2',
    name: 'Management Head os Care',
    color: '#212B36',
    stats: { staff: 5, teams: 11, breaks: 0, hours: '88h' },
    staff: [
      {
        id: 'staff-3',
        name: 'Care Home',
        totalHours: '8h',
        role: 'Staff',
        shifts: {
          '2025-08-10': [{ start: '9:00a', end: '5:00p', type: 'default' }],
          '2025-08-11': [{ type: 'sleepover' }],
          '2025-08-12': [{ type: 'sleepover' }],
        },
      },
      {
        id: 'staff-4',
        name: 'Ahmed Raza',
        totalHours: '8h',
        role: 'Staff',
        shifts: {
          '2025-08-10': [{ start: '9:00a', end: '5:00p', type: 'default' }],
        },
      },
      {
        id: 'staff-5',
        name: 'Huzaife',
        totalHours: '8h',
        role: 'Staff',
        shifts: {
          '2025-08-10': [{ start: '9:00a', end: '5:00p', type: 'default' }],
        },
      },
      {
        id: 'staff-6',
        name: 'Ahmed Gil',
        totalHours: '8h',
        role: 'Staff',
        shifts: {
          '2025-08-10': [{ start: '9:00a', end: '5:00p', type: 'default' }],
        },
      },
      {
        id: 'staff-7',
        name: 'Joe_Botsford30',
        totalHours: '56h',
        role: 'Staff',
        shifts: {
          '2025-08-10': [
            { start: '9:00a', end: '5:00p', type: 'default' },
            { start: '9:00a', end: '5:00p', type: 'default' },
            { start: '9:00a', end: '5:00p', type: 'default' },
            { start: '9:00a', end: '5:00p', type: 'default' },
            { start: '9:00a', end: '5:00p', type: 'default' },
          ],
          '2025-08-11': [{ start: '9:00a', end: '5:00p', type: 'default' }],
          '2025-08-18': [{ start: '9:00a', end: '5:00p', type: 'default' }],
        },
      },
    ],
  },
  {
    id: 'team-3',
    name: 'Nurse nurse care',
    color: '#00A76F',
    stats: { staff: 2, teams: 8, breaks: 0, hours: '4h' },
    staff: [
      {
        id: 'staff-8',
        name: 'Joe_Botsford30',
        totalHours: '56h',
        role: 'Staff',
        shifts: {
          '2025-08-10': [
            { start: '9:00a', end: '5:00p', type: 'default' },
            { start: '9:00a', end: '5:00p', type: 'default' },
            { start: '9:00a', end: '5:00p', type: 'default' },
            { start: '9:00a', end: '5:00p', type: 'default' },
            { start: '9:00a', end: '5:00p', type: 'default' },
          ],
          '2025-08-11': [{ start: '9:00a', end: '5:00p', type: 'default' }],
          '2025-08-18': [{ start: '9:00a', end: '5:00p', type: 'default' }],
        },
      },
      {
        id: 'staff-9',
        name: 'Osvaldo.Hyatt',
        totalHours: '8h',
        role: 'Staff',
        shifts: {
          '2025-08-21': [{ start: '9:00a', end: '5:00p', type: 'default' }],
        },
      },
    ],
  },
  {
    id: 'team-4',
    name: 'Therapi Senior Doctor',
    color: '#00B8D9',
    stats: { staff: 1, teams: 0, breaks: 0, hours: '0h' },
    staff: [
      {
        id: 'staff-10',
        name: '',
        totalHours: '',
        role: '',
        vacant: true,
        shifts: {},
      },
    ],
  },
];

// ----------------------------------------------------------------------
// Client feedback: the rota should offer "myself" vs "team(s) I'm in or
// manage", gated by permission. There's no real staff-identity / team-
// membership link yet (the signed-in mock user isn't wired to a specific
// row here), so this is an explicit placeholder mapping — TODO: replace
// with a real "my teams" / "teams I manage" lookup once available.
// ----------------------------------------------------------------------

export const ROTA_ACCESS = {
  ownStaffId: 'staff-1',
  managedTeamIds: ['team-1', 'team-2'],
};

// Which rota scopes a permission level is allowed to switch between.
//   personal -> just their own row
//   managed  -> the team(s) they manage
//   all      -> every team
export const ROTA_SCOPE_OPTIONS_BY_PERMISSION = {
  5: [{ value: 'personal', label: 'My Rota' }], // staff — locked to their own
  3: [{ value: 'personal', label: 'My Rota' }, { value: 'managed', label: 'My Team(s)' }], // line manager
  2: [{ value: 'personal', label: 'My Rota' }, { value: 'managed', label: 'My Team(s)' }, { value: 'all', label: 'All Teams' }],
  4: [{ value: 'personal', label: 'My Rota' }, { value: 'managed', label: 'My Team(s)' }, { value: 'all', label: 'All Teams' }],
  1: [{ value: 'personal', label: 'My Rota' }, { value: 'managed', label: 'My Team(s)' }, { value: 'all', label: 'All Teams' }],
};

export const ROTA_STAFF_QUICK_ACTIONS = [
  { key: 'mark-busy', label: 'Mark Busy (block auto-accept)', icon: 'solar:forbidden-circle-linear' },
  { key: 'on-call', label: 'On Call Schedule', icon: 'solar:phone-calling-linear' },
  { key: 'sleepover', label: 'Sleepover Schedule', icon: 'solar:moon-linear' },
  { key: 'day-off', label: 'Schedule this day off', icon: 'solar:calendar-mark-linear' },
  { key: 'not-scheduled', label: 'Not Scheduled', icon: 'solar:close-circle-linear' },
  { key: 'add-leave', label: 'Add Leave', icon: 'solar:add-circle-linear' },
];
