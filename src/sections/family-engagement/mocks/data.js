import { mockResidents } from 'src/sections/resident/mocks/data';
import { _pendingPhotoApprovals } from 'src/sections/active-sections/photo-approval/mocks/data';

// ----------------------------------------------------------------------
// Mock data for Family Engagement Overview
// ----------------------------------------------------------------------

export const mockFamilyOverviewData = {
  site: {
    id: 'florence',
    name: 'Florence House',
    location: 'Birmingham, UK',
    availableSites: ['Florence House', 'Hanley House', 'Oakwood Lodge'],
  },
  metrics: {
    uploadsWaiting: 6,
    residentsWithFamily: 42,
    currentIssue: {
      number: 'Issue 14',
      title: 'Autumn Gazette #14',
      closesInDays: 3,
      deadlineText: 'closes in 3 days',
      deadlineDate: '15 Oct 2026',
    },
    residentsWithNoContent: 4,
  },
  dashboardShortcuts: [
    {
      id: 'on-site',
      key: 'onSite',
      title: 'On site',
      countText: '34 present',
      caption: 'Residents & staff',
      icon: 'ic-user',
      color: 'primary',
      badge: 'Live',
    },
    {
      id: 'visitors',
      key: 'visitors',
      title: 'Visitors',
      countText: '12 logged',
      caption: 'Checked in today',
      icon: 'ic-users',
      color: 'info',
      badge: 'Today',
    },
    {
      id: 'evacuation',
      key: 'evacuation',
      title: 'Evacuation',
      countText: 'Ready',
      caption: 'PEEP & floor plans',
      icon: 'ic-compliance',
      color: 'success',
      badge: 'Compliant',
    },
    {
      id: 'rota',
      key: 'rota',
      title: 'Rota',
      countText: '8 on duty',
      caption: 'Current active shift',
      icon: 'ic-rota',
      color: 'warning',
      badge: 'Day shift',
    },
  ],
  activity: {
    period: 'Last 7 days',
    uploads: {
      total: 18,
      approved: 11,
      waiting: 5,
      notApproved: 2,
    },
    wallPosts: {
      count: 4,
      reactions: 112,
      comments: 29,
    },
    newsletter: {
      title: 'Issue 14 (Gazette)',
      scheduledDate: '31 Oct',
      status: 'draft',
      label: 'Next newsletter: 31 Oct (draft)',
    },
  },
  checklist: [
    {
      id: 'task-1',
      stepNumber: 1,
      text: 'Clear the moderation queue',
      completed: false,
    },
    {
      id: 'task-2',
      stepNumber: 2,
      text: 'Check the 4 residents with no content',
      completed: false,
    },
    {
      id: 'task-3',
      stepNumber: 3,
      text: 'Generate all gazettes and review',
      completed: false,
    },
    {
      id: 'task-4',
      stepNumber: 4,
      text: 'Print and give to residents',
      completed: false,
    },
  ],
  moderationItems: [
    {
      id: 'mod-1',
      resident: 'Arthur Pendelton',
      sender: 'Sarah Pendelton (Daughter)',
      type: 'photo',
      title: 'Garden walk with grandchildren',
      caption: 'Dad loved visiting the botanic gardens last weekend with little Toby and Maya!',
      time: '2 hours ago',
      status: 'waiting',
      tag: 'Family Story',
    },
    {
      id: 'mod-2',
      resident: 'Dorothy Miller',
      sender: 'James Miller (Son)',
      type: 'photo',
      title: '80th Birthday celebration memories',
      caption: 'Photo from mum’s birthday party surrounded by all her children and grand-kids.',
      time: '5 hours ago',
      status: 'waiting',
      tag: 'Milestone',
    },
    {
      id: 'mod-3',
      resident: 'Margaret Thatcher',
      sender: 'Emma Watson (Niece)',
      type: 'message',
      title: 'Thinking of you auntie Margaret!',
      caption: 'Sending warm autumn wishes from Manchester. We will come visit next Sunday.',
      time: 'Yesterday at 4:15 PM',
      status: 'waiting',
      tag: 'Greeting',
    },
    {
      id: 'mod-4',
      resident: 'William Davies',
      sender: 'Liam Davies (Grandson)',
      type: 'photo',
      title: 'First steps of great-grandson Toby',
      caption: 'Toby took his very first 5 steps on Sunday afternoon! Thought granddad would smile.',
      time: '1 day ago',
      status: 'waiting',
      tag: 'Family Milestone',
    },
    {
      id: 'mod-5',
      resident: 'Evelyn Scott',
      sender: 'Claire Scott (Daughter)',
      type: 'photo',
      title: 'Sunday roast and autumn flowers',
      caption: 'Fresh dahlias from our backyard garden to brighten your week!',
      time: '2 days ago',
      status: 'waiting',
      tag: 'Photos',
    },
  ],
  residentsNoContent: [
    {
      id: 'res-101',
      name: 'George Harrison',
      room: 'Room 102',
      daysWithoutContent: 14,
      primaryContact: 'No family contact registered',
      status: 'Needs carer update',
      lastPhoto: '14 days ago',
    },
    {
      id: 'res-102',
      name: 'Beatrice Clark',
      room: 'Room 205',
      daysWithoutContent: 12,
      primaryContact: 'Thomas Clark (Son)',
      status: 'Pending family reply',
      lastPhoto: '12 days ago',
    },
    {
      id: 'res-103',
      name: 'Harold Wilson',
      room: 'Room 118',
      daysWithoutContent: 9,
      primaryContact: 'Mary Wilson (Wife)',
      status: 'Activity photo needed',
      lastPhoto: '9 days ago',
    },
    {
      id: 'res-104',
      name: 'Alice Cooper',
      room: 'Room 304',
      daysWithoutContent: 8,
      primaryContact: 'David Cooper (Brother)',
      status: 'Draft story in progress',
      lastPhoto: '8 days ago',
    },
  ],
};

