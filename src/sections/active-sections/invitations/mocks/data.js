export const employees = {
  data: [
    {
      employeeId: 'EMP-001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phoneNumber: '+1 555-0101',
      avatarUrl: '',
      department: 'Engineering',
      role: 'Senior Software Engineer',
      startDate: '2024-03-15',
      status: 'active',
      linkedDevice: {
        isLinked: true,
        deviceName: 'iPhone 15 Pro',
        deviceId: 'DEV-8A72F91',
      },
    },
    {
      employeeId: 'EMP-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phoneNumber: '+1 555-0102',
      avatarUrl: '',
      department: 'Human Resources',
      role: 'HR Manager',
      startDate: '2023-08-21',
      status: 'active',
      linkedDevice: {
        isLinked: true,
        deviceName: 'MacBook Pro',
        deviceId: 'DEV-3B91K42',
      },
    },
    {
      employeeId: 'EMP-003',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      phoneNumber: '+1 555-0103',
      avatarUrl: '',
      department: 'Finance',
      role: 'Financial Analyst',
      startDate: '2025-01-10',
      status: 'active',
      linkedDevice: {
        isLinked: false,
        deviceName: '',
        deviceId: '',
      },
    },
    {
      employeeId: 'EMP-004',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      phoneNumber: '+1 555-0104',
      avatarUrl: '',
      department: 'Marketing',
      role: 'Marketing Specialist',
      startDate: '2024-06-03',
      status: 'active',
      linkedDevice: {
        isLinked: true,
        deviceName: 'iPhone 14',
        deviceId: 'DEV-7C21L83',
      },
    },
    {
      employeeId: 'EMP-005',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      phoneNumber: '+1 555-0105',
      avatarUrl: '',
      department: 'Design',
      role: 'UI/UX Designer',
      startDate: '2022-11-14',
      status: 'inactive',
      linkedDevice: {
        isLinked: false,
        deviceName: '',
        deviceId: '',
      },
    },
  ],
};

// invitations-data.js

export const INVITATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'accepted', label: 'Accepted', color: 'success' },
  { value: 'revoked', label: 'Revoked', color: 'error' },
  { value: 'checked_in', label: 'Checked in', color: 'success' },
  { value: 'expired', label: 'Expired', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
];

export const BADGE_TYPE_OPTIONS = [
  { value: 'guest', label: 'Guest' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'vip', label: 'VIP' },
  { value: 'employee', label: 'Employee' },
];

export const MEMBERSHIP_ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'siteManager', label: 'Site Manager' },
  { value: 'lineManager', label: 'Line Manager' },
  { value: 'staff', label: 'Staff' },
];

export function getRoleLabel(role) {
  if (!role) return '—';
  const match = MEMBERSHIP_ROLES.find(
    (r) => r.value === role || r.label?.toLowerCase() === String(role).toLowerCase()
  );
  return match ? match.label : role;
}


export const mockInvitations = [
  {
    id: 1,
    visitorName: 'Hassan Raza',
    visitorEmail: 'hassan.raza@example.com',
    host: 'Ali Naveed',
    badgeType: 'Guest',
    arrivalTime: '24/08/2026 10:00',
    visitingUntil: '24/08/2026 17:00',
    instructions: 'Please meet at the front desk, ask for Ali from Engineering.',
    additionalRecipients: 'security@company.com',
    expressCheckIn: false,
    status: 'pending',
  },
  {
    id: 2,
    visitorName: 'Mahnoor Fatima',
    visitorEmail: 'mahnoor.fatima@example.com',
    host: 'Sana Yousuf',
    badgeType: 'Contractor',
    arrivalTime: '23/08/2026 09:30',
    visitingUntil: '23/08/2026 18:00',
    instructions: 'Bringing tools for the server room maintenance, needs escort.',
    additionalRecipients: '',
    expressCheckIn: false,
    status: 'checked_in',
  },
  {
    id: 3,
    visitorName: 'Omar Farooq',
    visitorEmail: 'omar.farooq@example.com',
    host: 'Bilal Ahmed',
    badgeType: 'VIP',
    arrivalTime: '20/08/2026 14:00',
    visitingUntil: '20/08/2026 16:00',
    instructions: 'Board meeting guest, reserve parking spot 4.',
    additionalRecipients: 'reception@company.com, security@company.com',
    expressCheckIn: true,
    status: 'expired',
  },
  {
    id: 4,
    visitorName: 'Zoya Sheikh',
    visitorEmail: 'zoya.sheikh@example.com',
    host: 'Fatima Raza',
    badgeType: 'Guest',
    arrivalTime: '18/08/2026 11:15',
    visitingUntil: '18/08/2026 13:00',
    instructions: '',
    additionalRecipients: '',
    expressCheckIn: false,
    status: 'cancelled',
  },
  {
    id: 5,
    visitorName: 'Danish Iqbal',
    visitorEmail: 'danish.iqbal@example.com',
    host: 'Ayesha Khan',
    badgeType: 'Employee',
    arrivalTime: '25/08/2026 09:00',
    visitingUntil: '25/08/2026 18:00',
    instructions: 'First day on-site for the new warehouse hire.',
    additionalRecipients: 'hr@company.com',
    expressCheckIn: true,
    status: 'pending',
  },
  {
    id: 6,
    visitorName: 'Sara Malik',
    visitorEmail: 'sara.malik@example.com',
    host: 'Usman Tariq',
    badgeType: 'Contractor',
    arrivalTime: '22/08/2026 08:00',
    visitingUntil: '22/08/2026 12:00',
    instructions: 'HVAC inspection, needs roof access badge.',
    additionalRecipients: '',
    expressCheckIn: false,
    status: 'checked_in',
  },
];