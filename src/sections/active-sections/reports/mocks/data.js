import dayjs from 'dayjs';

export const REPORT_TYPES = {
  ATTENDANCE: 'attendance',
  VISITOR_CHECKINS: 'visitor_checkins',
  STAFF_HOURS: 'staff_hours',
  LATE_ARRIVALS: 'late_arrivals',
  SICKNESS_RATE: 'sickness_rate',
};

export const REPORT_CONFIG = {
  [REPORT_TYPES.ATTENDANCE]: {
    label: 'Attendance',
    description: 'Attendance summary by employee',
    icon: 'solar:calendar-mark-bold',
  },

  [REPORT_TYPES.VISITOR_CHECKINS]: {
    label: 'Visitor check-ins',
    description: 'Visitor check-in activity',
    icon: 'solar:users-group-rounded-bold',
  },

  [REPORT_TYPES.STAFF_HOURS]: {
    label: 'Staff hours summary',
    description: 'Worked hours by employee',
    icon: 'solar:clock-circle-bold',
  },

  [REPORT_TYPES.LATE_ARRIVALS]: {
    label: 'Late check-ins',
    description: 'Employees checking in late',
    icon: 'solar:alarm-bold',
  },

  [REPORT_TYPES.SICKNESS_RATE]: {
    label: 'Sickness rate',
    description: 'Sickness and leave breakdown by employee',
    icon: 'solar:heart-pulse-bold',
  },
};

// Shared date-range filter used by report tabs that filter by time period
// (Attendance, Staff hours summary). Picking a preset other than "Custom
// range" computes the start/end date for you.
export const PERIOD_PRESET_OPTIONS = [
  { value: 'custom', label: 'Custom range' },
  { value: 'this_week', label: 'This week' },
  { value: 'this_month', label: 'This month' },
  { value: 'pay_period_4wk', label: '4-Weekly pay period' },
];

export function getPeriodPresetRange(preset) {
  const today = dayjs();

  switch (preset) {
    case 'this_week':
      return { startDate: today.startOf('week'), endDate: today.endOf('week') };
    case 'this_month':
      return { startDate: today.startOf('month'), endDate: today.endOf('month') };
    case 'pay_period_4wk':
      return { startDate: today.subtract(4, 'week').startOf('day'), endDate: today };
    default:
      return null;
  }
}

export const weeklyAttendanceData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    image: 'https://i.pravatar.cc/150?img=12',
    department: 'Care',
    shiftsScheduled: 5,
    shiftsWorked: 5,
    hours: 40,
    lateCount: 0,
  },
  {
    id: '2',
    name: "Sarah Smith",
    email: 'sarah.smith@example.com',
    image: 'https://i.pravatar.cc/150?img=47',
    department: 'Nursing',
    shiftsScheduled: 5,
    shiftsWorked: 4,
    hours: 32,
    lateCount: 2,
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael.johnson@example.com',
    image: 'https://i.pravatar.cc/150?img=11',
    department: 'Kitchen & Catering',
    shiftsScheduled: 5,
    shiftsWorked: 5,
    hours: 39,
    lateCount: 0,
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    image: 'https://i.pravatar.cc/150?img=44',
    department: 'Housekeeping',
    shiftsScheduled: 5,
    shiftsWorked: 3,
    hours: 24,
    lateCount: 1,
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    image: 'https://i.pravatar.cc/150?img=68',
    department: 'Administration',
    shiftsScheduled: 5,
    shiftsWorked: 5,
    hours: 40,
    lateCount: 0,
  },
];

// Organisation-wide stats surfaced as clickable "select into" metric cards on
// both the Attendance and Staff hours summary tabs — kept as shared constants
// so the two tabs never show a different number for the same stat.
export const totalHoursWorked = weeklyAttendanceData.reduce((sum, row) => sum + row.hours, 0);
export const ORG_LATE_CHECKINS = 214;
export const ORG_SICKNESS_RATE = 4.2;

export const weeklyAttendanceChart = {
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  series: [
    {
      name: 'Scheduled',
      data: [18, 20, 19, 21, 20, 8, 4],
    },
    {
      name: 'Worked',
      data: [17, 18, 18, 20, 19, 7, 4],
    },
  ],
};

