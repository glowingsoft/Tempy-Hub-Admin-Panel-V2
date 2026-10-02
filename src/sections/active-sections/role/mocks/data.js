export const MOCK_ROLES = [
  {
    id: 'role-001',
    name: 'Senior Care Assistant',
    description: 'Manages senior care related activities.',
    permissions: [
      'view_residents',
      'manage_attendance',
      'view_reports',
    ],
    createdBy: 'John Site Manager',
    createdAt: '2026-08-20',
    status: 'pending',
    roleType: 'site_manager',
  },
  {
    id: 'role-002',
    name: 'Kitchen Supervisor',
    description: 'Manages kitchen and food related activities.',
    permissions: [
      'view_kitchen',
      'manage_staff',
    ],
    createdBy: 'Sarah Site Manager',
    createdAt: '2026-08-18',
    status: 'approved',
    roleType: 'custom',
  },
  {
    id: 'role-003',
    name: 'Activities Coordinator',
    description: 'Manages resident activities and events.',
    permissions: [
      'view_residents',
      'manage_activities',
    ],
    createdBy: 'John Site Manager',
    createdAt: '2026-08-15',
    status: 'rejected',
    rejectionReason: 'The selected permissions are too broad.',
    roleType: 'custom',
  },
];

export const ROLE_PERMISSIONS = [
    {
        group: 'Employees',
        permissions: [
            {
                value: 'view_employees',
                label: 'View Employees',
            },
            {
                value: 'manage_employees',
                label: 'Manage Employees',
            },
        ],
    },
    {
        group: 'Residents',
        permissions: [
            {
                value: 'view_residents',
                label: 'View Residents',
            },
            {
                value: 'manage_residents',
                label: 'Manage Residents',
            },
        ],
    },
    {
        group: 'Attendance',
        permissions: [
            {
                value: 'view_attendance',
                label: 'View Attendance',
            },
            {
                value: 'manage_attendance',
                label: 'Manage Attendance',
            },
        ],
    },
    {
        group: 'Visitors',
        permissions: [
            {
                value: 'view_visitors',
                label: 'View Visitors',
            },
            {
                value: 'manage_visitors',
                label: 'Manage Visitors',
            },
        ],
    },
    {
        group: 'Reports',
        permissions: [
            {
                value: 'view_reports',
                label: 'View Reports',
            },
            {
                value: 'manage_reports',
                label: 'Manage Reports',
            },
        ],
    },
    {
        group: 'Kiosk',
        permissions: [
            {
                value: 'view_kiosk',
                label: 'View Kiosk',
            },
            {
                value: 'manage_kiosk',
                label: 'Manage Kiosk',
            },
        ],
    },
    {
        group: 'Configuration',
        permissions: [
            {
                value: 'view_configuration',
                label: 'View Configuration',
            },
            {
                value: 'manage_configuration',
                label: 'Manage Configuration',
            },
        ],
    },
];