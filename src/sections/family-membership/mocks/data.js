// Mock Data for Family Memberships (Invitations & Members)
// Following the same structure as staff memberships / invitations, tailored for family engagement.

export const FAMILY_INVITATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'accepted', label: 'Accepted', color: 'success' },
  { value: 'revoked', label: 'Revoked', color: 'error' },
];

export const getFamilyInvitationStatusMeta = (value) =>
  FAMILY_INVITATION_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

export const FAMILY_MEMBER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
];

export const getFamilyMemberStatusMeta = (value) =>
  FAMILY_MEMBER_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

export const FAMILY_ROLE_OPTIONS = [
  { value: 'primary_admin', label: 'Primary Admin' },
  { value: 'family_member', label: 'Family Member' },
  { value: 'contributor', label: 'Contributor' },
];

export const getFamilyRoleLabel = (value) =>
  FAMILY_ROLE_OPTIONS.find((option) => option.value === value)?.label || value || '—';

export const RELATIONSHIP_OPTIONS = [
  { value: 'Daughter', label: 'Daughter' },
  { value: 'Son', label: 'Son' },
  { value: 'Spouse', label: 'Spouse' },
  { value: 'Wife', label: 'Wife' },
  { value: 'Husband', label: 'Husband' },
  { value: 'Granddaughter', label: 'Granddaughter' },
  { value: 'Grandson', label: 'Grandson' },
  { value: 'Niece', label: 'Niece' },
  { value: 'Nephew', label: 'Nephew' },
  { value: 'Brother', label: 'Brother' },
  { value: 'Sister', label: 'Sister' },
  { value: 'Legal Guardian', label: 'Legal Guardian' },
  { value: 'Friend', label: 'Friend' },
  { value: 'Other', label: 'Other' },
];

export const FAMILY_PERMISSION_OPTIONS = [
  { value: 'wall.view', label: 'View Community Wall' },
  { value: 'photos.upload', label: 'Upload Photos' },
  { value: 'gazette.view', label: 'View Gazettes' },
  { value: 'newsletter.receive', label: 'Receive Newsletters' },
  { value: 'stories.submit', label: 'Submit Family Stories' },
];

export const getFamilyPermissionLabels = (values = []) =>
  values.map(
    (value) =>
      FAMILY_PERMISSION_OPTIONS.find((option) => option.value === value)?.label || value
  );

export const mockResidentOptions = [
  { id: 'resident-001', name: 'Margaret Hughes', room: '12', branch: 'Florence House' },
  { id: 'resident-002', name: 'Dennis Rowe', room: '4', branch: 'Hanley House' },
  { id: 'resident-003', name: 'Joan Parr', room: '8', branch: 'Florence House' },
  { id: 'resident-004', name: 'Albert Cole', room: '15', branch: 'Oakwood Lodge' },
  { id: 'resident-005', name: 'Rose Bell', room: '2', branch: 'Florence House' },
  { id: 'resident-006', name: 'Frank Hill', room: '9', branch: 'Hanley House' },
  { id: 'resident-007', name: 'Arthur Pendelton', room: '101', branch: 'Florence House' },
  { id: 'resident-008', name: 'Dorothy Miller', room: '102', branch: 'Hanley House' },
];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

// ----------------------------------------------------------------------
// Mock Invitations
// ----------------------------------------------------------------------

