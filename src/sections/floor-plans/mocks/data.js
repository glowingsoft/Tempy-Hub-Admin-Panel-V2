// Mock data for the Floor Plans listing (Owner Dashboard → PEEP & Floor Plans).
//
// A "floor" is its own entity, independent of whether a plan PDF has been
// uploaded for it yet (see peepfloor.html, frame C1/D1). This is the single
// source of truth for floors — src/sections/peep-records/mocks/data.js reads
// the floor names from here for its "Floor" filter, so the two stay aligned.
//
// TODO: replace with the real endpoints once available:
//   GET  /admin/organizations/:organizationId/floors
//   POST /admin/organizations/:organizationId/floors            (add floor)
//   POST /admin/floors/:floorId/plan                             (upload/replace plan)

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

export const FLOOR_STATUS_OPTIONS = [
  { value: 'uploaded', label: 'Plan uploaded', color: 'success' },
  { value: 'notUploaded', label: 'No plan yet', color: 'default' },
];

export const getFloorStatusMeta = (value) =>
  FLOOR_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

// ----------------------------------------------------------------------
// Scope to the demo owner organization — same convention as
// src/sections/resident/mocks/data.js and src/sections/peep-records/mocks/data.js.
// ----------------------------------------------------------------------

const organizationId = mockOrganizations[0]?._id;
const ownerSites = mockBranches.filter((branch) => branch.organizationId === organizationId);

const FLOOR_NAMES = ['Ground Floor', 'First Floor', 'Second Floor'];

let floorSeq = 0;

const buildFloor = (site, name, seed = {}) => {
  floorSeq += 1;
  return {
    id: `floor-${floorSeq}`,
    branchId: site?._id || null,
    branch: site?.name || '—',
    name,
    status: seed.status || 'notUploaded',
    version: seed.version || null,
    fileName: seed.fileName || null,
    pinsCount: seed.pinsCount || 0,
    uploadedAt: seed.uploadedAt || null,
    createdAt: seed.createdAt || new Date().toISOString(),
  };
};

// Seed: the first owner site mirrors the wireframe (Ground Floor v2/7 pins,
// First Floor v1/4 pins, Second Floor with no plan yet); the second site is
// only partially set up, so both statuses are represented across sites.
const SEEDS_BY_SITE_INDEX = [
  [
    { status: 'uploaded', version: 2, fileName: 'ground-floor-v2.pdf', pinsCount: 7, uploadedAt: '2026-09-10T09:00:00.000Z' },
    { status: 'uploaded', version: 1, fileName: 'first-floor-v1.pdf', pinsCount: 4, uploadedAt: '2026-06-03T11:00:00.000Z' },
    {},
  ],
  [
    { status: 'uploaded', version: 1, fileName: 'ground-floor-v1.pdf', pinsCount: 2, uploadedAt: '2026-08-20T09:00:00.000Z' },
    {},
    {},
  ],
];

export const mockFloors = ownerSites.flatMap((site, siteIndex) =>
  FLOOR_NAMES.map((name, floorIndex) =>
    buildFloor(site, name, SEEDS_BY_SITE_INDEX[siteIndex]?.[floorIndex])
  )
);

export const getMockFloorById = (id) => mockFloors.find((floor) => floor.id === id);

// Per-site rollup — a site "has a floor plan" once at least one of its floors
// is uploaded. Used by the PEEP Records summary cards (Owner Dashboard).
export function getFloorPlanCoverage() {
  const sitesWithPlan = new Set(
    mockFloors.filter((floor) => floor.status === 'uploaded').map((floor) => floor.branchId)
  );

  return {
    totalSites: ownerSites.length,
    sitesWithPlan: sitesWithPlan.size,
    sitesWithoutPlan: Math.max(ownerSites.length - sitesWithPlan.size, 0),
  };
}

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory list so the
// list screen reflects the change.
// ----------------------------------------------------------------------

export function createMockFloor({ branchId, name }) {
  const site = ownerSites.find((item) => item._id === branchId) || ownerSites[0];
  const floor = buildFloor(site, name);

  mockFloors.unshift(floor);
  return floor;
}

export function uploadMockFloorPlan(id, file, convertedImage) {
  const floor = mockFloors.find((item) => item.id === id);
  if (!floor) return null;

  floor.status = 'uploaded';
  floor.version = (floor.version || 0) + 1;
  floor.fileName = file?.name || floor.fileName;
  floor.uploadedAt = new Date().toISOString();
  if (convertedImage?.imageUrl || convertedImage?.dataUrl) {
    floor.imageUrl = convertedImage.imageUrl || convertedImage.dataUrl;
  }

  return floor;
}
