
export const FLOOR_PLAN = {
  id: 'fp-001',
  siteId: 'site-001',
  siteName: 'Greenview Residence',
  fileName: 'Greenview_FloorPlan_Level_1.pdf',
  uploadedBy: 'Site Manager',
  uploadedAt: '20 Aug 2026, 10:30 AM',
  lastUpdated: '20 Aug 2026, 10:35 AM',
  status: 'ready',
  imageUrl: null,
};

export const PEEP_LEVELS = {
  low: {
    label: 'Low',
    description: 'Independent / Minimal assistance',
    color: 'success',
  },
  medium: {
    label: 'Medium',
    description: 'Partial assistance',
    color: 'warning',
  },
  high: {
    label: 'High',
    description: 'Full assistance / Dependent',
    color: 'error',
  },
};

export const RESIDENTS = [
  {
    id: 'resident-001',
    name: 'John Smith',
    image: 'https://i.pravatar.cc/150?img=12',
    email: 'john.smith@example.com',
    initials: 'JS',
    roomNumber: '101',
    peepLevel: 'low',
    peepSummary:
      'Independent with minimal assistance required during evacuation.',
    emergencyContact: {
      name: 'Sarah Smith',
      relation: 'Daughter',
      phone: '+44 7700 900123',
    },
    notes: 'Prefers evacuation via stairwell.',
  },
  {
    id: 'resident-002',
    name: 'Mary Johnson',
    image: 'https://i.pravatar.cc/150?img=47',
    email: 'mary.johnson@example.com',
    initials: 'MJ',
    roomNumber: '102',
    peepLevel: 'medium',
    peepSummary:
      'Requires partial assistance and supervision during evacuation.',
    emergencyContact: {
      name: 'David Johnson',
      relation: 'Son',
      phone: '+44 7700 900124',
    },
    notes: 'Ensure walking aid is available.',
  },
  {
    id: 'resident-003',
    name: 'Robert Brown',
    image: 'https://i.pravatar.cc/150?img=11',
    email: 'robert.brown@example.com',
    initials: 'RB',
    roomNumber: '103',
    peepLevel: 'high',
    peepSummary:
      'Requires full assistance and dedicated evacuation support.',
    emergencyContact: {
      name: 'Emily Brown',
      relation: 'Daughter',
      phone: '+44 7700 900125',
    },
    notes: 'Requires two-person assistance.',
  },
  {
    id: 'resident-004',
    name: 'Linda Davis',
    image: 'https://i.pravatar.cc/150?img=44',
    email: 'linda.davis@example.com',
    initials: 'LD',
    roomNumber: '104',
    peepLevel: 'low',
    peepSummary: 'Independent during evacuation.',
    emergencyContact: {
      name: 'Michael Davis',
      relation: 'Son',
      phone: '+44 7700 900126',
    },
    notes: 'No additional requirements.',
  },
  {
    id: 'resident-005',
    name: 'William Wilson',
    image: 'https://i.pravatar.cc/150?img=68',
    email: 'william.wilson@example.com',
    initials: 'WW',
    roomNumber: '105',
    peepLevel: 'medium',
    peepSummary: 'Requires partial support during evacuation.',
    emergencyContact: {
      name: 'Anna Wilson',
      relation: 'Wife',
      phone: '+44 7700 900127',
    },
    notes: 'Keep route clear.',
  },
  {
    id: 'resident-006',
    name: 'James Taylor',
    image: 'https://i.pravatar.cc/150?img=33',
    email: 'james.taylor@example.com',
    initials: 'JT',
    roomNumber: '106',
    peepLevel: 'low',
    peepSummary: 'Independent with minimal assistance.',
    emergencyContact: {
      name: 'Helen Taylor',
      relation: 'Wife',
      phone: '+44 7700 900128',
    },
    notes: '',
  },
];

export function getResidentPeepById(id) {
  return RESIDENTS.find((resident) => resident.id === id) || null;
}

export const FLOOR_PLAN_PINS = [
  {
    id: 'pin-001',
    residentId: 'resident-001',
    x: 0.19,
    y: 0.25,
  },
  {
    id: 'pin-002',
    residentId: 'resident-002',
    x: 0.41,
    y: 0.25,
  },
  {
    id: 'pin-003',
    residentId: 'resident-003',
    x: 0.63,
    y: 0.25,
  },
  {
    id: 'pin-004',
    residentId: 'resident-004',
    x: 0.83,
    y: 0.25,
  },
  {
    id: 'pin-005',
    residentId: 'resident-005',
    x: 0.19,
    y: 0.57,
  },
  {
    id: 'pin-006',
    residentId: 'resident-006',
    x: 0.82,
    y: 0.57,
  },
];

