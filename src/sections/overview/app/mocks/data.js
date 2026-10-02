export const mockUsers = [
  {
    _id: 'user-001',
    name: 'John Doe',
    email: 'john@example.com',
    image: 'https://i.pravatar.cc/150?img=12',
    type: 'staff',
    status: 'on_site',
    checkedInAt: '2026-08-17T08:30:00Z',
  },
  {
    _id: 'user-002',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    image: 'https://i.pravatar.cc/150?img=47',
    type: 'visitor',
    status: 'on_site',
    checkedInAt: '2026-08-17T09:15:00Z',
  },
  {
    _id: 'user-003',
    name: 'Michael Brown',
    email: 'michael@example.com',
    image: 'https://i.pravatar.cc/150?img=11',
    type: 'staff',
    status: 'on_break',
    checkedInAt: '2026-08-17T08:45:00Z',
  },
  {
    _id: 'user-004',
    name: 'Emily Johnson',
    email: 'emily@example.com',
    image: 'https://i.pravatar.cc/150?img=32',
    type: 'visitor',
    status: 'on_site',
    checkedInAt: '2026-08-17T10:00:00Z',
  },
  {
    _id: 'user-005',
    name: 'David Wilson',
    email: 'david@example.com',
    image: 'https://i.pravatar.cc/150?img=68',
    type: 'staff',
    status: 'on_site',
    checkedInAt: '2026-08-17T09:30:00Z',
  },
];

export const activityFeed = [
  {
    id: 'activity-001',
    title: 'John Doe checked in',
    description: 'Staff member checked in at the front desk',
    postedAt: '2026-08-17T08:30:00Z',
    color: 'success',
  },
  {
    id: 'activity-002',
    title: 'Sarah Smith checked in',
    description: 'Visitor checked in at the reception',
    postedAt: '2026-08-17T09:15:00Z',
    color: 'grey',
  },
  {
    id: 'activity-003',
    title: 'Michael Brown is on break',
    description: 'Staff member started a break',
    postedAt: '2026-08-17T09:30:00Z',
    color: 'error',
  },
  {
    id: 'activity-004',
    title: 'Emily Johnson checked in',
    description: 'Visitor checked in at the reception',
    postedAt: '2026-08-17T10:00:00Z',
    color: 'success',
  },
  {
    id: 'activity-005',
    title: 'David Wilson checked in',
    description: 'Staff member checked in at the front desk',
    postedAt: '2026-08-17T10:15:00Z',
    color: 'success',
  },
  {
    id: 'activity-006',
    title: 'John Doe checked out',
    description: 'Staff member checked out',
    postedAt: '2026-08-17T11:00:00Z',
    color: 'grey',
  },
];

// ----------------------------------------------------------------------
// Site-level Compliance, Training, Supervision & Open Shifts
// ----------------------------------------------------------------------

export const siteCompliance = {
  score: 88,
  list: [
    { id: 'site-comp-1', name: 'Weekly Fire Alarm & Emergency Lighting Check — Due today' },
    { id: 'site-comp-2', name: 'Medication Fridge Temperature Daily Log — AM/PM verified' },
    { id: 'site-comp-3', name: 'Kitchen Food Hygiene & Equipment Sanitization — Logged' },
  ],
};

export const siteTraining = {
  score: 82,
  list: [
    { id: 'site-train-1', name: 'Moving & Handling Refresher: Care Team A — Due in 5 days' },
    { id: 'site-train-2', name: 'Infection Control E-Learning: Night Carers — 3 pending' },
    { id: 'site-train-3', name: 'Fire Warden Practical Drill: Reception Staff — Booked' },
  ],
};

export const siteSupervision = {
  score: 85,
  list: [
    { id: 'site-sup-1', name: 'Monthly 1:1: Michael Chang (Night Carer) — Due today' },
    { id: 'site-sup-2', name: 'Quarterly Supervision: Emma Watson — Tomorrow at 14:00' },
    { id: 'site-sup-3', name: 'Annual Appraisal: David Miller (Care Lead) — Due this week' },
  ],
};

const appNow = new Date();
const appAddHours = (d, h) => new Date(d.getTime() + h * 60 * 60 * 1000);

export const siteOpenShifts = [
  {
    id: 'site-shift-1',
    type: 'order5',
    title: 'Fri 25 Sep · Day Shift · 08:00–16:00 · Urgent Cover',
    time: appAddHours(appNow, 16),
  },
  {
    id: 'site-shift-2',
    type: 'order2',
    title: 'Sat 26 Sep · Twilight Shift · 16:00–22:00 · Senior Carer',
    time: appAddHours(appNow, 40),
  },
  {
    id: 'site-shift-3',
    type: 'order4',
    title: 'Sun 27 Sep · Waking Night · 20:00–08:00 · Care Worker',
    time: appAddHours(appNow, 64),
  },
];