export const visitorCheckInData = [
  {
    id: '1',
    name: 'Amara Nwosu',
    email: 'amara@example.com',
    image: 'https://i.pravatar.cc/150?img=44',
    type: 'Visitor',
    zone: 'Day Care',
    checkIn: '06:52',
    method: 'Phone',
    status: 'On site',
    reasonForVisit: 'Family visit',
    handoverNotes: 'Left flowers at reception for Room 12.',
  },
  {
    id: '2',
    name: 'Priya Nair',
    email: 'priya@example.com',
    image: "https://i.pravatar.cc/150?img=47",
    type: 'Visitor',
    zone: 'Residential',
    checkIn: '06:58',
    method: 'Kiosk',
    status: 'On site',
    reasonForVisit: 'District nurse',
    handoverNotes: 'Reviewed dressing, no follow-up needed this week.',
  },
  {
    id: '3',
    name: 'Sam Okafor',
    email: 'sam@example.com',
    image: 'https://i.pravatar.cc/150?img=11',
    type: 'Visitor',
    zone: 'Day Care',
    checkIn: '—',
    method: '—',
    status: 'Late',
    reasonForVisit: 'Family visit',
    handoverNotes: '',
  },
  {
    id: '4',
    name: 'Tom Alder',
    email: 'tom@example.com',
    image: "https://i.pravatar.cc/150?img=68",
    type: 'Contractor',
    zone: 'Plant room',
    checkIn: '08:15',
    method: 'QR',
    status: 'On site',
    reasonForVisit: 'Maintenance',
    handoverNotes: 'Boiler service complete, next check due in 6 months.',
  },
  {
    id: '5',
    name: 'Daniel Fisher',
    email: 'daniel@example.com',
    image: "https://i.pravatar.cc/150?img=68",
    type: 'Visitor',
    zone: 'Lobby',
    checkIn: '09:36',
    method: 'Walk-in',
    status: 'Awaiting',
    reasonForVisit: 'Social worker',
    handoverNotes: '',
  },
  {
    id: '6',
    name: 'Elsie Hall',
    email: 'elsie@example.com',
    image: "https://i.pravatar.cc/150?img=68",
    type: 'Visitor',
    zone: 'Room 12',
    checkIn: '—',
    method: '—',
    status: 'In building',
    reasonForVisit: 'Family visit',
    handoverNotes: 'Staying past visiting hours with manager approval.',
  },
];

export const LateArrrivalData = [
  {
    id: '1',
    name: 'Amara Nwosu',
    email: 'amara@example.com',
    image: 'https://i.pravatar.cc/150?img=44',
    type: 'Staff',
    zone: 'Day Care',
    date: '2026-09-15',
    checkIn: '06:52',
    method: 'Phone',
    status: 'On site',
  },
  {
    id: '2',
    name: 'Priya Nair',
    email: 'priya@example.com',
    image: "https://i.pravatar.cc/150?img=47",
    type: 'Staff',
    zone: 'Residential',
    date: '2026-09-16',
    checkIn: '06:58',
    method: 'Kiosk',
    status: 'On site',
  },
  {
    id: '3',
    name: 'Sam Okafor',
    email: 'sam@example.com',
    image: 'https://i.pravatar.cc/150?img=11',
    type: 'Staff',
    zone: 'Day Care',
    date: '2026-09-17',
    checkIn: '—',
    method: '—',
    status: 'Late',
  },
  {
    id: '4',
    name: 'Tom Alder',
    email: 'tom@example.com',
    image: "https://i.pravatar.cc/150?img=68",
    type: 'Contractor',
    zone: 'Plant room',
    date: '2026-09-17',
    checkIn: '08:15',
    method: 'QR',
    status: 'On site',
  },
  {
    id: '5',
    name: 'Daniel Fisher',
    email: 'daniel@example.com',
    image: "https://i.pravatar.cc/150?img=68",
    type: 'Staff',
    zone: 'Lobby',
    date: '2026-09-18',
    checkIn: '09:36',
    method: 'Walk-in',
    status: 'Awaiting',
  },
  {
    id: '6',
    name: 'Elsie Hall',
    email: 'elsie@example.com',
    image: "https://i.pravatar.cc/150?img=68",
    type: 'Staff',
    zone: 'Room 12',
    date: '2026-09-19',
    checkIn: '—',
    method: '—',
    status: 'In building',
  },
];

export const sicknessRateData = [
  {
    id: '1',
    name: 'Grace Kim',
    email: 'grace.kim@example.com',
    image: 'https://i.pravatar.cc/150?img=32',
    department: 'Care',
    leaveType: 'SSP',
    dates: [
      { date: '2026-09-02', reason: 'Flu' },
      { date: '2026-09-03', reason: 'Flu' },
      { date: '2026-09-15', reason: 'Migraine' },
    ],
  },
  {
    id: '2',
    name: 'Liam Ferreira',
    email: 'liam.ferreira@example.com',
    image: 'https://i.pravatar.cc/150?img=15',
    department: 'Nursing',
    leaveType: 'SSP',
    dates: [{ date: '2026-09-10', reason: 'Back pain' }],
  },
  {
    id: '3',
    name: 'Aisha Bello',
    email: 'aisha.bello@example.com',
    image: 'https://i.pravatar.cc/150?img=25',
    department: 'Kitchen & Catering',
    leaveType: 'SMP',
    dates: [
      { date: '2026-09-01', reason: 'Maternity leave' },
      { date: '2026-09-02', reason: 'Maternity leave' },
    ],
  },
  {
    id: '4',
    name: 'Oliver Bennett',
    email: 'oliver.bennett@example.com',
    image: 'https://i.pravatar.cc/150?img=53',
    department: 'Housekeeping',
    leaveType: 'Unpaid',
    dates: [{ date: '2026-09-08', reason: 'Family emergency' }],
  },
  {
    id: '5',
    name: 'Ruth Adeyemi',
    email: 'ruth.adeyemi@example.com',
    image: 'https://i.pravatar.cc/150?img=29',
    department: 'Administration',
    leaveType: 'SSP',
    dates: [
      { date: '2026-09-12', reason: 'Stomach bug' },
      { date: '2026-09-13', reason: 'Stomach bug' },
    ],
  },
].map((row) => ({ ...row, sickDays: row.dates.length }));