export const mockFamilyInvitations = [
  {
    _id: 'fam-inv-001',
    name: 'Emily Hughes',
    email: 'emily.h@example.com',
    phone: '+44 7700 900125',
    role: 'contributor',
    relationship: 'Granddaughter',
    isNok: false,
    residentId: 'resident-001',
    residentName: 'Margaret Hughes',
    room: '12',
    branch: 'Florence House',
    permissions: ['wall.view', 'photos.upload'],
    status: 'pending',
    sendCount: 2,
    lastSentAt: daysFromNow(-2),
    acceptedAt: null,
    expiresAt: daysFromNow(5),
    revokedAt: null,
    createdAt: daysFromNow(-5),
    updatedAt: daysFromNow(-2),
  },
  {
    _id: 'fam-inv-002',
    name: 'Priya Bell',
    email: 'priya.b@example.com',
    phone: '+44 7700 900321',
    role: 'primary_admin',
    relationship: 'Granddaughter',
    isNok: true,
    residentId: 'resident-005',
    residentName: 'Rose Bell',
    room: '2',
    branch: 'Florence House',
    permissions: ['wall.view', 'photos.upload', 'stories.submit'],
    status: 'pending',
    sendCount: 1,
    lastSentAt: daysFromNow(-3),
    acceptedAt: null,
    expiresAt: daysFromNow(4),
    revokedAt: null,
    createdAt: daysFromNow(-3),
    updatedAt: daysFromNow(-3),
  },
  {
    _id: 'fam-inv-003',
    name: 'Sarah Hughes',
    email: 'sarah.hughes@example.com',
    phone: '+44 7700 900123',
    role: 'primary_admin',
    relationship: 'Daughter',
    isNok: true,
    residentId: 'resident-001',
    residentName: 'Margaret Hughes',
    room: '12',
    branch: 'Florence House',
    permissions: ['wall.view', 'photos.upload', 'gazette.view', 'newsletter.receive', 'stories.submit'],
    status: 'accepted',
    sendCount: 1,
    lastSentAt: daysFromNow(-30),
    acceptedAt: daysFromNow(-29),
    expiresAt: daysFromNow(-23),
    revokedAt: null,
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-29),
  },
  {
    _id: 'fam-inv-004',
    name: 'David Hughes',
    email: 'david.h@example.com',
    phone: '+44 7700 900124',
    role: 'family_member',
    relationship: 'Son',
    isNok: false,
    residentId: 'resident-001',
    residentName: 'Margaret Hughes',
    room: '12',
    branch: 'Florence House',
    permissions: ['wall.view', 'photos.upload', 'gazette.view'],
    status: 'accepted',
    sendCount: 1,
    lastSentAt: daysFromNow(-25),
    acceptedAt: daysFromNow(-24),
    expiresAt: daysFromNow(-18),
    revokedAt: null,
    createdAt: daysFromNow(-25),
    updatedAt: daysFromNow(-24),
  },
  {
    _id: 'fam-inv-005',
    name: 'Mark Price',
    email: 'mark.p@example.com',
    phone: '+44 7700 900457',
    role: 'family_member',
    relationship: 'Nephew',
    isNok: false,
    residentId: 'resident-002',
    residentName: 'Dennis Rowe',
    room: '4',
    branch: 'Hanley House',
    permissions: ['wall.view'],
    status: 'revoked',
    sendCount: 1,
    lastSentAt: daysFromNow(-20),
    acceptedAt: null,
    expiresAt: daysFromNow(-13),
    revokedAt: daysFromNow(-15),
    createdAt: daysFromNow(-20),
    updatedAt: daysFromNow(-15),
  },
  {
    _id: 'fam-inv-006',
    name: 'Mark Cole',
    email: 'mark.c@example.com',
    phone: '+44 7700 900789',
    role: 'primary_admin',
    relationship: 'Son',
    isNok: true,
    residentId: 'resident-004',
    residentName: 'Albert Cole',
    room: '15',
    branch: 'Oakwood Lodge',
    permissions: ['wall.view', 'photos.upload', 'gazette.view', 'newsletter.receive'],
    status: 'accepted',
    sendCount: 1,
    lastSentAt: daysFromNow(-40),
    acceptedAt: daysFromNow(-39),
    expiresAt: daysFromNow(-33),
    revokedAt: null,
    createdAt: daysFromNow(-40),
    updatedAt: daysFromNow(-39),
  },
];

export const getMockFamilyInvitationById = (id) =>
  mockFamilyInvitations.find((item) => item._id === id) ?? null;