// ----------------------------------------------------------------------
// Uploaded floor plan PDF — prototype only, so it's kept as plain in-memory
// module state (an object URL to the selected File) rather than persisted
// anywhere. That means it's naturally cleared on every page reload, same as
// the rest of this mock data.
// ----------------------------------------------------------------------

let currentFloorPlanFile = null;
let activeFloorPlanPins = [...FLOOR_PLAN_PINS];
let isCustomFloorPlanUploaded = false;

export function getFloorPlanFile() {
  return currentFloorPlanFile;
}

export function getFloorPlanPins() {
  return activeFloorPlanPins;
}

export function setFloorPlanPins(nextPins) {
  activeFloorPlanPins = Array.isArray(nextPins) ? [...nextPins] : [];
  return activeFloorPlanPins;
}

export function setFloorPlanFile(file, imageResult) {
  if (currentFloorPlanFile?.url) {
    URL.revokeObjectURL(currentFloorPlanFile.url);
  }
  if (currentFloorPlanFile?.imageUrl && currentFloorPlanFile.imageUrl.startsWith('blob:')) {
    URL.revokeObjectURL(currentFloorPlanFile.imageUrl);
  }

  if (!file && !imageResult) {
    currentFloorPlanFile = null;
    isCustomFloorPlanUploaded = false;
    activeFloorPlanPins = [...FLOOR_PLAN_PINS];
    return null;
  }

  const imageUrl =
    imageResult?.imageUrl ||
    imageResult?.dataUrl ||
    (file && file.type && file.type.startsWith('image/') ? URL.createObjectURL(file) : null);

  const pdfUrl = file ? URL.createObjectURL(file) : null;

  currentFloorPlanFile = {
    file,
    fileName: file?.name || 'Floor Plan',
    url: pdfUrl,
    imageUrl: imageUrl || null,
    aspectRatio: imageResult?.aspectRatio || 1.55,
  };

  // When a new floor plan is uploaded, reset pins so user can place their own pins cleanly
  isCustomFloorPlanUploaded = true;
  activeFloorPlanPins = [];

  return currentFloorPlanFile;
}

// ----------------------------------------------------------------------
// Prototype helper for the "Add Pin" wizard — no backend yet, so it mutates
// the in-memory arrays directly (same convention as createMockFloor in
// src/sections/floor-plans/mocks/data.js). Combines resident creation (when
// no existing resident is picked), PEEP record fields, and pin placement
// into a single save, matching the wizard's "one save" flow.
// ----------------------------------------------------------------------

export function createResidentPeepPin({ resident, peep, pin }) {
  let target = resident.id ? RESIDENTS.find((item) => item.id === resident.id) : null;

  if (!target) {
    const initials = (resident.name || '')
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    target = {
      id: `resident-${Date.now()}`,
      name: resident.name,
      roomNumber: resident.roomNumber,
      image: '',
      email: '',
      initials,
      emergencyContact: {},
      notes: '',
    };
    RESIDENTS.push(target);
  }

  Object.assign(target, {
    peepLevel: peep.peepLevel,
    supportNeeds: peep.supportNeeds,
    primaryRoute: peep.primaryRoute,
    secondaryRoute: peep.secondaryRoute,
    equipmentRequired: peep.equipmentRequired,
    responsibleStaff: peep.responsibleStaff,
    peepSummary: peep.equipmentRequired || target.peepSummary || '',
  });

  // If resident already had a pin, replace it
  const existingActiveIdx = activeFloorPlanPins.findIndex((p) => p.residentId === target.id);
  if (existingActiveIdx !== -1) {
    activeFloorPlanPins.splice(existingActiveIdx, 1);
  }
  const existingDefaultIdx = FLOOR_PLAN_PINS.findIndex((p) => p.residentId === target.id);
  if (existingDefaultIdx !== -1) {
    FLOOR_PLAN_PINS.splice(existingDefaultIdx, 1);
  }

  const newPin = { id: `pin-${Date.now()}`, residentId: target.id, x: pin.x, y: pin.y };
  activeFloorPlanPins.push(newPin);
  FLOOR_PLAN_PINS.push(newPin);

  return { resident: target, pin: newPin };
}