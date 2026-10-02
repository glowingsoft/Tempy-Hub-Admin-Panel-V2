export const mockKiosks = [
  {
    _id: 'kiosk-001',
    name: 'Front Desk Kiosk',
    kioskCode: 'KSK-001',

    site: {
      name: 'Lahore Office',
      code: 'LHR-001',
    },

    device: {
      name: 'Reception iPad',
      type: 'ipad',
    },

    status: 'online',
    setupStatus: 'registered',

    registrationDate: 'Aug 10, 2026',
    lastActive: '2 minutes ago',
    lastIp: '192.168.1.101',

    activity: {
      checkIns: 32,
      checkOuts: 18,
      visitors: 4,
      total: 50,
    },

    settings: {
      checkInMethods: ['employee_id', 'pin'],
      allowCheckOut: true,
      enableBreaks: true,
      phoneCheckIn: false,
      screenTimeout: 60,
      receptionIdentifier: 'FRONT-DESK',
    },
  },

  {
    _id: 'kiosk-002',
    name: 'Reception Kiosk',
    kioskCode: 'KSK-002',

    site: {
      name: 'Lahore Office',
      code: 'LHR-001',
    },

    device: {
      name: 'Reception Android',
      type: 'android',
    },

    status: 'online',
    setupStatus: 'registered',

    registrationDate: 'Aug 12, 2026',
    lastActive: '5 minutes ago',
    lastIp: '192.168.1.102',

    activity: {
      checkIns: 27,
      checkOuts: 16,
      visitors: 2,
      total: 43,
    },

    settings: {
      checkInMethods: ['pin'],
      allowCheckOut: true,
      enableBreaks: false,
      phoneCheckIn: true,
      screenTimeout: 90,
      receptionIdentifier: 'RECEPTION',
    },
  },

  {
    _id: 'kiosk-003',
    name: 'Floor 2 Kiosk',
    kioskCode: 'KSK-003',

    site: {
      name: 'Islamabad Office',
      code: 'ISB-001',
    },

    device: {
      name: 'Floor 2 Tablet',
      type: 'android',
    },

    status: 'offline',
    setupStatus: 'registered',

    registrationDate: 'Aug 5, 2026',
    lastActive: '1 hour ago',
    lastIp: '192.168.2.103',

    activity: {
      checkIns: 18,
      checkOuts: 11,
      visitors: 1,
      total: 29,
    },

    settings: {
      checkInMethods: ['employee_id', 'pin'],
      allowCheckOut: true,
      enableBreaks: true,
      phoneCheckIn: false,
      screenTimeout: 60,
      receptionIdentifier: 'FLOOR-2',
    },
  },

  {
    _id: 'kiosk-004',
    name: 'Main Entrance',
    kioskCode: 'KSK-004',

    site: {
      name: 'Karachi Office',
      code: 'KHI-001',
    },

    device: {
      name: 'Entrance iPad',
      type: 'ipad',
    },

    status: 'online',
    setupStatus: 'registered',

    registrationDate: 'Aug 15, 2026',
    lastActive: 'Just now',
    lastIp: '192.168.3.104',

    activity: {
      checkIns: 41,
      checkOuts: 25,
      visitors: 6,
      total: 66,
    },

    settings: {
      checkInMethods: ['qr_code', 'employee_id'],
      allowCheckOut: true,
      enableBreaks: true,
      phoneCheckIn: true,
      screenTimeout: 120,
      receptionIdentifier: 'MAIN-ENTRANCE',
    },
  },

  {
    _id: 'kiosk-005',
    name: 'Employee Entrance',
    kioskCode: 'KSK-005',

    site: {
      name: 'Karachi Office',
      code: 'KHI-001',
    },

    device: {
      name: 'Windows Kiosk',
      type: 'windows',
    },

    status: 'inactive',
    setupStatus: 'registered',

    registrationDate: 'Jul 28, 2026',
    lastActive: 'Yesterday',
    lastIp: '192.168.3.105',

    activity: {
      checkIns: 0,
      checkOuts: 0,
      visitors: 0,
      total: 0,
    },

    settings: {
      checkInMethods: ['pin'],
      allowCheckOut: false,
      enableBreaks: false,
      phoneCheckIn: false,
      screenTimeout: 60,
      receptionIdentifier: 'EMP-ENTRANCE',
    },
  },

  {
    _id: 'kiosk-006',
    name: 'New Reception Kiosk',
    kioskCode: 'KSK-006',

    site: {
      name: 'Lahore Office',
      code: 'LHR-001',
    },

    device: {
      name: 'New Reception Tablet',
      type: 'android',
    },

    status: 'offline',
    setupStatus: 'pending',

    registrationDate: null,
    lastActive: 'Never',
    lastIp: null,

    activity: {
      checkIns: 0,
      checkOuts: 0,
      visitors: 0,
      total: 0,
    },

    settings: {
      checkInMethods: [],
      allowCheckOut: true,
      enableBreaks: false,
      phoneCheckIn: false,
      screenTimeout: 60,
      receptionIdentifier: '',
    },
  },
];