export function createMockFamilyInvitation({
  name,
  email,
  phone,
  role = 'family_member',
  relationship = 'Other',
  isNok = false,
  residentId,
  permissions = ['wall.view', 'gazette.view'],
} = {}) {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 10);
  const id = `fam-inv-${rand}`;

  const resident = mockResidentOptions.find((r) => r.id === residentId);

  const newInvitation = {
    _id: id,
    name,
    email,
    phone: phone || '',
    role,
    relationship,
    isNok: Boolean(isNok),
    residentId: residentId || '',
    residentName: resident?.name || 'Unassigned',
    room: resident?.room || '—',
    branch: resident?.branch || 'Florence House',
    permissions,
    status: 'pending',
    sendCount: 1,
    lastSentAt: now,
    acceptedAt: null,
    expiresAt: daysFromNow(7),
    revokedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  mockFamilyInvitations.unshift(newInvitation);
  return newInvitation;
}

export function updateMockFamilyInvitation(id, patch = {}) {
  const record = mockFamilyInvitations.find((item) => item._id === id);
  if (!record) return null;

  ['name', 'email', 'phone', 'role', 'relationship', 'isNok', 'permissions'].forEach((key) => {
    if (patch[key] !== undefined) record[key] = patch[key];
  });

  if (patch.residentId !== undefined) {
    const resident = mockResidentOptions.find((r) => r.id === patch.residentId);
    record.residentId = patch.residentId;
    record.residentName = resident?.name || record.residentName;
    record.room = resident?.room || record.room;
    record.branch = resident?.branch || record.branch;
  }

  record.updatedAt = new Date().toISOString();
  return record;
}

export function resendMockFamilyInvite(id) {
  const record = mockFamilyInvitations.find((item) => item._id === id);
  if (!record) return null;

  const now = new Date().toISOString();
  record.lastSentAt = now;
  record.sendCount = (record.sendCount || 0) + 1;
  record.expiresAt = daysFromNow(7);
  record.updatedAt = now;
  return record;
}

export function revokeMockFamilyInvite(id) {
  const record = mockFamilyInvitations.find((item) => item._id === id);
  if (!record) return null;

  const now = new Date().toISOString();
  record.status = 'revoked';
  record.revokedAt = now;
  record.updatedAt = now;
  return record;
}

export function deleteMockFamilyInvitation(id) {
  const index = mockFamilyInvitations.findIndex((item) => item._id === id);
  if (index === -1) return false;

  mockFamilyInvitations.splice(index, 1);
  return true;
}

// ----------------------------------------------------------------------
// Mock Members (Accepted & Active Family Members)
// ----------------------------------------------------------------------

