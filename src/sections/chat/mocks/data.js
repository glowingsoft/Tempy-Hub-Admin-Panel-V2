import { mockResidents } from 'src/sections/resident/mocks/data';

// ----------------------------------------------------------------------

const residentContacts = mockResidents
  .filter((resident) => resident.status === 'active')
  .slice(0, 4)
  .map((resident, index) => ({
    id: resident._id,
    name: resident.name,
    role: 'resident',
    email: resident.email,
    phoneNumber: resident.phone,
    address: `Room ${resident.roomNumber}`,
    avatarUrl: resident.image,
    status: ['online', 'offline', 'busy', 'online'][index],
    lastActivity: new Date(Date.now() - (index + 1) * 60_000).toISOString(),
  }));

const sampleMessages = [
  [
    'Good morning. I enjoyed the garden yesterday.',
    'Could you let me know when the next activity is?',
  ],
  [
    'Would someone be able to help me with my room light?',
    'Thank you for checking in with me.',
  ],
  [
    "I would like to ask about this afternoon's activities.",
    'The music session sounds lovely.',
  ],
  [
    'Could I get an update about my appointment?',
    'Please let me know when you have a moment.',
  ],
];

const messageTimes = [2, 8, 15, 24, 35, 47, 62, 85];

export const mockChatContacts = residentContacts;

export const mockChatSenderAvatar =
  mockResidents.find(
    (resident) =>
      resident.status === 'active' &&
      !residentContacts.some((contact) => contact.id === resident._id)
  )?.image;

export const mockChatConversations = residentContacts.map((resident, index) => ({
  id: resident.id,
  participants: [resident],
  messages: sampleMessages[index].map((body, messageIndex) => ({
    id: `${resident.id}-message-${messageIndex + 1}`,
    attachments: [],
    body,
    contentType: 'text',
    createdAt: new Date(
      Date.now() - messageTimes[index * 2 + messageIndex] * 60_000
    ).toISOString(),
    senderId: resident.id,
  })),
  type: 'ONE_TO_ONE',
  unreadCount: index % 2,
}));
