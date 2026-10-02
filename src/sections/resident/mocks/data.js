import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

const organizationId = mockOrganizations[0]?._id;
const ownerBranches = mockBranches.filter((branch) => branch.organizationId === organizationId);

const branchAt = (index) => ownerBranches[index % ownerBranches.length];

export const RESIDENT_STATUS_OPTIONS = [
    { value: 'active', label: 'Active', color: 'success' },
    { value: 'inactive', label: 'Inactive', color: 'default' },
];

export const RESIDENT_CARE_LEVEL_OPTIONS = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
];

const createResident = (resident, branchIndex = 0) => {
    const branch = branchAt(branchIndex);

    return {
        ...resident,
        organizationId,
        branchId: branch?._id,
        branch: branch?.name || '—',
    };
};

export const mockResidents = [
    createResident({
        _id: 'resident-001',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+44 7700 900123',
        roomNumber: '101',
        careLevel: 'low',
        status: 'active',
        dateOfBirth: '1942-04-18',
        emergencyContact: 'Sarah Smith',
        image: 'https://i.pravatar.cc/150?img=12',
        securityPassword: 'SMITH-4821',
        hasRestrictions: true,
        approvedCallers: ['Sarah Smith (Daughter)', 'Mark Smith (Son)'],
        restrictionNotes: 'Require password before giving medical updates over the phone. Do not allow visits from ex-partner.',
    }, 0),
    createResident({
        _id: 'resident-002',
        name: 'Mary Johnson',
        email: 'mary.johnson@example.com',
        phone: '+44 7700 900124',
        roomNumber: '102',
        careLevel: 'medium',
        status: 'active',
        dateOfBirth: '1938-09-07',
        emergencyContact: 'David Johnson',
        image: 'https://i.pravatar.cc/150?img=47',
        securityPassword: 'MARY-7710',
        hasRestrictions: false,
        approvedCallers: ['David Johnson (Son)'],
        restrictionNotes: '',
    }, 0),
    createResident({
        _id: 'resident-003',
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        phone: '+44 7700 900125',
        roomNumber: '103',
        careLevel: 'high',
        status: 'active',
        dateOfBirth: '1935-12-21',
        emergencyContact: 'Emily Brown',
        image: 'https://i.pravatar.cc/150?img=11',
        securityPassword: 'BROWN-3042',
        hasRestrictions: true,
        approvedCallers: ['Emily Brown (Wife)'],
        restrictionNotes: 'Restricted visits after 7 PM. Always verify password for phone inquiries.',
    }, 1),
    createResident({
        _id: 'resident-004',
        name: 'Linda Davis',
        email: 'linda.davis@example.com',
        phone: '+44 7700 900126',
        roomNumber: '104',
        careLevel: 'low',
        status: 'active',
        dateOfBirth: '1945-06-02',
        emergencyContact: 'Michael Davis',
        image: 'https://i.pravatar.cc/150?img=44',
        securityPassword: 'DAVIS-1192',
        hasRestrictions: false,
        approvedCallers: ['Michael Davis (Brother)'],
        restrictionNotes: '',
    }, 1),
    createResident({
        _id: 'resident-005',
        name: 'William Wilson',
        email: 'william.wilson@example.com',
        phone: '+44 7700 900127',
        roomNumber: '105',
        careLevel: 'medium',
        status: 'active',
        dateOfBirth: '1940-11-13',
        emergencyContact: 'Anna Wilson',
        image: 'https://i.pravatar.cc/150?img=68',
        securityPassword: 'WILSON-5541',
        hasRestrictions: true,
        approvedCallers: ['Anna Wilson (Daughter)'],
        restrictionNotes: 'Verify caller identity with security password before discussing care details.',
    }, 0),
    createResident({
        _id: 'resident-006',
        name: 'James Taylor',
        email: 'james.taylor@example.com',
        phone: '+44 7700 900128',
        roomNumber: '106',
        careLevel: 'low',
        status: 'inactive',
        dateOfBirth: '1939-02-28',
        emergencyContact: 'Helen Taylor',
        image: 'https://i.pravatar.cc/150?img=33',
        securityPassword: 'TAYLOR-9012',
        hasRestrictions: false,
        approvedCallers: ['Helen Taylor (Spouse)'],
        restrictionNotes: '',
    }, 1),
];

export const mockResidentsResponse = {
    message: 'Data fetched successfully',
    data: mockResidents,
    meta: { currentPage: 1, totalPages: 1, totalRecords: mockResidents.length, limit: 10 },
};

export const getMockResidentById = (id) => mockResidents.find((resident) => resident._id === id) ?? null;