export const mockFamilyMembers = [
  {
    _id: 'fam-mem-101',
    name: 'Sarah Hughes',
    email: 'sarah.hughes@example.com',
    phone: '+44 7700 900123',
    role: 'primary_admin',
    relationship: 'Daughter',
    isNok: true,
    residentId: 'resident-001',
    residentName: 'Margaret Hughes',
    room: '12',
    branch: 'Florence House',
    permissions: ['wall.view', 'photos.upload', 'gazette.view', 'newsletter.receive', 'stories.submit'],
    status: 'active',
    joinedDate: daysFromNow(-29),
    createdAt: daysFromNow(-30),
    updatedAt: daysFromNow(-29),
  },
  {
    _id: 'fam-mem-102',
    name: 'David Hughes',
    email: 'david.h@example.com',
    phone: '+44 7700 900124',
    role: 'family_member',
    relationship: 'Son',
    isNok: false,
    residentId: 'resident-001',
    residentName: 'Margaret Hughes',
    room: '12',
    branch: 'Florence House',
    permissions: ['wall.view', 'photos.upload', 'gazette.view'],
    status: 'active',
    joinedDate: daysFromNow(-24),
    createdAt: daysFromNow(-25),
    updatedAt: daysFromNow(-24),
  },
  {
    _id: 'fam-mem-103',
    name: 'Mark Cole',
    email: 'mark.c@example.com',
    phone: '+44 7700 900789',
    role: 'primary_admin',
    relationship: 'Son',
    isNok: true,
    residentId: 'resident-004',
    residentName: 'Albert Cole',
    room: '15',
    branch: 'Oakwood Lodge',
    permissions: ['wall.view', 'photos.upload', 'gazette.view', 'newsletter.receive'],
    status: 'active',
    joinedDate: daysFromNow(-39),
    createdAt: daysFromNow(-40),
    updatedAt: daysFromNow(-39),
  },
  {
    _id: 'fam-mem-104',
    name: 'James Miller',
    email: 'james.miller@example.com',
    phone: '+44 7700 900654',
    role: 'family_member',
    relationship: 'Son',
    isNok: true,
    residentId: 'resident-008',
    residentName: 'Dorothy Miller',
    room: '102',
    branch: 'Hanley House',
    permissions: ['wall.view', 'photos.upload', 'gazette.view'],
    status: 'active',
    joinedDate: daysFromNow(-14),
    createdAt: daysFromNow(-15),
    updatedAt: daysFromNow(-14),
  },
  {
    _id: 'fam-mem-105',
    name: 'Ellen Price',
    email: 'ellen.price@example.com',
    phone: '+44 7700 900456',
    role: 'primary_admin',
    relationship: 'Niece',
    isNok: true,
    residentId: 'resident-002',
    residentName: 'Dennis Rowe',
    room: '4',
    branch: 'Hanley House',
    permissions: ['wall.view', 'photos.upload', 'gazette.view', 'newsletter.receive'],
    status: 'inactive',
    joinedDate: daysFromNow(-60),
    createdAt: daysFromNow(-65),
    updatedAt: daysFromNow(-10),
  },
];

export const getMockFamilyMemberById = (id) =>
  mockFamilyMembers.find((item) => item._id === id) ?? null;

export function updateMockFamilyMember(id, patch = {}) {
  const member = mockFamilyMembers.find((item) => item._id === id);
  if (!member) return null;

  ['name', 'email', 'phone', 'role', 'relationship', 'isNok', 'permissions', 'status'].forEach((key) => {
    if (patch[key] !== undefined) member[key] = patch[key];
  });

  if (patch.residentId !== undefined) {
    const resident = mockResidentOptions.find((r) => r.id === patch.residentId);
    member.residentId = patch.residentId;
    member.residentName = resident?.name || member.residentName;
    member.room = resident?.room || member.room;
    member.branch = resident?.branch || member.branch;
  }

  member.updatedAt = new Date().toISOString();
  return member;
}

export function deactivateMockFamilyMember(id) {
  const member = mockFamilyMembers.find((item) => item._id === id);
  if (!member) return null;

  member.status = member.status === 'active' ? 'inactive' : 'active';
  member.updatedAt = new Date().toISOString();
  return member;
}

export function deleteMockFamilyMember(id) {
  const index = mockFamilyMembers.findIndex((item) => item._id === id);
  if (index === -1) return false;

  mockFamilyMembers.splice(index, 1);
  return true;
}

// ----------------------------------------------------------------------
// Compatibility aliases
// ----------------------------------------------------------------------
export const FAMILY_MEMBERSHIP_STATUS_OPTIONS = FAMILY_INVITATION_STATUS_OPTIONS;
export const getFamilyMembershipStatusMeta = getFamilyInvitationStatusMeta;
export const mockFamilyMemberships = mockFamilyInvitations;
export const getMockFamilyMembershipById = getMockFamilyInvitationById;
export const createMockFamilyMembership = createMockFamilyInvitation;
export const updateMockFamilyMembership = updateMockFamilyInvitation;
export const deleteMockFamilyMembership = deleteMockFamilyInvitation;
export const resendMockFamilyInvitation = resendMockFamilyInvite;
export const revokeMockFamilyInvitation = revokeMockFamilyInvite;
export const toggleFamilyMemberStatus = deactivateMockFamilyMember;