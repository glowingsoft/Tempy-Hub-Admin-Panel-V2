export const _sites = [
  { id: 'oakfield', name: 'Oakfield' },
  { id: 'chase', name: 'Chase Lodge' },
  { id: 'meadowview', name: 'Meadowview' },
];

export const _departments = [
  { id: 'all', name: 'All departments' },
  { id: 'care', name: 'Care' },
  { id: 'nursing', name: 'Nursing' },
  { id: 'kitchen', name: 'Kitchen & Catering' },
  { id: 'admin', name: 'Administration' },
];

export const _complianceColumns = [
  { key: 'fire', label: 'Fire Safety' },
  { key: 'moving', label: 'Moving & Handling' },
  { key: 'safeguard', label: 'Safeguarding' },
  { key: 'medication', label: 'Medication' },
  { key: 'infection', label: 'Infection Control' },
];

export const _courseStats = [
  { key: 'fire', label: 'Fire Safety', compliance: 85, compliant: 17, total: 20 },
  { key: 'moving', label: 'Moving & Handling', compliance: 75, compliant: 15, total: 20 },
  { key: 'safeguard', label: 'Safeguarding', compliance: 95, compliant: 19, total: 20 },
  { key: 'medication', label: 'Medication Administration', compliance: 90, compliant: 18, total: 20 },
  { key: 'infection', label: 'Infection Control', compliance: 100, compliant: 20, total: 20 },
];

export const _departmentStats = [
  { department: 'Care', compliance: 88, staffCount: 12 },
  { department: 'Nursing', compliance: 95, staffCount: 8 },
  { department: 'Kitchen & Catering', compliance: 82, staffCount: 5 },
  { department: 'Administration', compliance: 100, staffCount: 4 },
];

export const _teamCompliance = [
  {
    id: 't1',
    name: 'Amara Nwosu',
    role: 'Care Assistant',
    department: 'care',
    overallCompliance: 60,
    avatar: 'https://i.pravatar.cc/150?img=5',
    modules: {
      fire: { state: 'overdue', note: 'Last completed 14 months ago' },
      moving: { state: 'due_soon', date: '14 Sep' },
      safeguard: { state: 'scheduled', date: 'Mar 27' },
      medication: { state: 'pending', note: 'Awaiting assessor sign-off' },
      infection: { state: 'scheduled', date: 'Jan 27' },
    },
  },
  {
    id: 't2',
    name: 'Priya Nair',
    role: 'Senior Carer',
    department: 'care',
    overallCompliance: 100,
    avatar: 'https://i.pravatar.cc/150?img=32',
    modules: {
      fire: { state: 'scheduled', date: 'Nov 26' },
      moving: { state: 'scheduled', date: 'Feb 27' },
      safeguard: { state: 'scheduled', date: 'Jun 27' },
      medication: { state: 'scheduled', date: 'Sep 26' },
      infection: { state: 'scheduled', date: 'Jan 27' },
    },
  },
  {
    id: 't3',
    name: 'Sam Okafor',
    role: 'Senior Carer',
    department: 'nursing',
    overallCompliance: 80,
    avatar: 'https://i.pravatar.cc/150?img=51',
    modules: {
      fire: { state: 'scheduled', date: 'Apr 27' },
      moving: { state: 'due_soon', date: '2 Sep' },
      safeguard: { state: 'scheduled', date: 'Dec 26' },
      medication: { state: 'scheduled', date: 'Oct 26' },
      infection: { state: 'na' },
    },
  },
  {
    id: 't4',
    name: 'Grace Obi',
    role: 'Care Assistant · nights',
    department: 'care',
    overallCompliance: 75,
    avatar: 'https://i.pravatar.cc/150?img=44',
    modules: {
      fire: { state: 'scheduled', date: 'Jan 27' },
      moving: { state: 'overdue', note: 'Manual handling refresher lapsed' },
      safeguard: { state: 'scheduled', date: 'May 27' },
      medication: { state: 'na' },
      infection: { state: 'scheduled', date: 'Feb 27' },
    },
  },
  {
    id: 't5',
    name: 'Liam Vance',
    role: 'Head Chef',
    department: 'kitchen',
    overallCompliance: 90,
    avatar: 'https://i.pravatar.cc/150?img=11',
    modules: {
      fire: { state: 'scheduled', date: 'Dec 26' },
      moving: { state: 'scheduled', date: 'Jan 27' },
      safeguard: { state: 'scheduled', date: 'Aug 27' },
      medication: { state: 'na' },
      infection: { state: 'scheduled', date: 'Feb 27' },
    },
  },
  {
    id: 't6',
    name: 'Hannah Abbott',
    role: 'Administrator',
    department: 'admin',
    overallCompliance: 100,
    avatar: 'https://i.pravatar.cc/150?img=20',
    modules: {
      fire: { state: 'scheduled', date: 'Oct 26' },
      moving: { state: 'na' },
      safeguard: { state: 'scheduled', date: 'Nov 26' },
      medication: { state: 'na' },
      infection: { state: 'scheduled', date: 'Jan 27' },
    },
  },
];