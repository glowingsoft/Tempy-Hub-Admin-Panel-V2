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
  ...mockResidents.map((r) => ({
    id: r._id,
    name: r.name,
    room: r.roomNumber,
    avatarUrl: r.image,
    careLevel: r.careLevel,
    emergencyContact: r.emergencyContact,
  })),
  { id: 'res-p1', name: 'Elsie Hall', room: '12', avatarUrl: 'https://i.pravatar.cc/150?img=47' },
  { id: 'res-p3', name: 'Mary Doyle', room: '4', avatarUrl: 'https://i.pravatar.cc/150?img=32' },
];

export const _communityWallPosts = [
  {
    id: 'post-1',
    title: _pendingPhotoApprovals[0]?.caption || 'Garden afternoon',
    content:
      'Our residents had a wonderful garden afternoon enjoying the fresh air and flower beds in the courtyard. Such a relaxing and peaceful time outdoors!',
    author: {
      name: _pendingPhotoApprovals[0]?.uploadedBy || 'Carer: Jane Smith',
      role: 'Florence House Carer',
      avatarUrl: _pendingPhotoApprovals[0]?.residentAvatar || 'https://i.pravatar.cc/150?img=47',
    },
    createdAt: '2026-08-18T14:30:00Z',
    isPinned: true,
    audience: 'All Families & Residents',
    taggedResidents: [
      {
        id: 'res-p1',
        name: _pendingPhotoApprovals[0]?.residentName || 'Elsie Hall',
        room: _pendingPhotoApprovals[0]?.room || '12',
        avatarUrl: _pendingPhotoApprovals[0]?.residentAvatar || 'https://i.pravatar.cc/150?img=47',
      },
    ],
    photos: _pendingPhotoApprovals[0]?.photos || [
      'https://picsum.photos/seed/garden-afternoon-1/1200/900',
      'https://picsum.photos/seed/garden-afternoon-2/1200/900',
    ],
    reactions: {
      like: 18,
      heart: 24,
      smile: 12,
      userReaction: 'heart',
    },
    seenBy: {
      count: 28,
      recentViewers: [
        { name: 'Sarah Smith', relation: 'Daughter', avatarUrl: 'https://i.pravatar.cc/150?img=48' },
        { name: 'David Johnson', relation: 'Son', avatarUrl: 'https://i.pravatar.cc/150?img=53' },
      ],
    },
  },
  {
    id: 'post-2',
    title: _pendingPhotoApprovals[2]?.caption || 'Craft group',
    content:
      'A wonderful creative morning with our craft group! Residents loved creating colorful designs, paper crafts, and sharing smiles and conversation together.',
    author: {
      name: _pendingPhotoApprovals[2]?.uploadedBy || 'Activities: Priya Patel',
      role: 'Activities Coordinator',
      avatarUrl: _pendingPhotoApprovals[2]?.residentAvatar || 'https://i.pravatar.cc/150?img=32',
    },
    createdAt: '2026-08-12T10:15:00Z',
    isPinned: false,
    audience: 'Florence House Families',
    taggedResidents: [
      {
        id: 'res-p3',
        name: _pendingPhotoApprovals[2]?.residentName || 'Mary Doyle',
        room: _pendingPhotoApprovals[2]?.room || '4',
        avatarUrl: _pendingPhotoApprovals[2]?.residentAvatar || 'https://i.pravatar.cc/150?img=32',
      },
    ],
    photos: _pendingPhotoApprovals[2]?.photos || [
      'https://picsum.photos/seed/craft-group-1/1200/900',
      'https://picsum.photos/seed/craft-group-2/1200/900',
      'https://picsum.photos/seed/craft-group-3/1200/900',
    ],
    reactions: {
      like: 22,
      heart: 35,
      smile: 16,
      userReaction: null,
    },
    seenBy: {
      count: 36,
      recentViewers: [
        { name: 'Tom Bell', relation: 'Son', avatarUrl: 'https://i.pravatar.cc/150?img=53' },
        { name: 'Jane Hall', relation: 'Daughter', avatarUrl: 'https://i.pravatar.cc/150?img=48' },
      ],
    },
  },
];

