import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';
import { mockFloors } from 'src/sections/floor-plans/mocks/data';
import { PEEP_LEVELS, RESIDENTS } from 'src/sections/active-sections/peen-floor-plan/mocks/data';

// ----------------------------------------------------------------------
// Scope to the demo owner organization — same convention as
// src/sections/resident/mocks/data.js.
// ----------------------------------------------------------------------

const organizationId = mockOrganizations[0]?._id;
const ownerSites = mockBranches.filter((branch) => branch.organizationId === organizationId);

const siteAt = (index) => ownerSites[index % ownerSites.length];

// ----------------------------------------------------------------------
// Floor options — sourced from the Floor Plans feature's `mockFloors`
// (src/sections/floor-plans/mocks/data.js), the single source of truth for
// floors, so this filter can never drift from the Floor Plans listing.
// ----------------------------------------------------------------------

export const PEEP_FLOOR_OPTIONS = Array.from(new Set(mockFloors.map((floor) => floor.name))).map(
    (name) => ({ value: name, label: name })
);

export const getPeepFloorLabel = (value) =>
    PEEP_FLOOR_OPTIONS.find((option) => option.value === value)?.label || value || '—';

// Picks a floor that actually belongs to the given site, so a record's floor
// and site are never inconsistent with each other.
const floorForSite = (branchId, index) => {
    const siteFloors = mockFloors.filter((floor) => floor.branchId === branchId);
    if (!siteFloors.length) return null;
    return siteFloors[index % siteFloors.length].name;
};

// ----------------------------------------------------------------------
// PEEP level — options + label/colour lookup derived from the single
// PEEP_LEVELS source of truth (src/sections/active-sections/peen-floor-plan).
// ----------------------------------------------------------------------

export const PEEP_LEVEL_OPTIONS = Object.entries(PEEP_LEVELS).map(([value, level]) => ({
    value,
    ...level,
}));

export const getPeepLevelMeta = (value) =>
    PEEP_LEVEL_OPTIONS.find((option) => option.value === value) || {
        value,
        label: value || 'Not set',
        color: 'default',
    };

// ----------------------------------------------------------------------

const EMPTY_RECORD_FIELDS = {
    supportNeeds: '',
    primaryRoute: '',
    secondaryRoute: '',
    equipmentRequired: '',
    responsibleStaff: '',
};

const DEFAULT_SITE = siteAt(0);
const DEFAULT_FLOOR = floorForSite(DEFAULT_SITE?._id, 0) || PEEP_FLOOR_OPTIONS[0]?.value || null;

export const PEEP_RECORDS = RESIDENTS.map((resident, index) => {
    const site = siteAt(index);

    return {
        ...resident,
        ...EMPTY_RECORD_FIELDS,
        supportNeeds: resident.peepSummary,
        residentId: resident.id,
        branchId: site?._id || null,
        branch: site?.name || '—',
        floor: floorForSite(site?._id, index),
    };
});

export function getPeepRecordById(id) {
    return PEEP_RECORDS.find((record) => record.id === id);
}

export function createPeepRecord(values) {
    const resident = RESIDENTS.find((item) => item.id === values.residentId);
    const record = {
        ...resident,
        ...EMPTY_RECORD_FIELDS,
        branchId: DEFAULT_SITE?._id || null,
        branch: DEFAULT_SITE?.name || '—',
        floor: DEFAULT_FLOOR,
        ...values,
        id: `peep-${Date.now()}`,
    };

    PEEP_RECORDS.push(record);
    return record;
}

export function updatePeepRecord(id, values) {
    const index = PEEP_RECORDS.findIndex((record) => record.id === id);
    if (index === -1) return undefined;

    PEEP_RECORDS[index] = { ...PEEP_RECORDS[index], ...values };
    return PEEP_RECORDS[index];
}

export { PEEP_LEVELS, RESIDENTS };