// ----------------------------------------------------------------------
// Community Wall Mock Data
// ----------------------------------------------------------------------

export const _mockResidentsList = [
  {
    id: 'resident-001',
    name: 'John Smith',
    email: 'john.smith@example.com',
    branch: 'Willow House',
    room: '101',
    roomNumber: '101',
    careLevel: 'Low',
    status: 'Active',
    avatarUrl: 'https://i.pravatar.cc/150?img=12',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  {
    id: 'resident-002',
    name: 'Mary Johnson',
    email: 'mary.johnson@example.com',
    branch: 'Willow House',
    room: '102',
    roomNumber: '102',
    careLevel: 'Medium',
    status: 'Active',
    avatarUrl: 'https://i.pravatar.cc/150?img=47',
    image: 'https://i.pravatar.cc/150?img=47',
  },
  {
    id: 'resident-003',
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    branch: 'Rosewood Court',
    room: '103',
    roomNumber: '103',
    careLevel: 'High',
    status: 'Active',
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    image: 'https://i.pravatar.cc/150?img=11',
  },
  {
    id: 'resident-004',
    name: 'Linda Davis',
    email: 'linda.davis@example.com',
    branch: 'Rosewood Court',
    room: '104',
    roomNumber: '104',
    careLevel: 'Low',
    status: 'Active',
    avatarUrl: 'https://i.pravatar.cc/150?img=44',
    image: 'https://i.pravatar.cc/150?img=44',
  },
  {
    id: 'resident-006',
    name: 'James Taylor',
    email: 'james.taylor@example.com',
    branch: 'Rosewood Court',
    room: '106',
    roomNumber: '106',
    careLevel: 'Low',
    status: 'Inactive',
    avatarUrl: 'https://i.pravatar.cc/150?img=33',
    image: 'https://i.pravatar.cc/150?img=33',
  },
];

export const _communityWallPosts = [
  {
    id: 'post-1',
    title: 'Garden afternoon & courtyard relaxation',
    content:
      'John enjoyed a peaceful afternoon in the courtyard garden, listening to classic radio melodies and tending to the potted flowers in the autumn sunshine.',
    author: {
      name: 'Jane Smith',
      role: 'Carer',
      avatarUrl: 'https://i.pravatar.cc/150?img=36',
    },
    createdAt: '2026-10-12T14:30:00Z',
    timeText: '2 hours ago',
    isPinned: true,
    audience: 'Willow House families',
    taggedResidents: [
      {
        id: 'resident-001',
        name: 'John Smith',
        room: '101',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
      },
    ],
    photos: [
      'https://picsum.photos/seed/garden-afternoon-1/1200/900',
      'https://picsum.photos/seed/garden-afternoon-2/1200/900',
    ],
    reactions: {
      heart: 48,
      userReaction: 'heart',
    },
    seenCount: 31,
    totalAudience: 42,
    inGazette: 'In Gazette 14',
    seenBy: {
      count: 31,
      recentViewers: [
        { name: 'Sarah Smith', relation: 'Daughter of John Smith', avatarUrl: 'https://i.pravatar.cc/150?img=48' },
        { name: 'Mark Smith', relation: 'Son of John Smith', avatarUrl: 'https://i.pravatar.cc/150?img=53' },
      ],
    },
    status: 'published',
  },
  {
    id: 'post-2',
    title: 'Autumn baking & afternoon tea',
    content:
      'Mary shared her favorite scone recipe during our baking club morning. We all enjoyed warm fresh pastries with clotted cream and Earl Grey tea together!',
    author: {
      name: 'Daniel Mensah',
      role: 'Care Lead',
      avatarUrl: 'https://i.pravatar.cc/150?img=68',
    },
    createdAt: '2026-10-11T15:20:00Z',
    timeText: 'Yesterday, 15:20',
    isPinned: false,
    audience: 'Willow House families',
    taggedResidents: [
      {
        id: 'resident-002',
        name: 'Mary Johnson',
        room: '102',
        avatarUrl: 'https://i.pravatar.cc/150?img=47',
      },
    ],
    photos: [
      'https://picsum.photos/seed/birthday-tea-1/1200/900',
      'https://picsum.photos/seed/craft-group-1/1200/900',
    ],
    reactions: {
      heart: 62,
      userReaction: null,
    },
    seenCount: 37,
    totalAudience: 42,
    seenBy: {
      count: 37,
      recentViewers: [
        { name: 'David Johnson', relation: 'Son of Mary Johnson', avatarUrl: 'https://i.pravatar.cc/150?img=53' },
        { name: 'Emma Johnson', relation: 'Granddaughter', avatarUrl: 'https://i.pravatar.cc/150?img=44' },
      ],
    },
    status: 'published',
  },
  {
    id: 'post-3',
    title: 'Afternoon chess & table games',
    content:
      'Robert had an engaging round of chess in the library lounge. His keen tactical moves and friendly banter kept everyone in great spirits!',
    author: {
      name: 'Tom Lee',
      role: 'Carer',
      avatarUrl: 'https://i.pravatar.cc/150?img=60',
    },
    createdAt: '2026-10-10T11:45:00Z',
    timeText: '2 days ago',
    isPinned: false,
    audience: 'Rosewood Court families',
    taggedResidents: [
      {
        id: 'resident-003',
        name: 'Robert Brown',
        room: '103',
        avatarUrl: 'https://i.pravatar.cc/150?img=11',
      },
    ],
    photos: [
      'https://picsum.photos/seed/craft-group-2/1200/900',
    ],
    reactions: {
      heart: 39,
      userReaction: null,
    },
    seenCount: 26,
    totalAudience: 42,
    seenBy: {
      count: 26,
      recentViewers: [
        { name: 'Emily Brown', relation: 'Wife of Robert Brown', avatarUrl: 'https://i.pravatar.cc/150?img=32' },
        { name: 'Daniel Mensah', relation: 'Care Lead', avatarUrl: 'https://i.pravatar.cc/150?img=68' },
      ],
    },
    status: 'published',
  },
  {
    id: 'post-4',
    title: 'Floral arranging & creative pottery',
    content:
      'Linda created beautiful flower arrangements with fresh autumn blossoms and painted lovely decorative ceramic pots for the patio garden display.',
    author: {
      name: 'Sarah Jenkins',
      role: 'Senior Carer',
      avatarUrl: 'https://i.pravatar.cc/150?img=48',
    },
    createdAt: '2026-10-09T14:15:00Z',
    timeText: '3 days ago',
    isPinned: false,
    audience: 'Rosewood Court families',
    taggedResidents: [
      {
        id: 'resident-004',
        name: 'Linda Davis',
        room: '104',
        avatarUrl: 'https://i.pravatar.cc/150?img=44',
      },
    ],
    photos: [
      'https://picsum.photos/seed/craft-group-3/1200/900',
      'https://picsum.photos/seed/garden-afternoon-1/1200/900',
    ],
    reactions: {
      heart: 44,
      userReaction: null,
    },
    seenCount: 29,
    totalAudience: 42,
    seenBy: {
      count: 29,
      recentViewers: [
        { name: 'Michael Davis', relation: 'Brother of Linda Davis', avatarUrl: 'https://i.pravatar.cc/150?img=59' },
        { name: 'Jane Smith', relation: 'Carer', avatarUrl: 'https://i.pravatar.cc/150?img=36' },
      ],
    },
    status: 'published',
  },
  {
    id: 'post-5',
    title: 'Music appreciation & acoustic classics',
    content:
      'James enjoyed an uplifting music session in the sunroom, reminiscing over 1960s acoustic records and sharing fond memories of seaside holidays.',
    author: {
      name: 'Amara Silva',
      role: 'Activities Coordinator',
      avatarUrl: 'https://i.pravatar.cc/150?img=25',
    },
    createdAt: '2026-10-08T16:00:00Z',
    timeText: '4 days ago',
    isPinned: false,
    audience: 'Rosewood Court families',
    taggedResidents: [
      {
        id: 'resident-006',
        name: 'James Taylor',
        room: '106',
        avatarUrl: 'https://i.pravatar.cc/150?img=33',
      },
    ],
    photos: [
      'https://picsum.photos/seed/birthday-tea-1/1200/900',
    ],
    reactions: {
      heart: 35,
      userReaction: null,
    },
    seenCount: 22,
    totalAudience: 42,
    seenBy: {
      count: 22,
      recentViewers: [
        { name: 'Helen Taylor', relation: 'Spouse of James Taylor', avatarUrl: 'https://i.pravatar.cc/150?img=45' },
        { name: 'Sarah Jenkins', relation: 'Senior Carer', avatarUrl: 'https://i.pravatar.cc/150?img=48' },
      ],
    },
    status: 'published',
  },
];

