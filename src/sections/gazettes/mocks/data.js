// ----------------------------------------------------------------------
// Mock Data for Gazettes Management
// ----------------------------------------------------------------------

import sampleGazettePdf from './sample-family-gazette 1.pdf';

export const SAMPLE_GAZETTE_PDF =
  sampleGazettePdf || '/sample-family-gazette 1.pdf';

export const mockGazettesData = {
  samplePdfUrl: SAMPLE_GAZETTE_PDF,
  issue: {
    number: 14,
    title: 'Issue 14',
    dateRange: '1 to 14 Oct',
    deadlineDays: 3,
    status: 'draft',
    headerText: 'Issue 14 · 1 to 14 Oct · closes in 3 days',
    subText: 'One gazette per resident, built from approved content',
  },
  metrics: {
    totalResidents: 42,
    readyToPrint: 36,
    noContent: 4,
    needReview: 2,
  },
  residents: [
    {
      id: 'gaz-1',
      resident: 'Margaret Hughes',
      room: '12',
      family: 3,
      messages: 9,
      status: 'ready',
      statusLabel: 'Ready',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      actions: ['preview', 'regenerate', 'pdf'],
      pdfUrl: SAMPLE_GAZETTE_PDF,
      coverHeadline: 'Autumn Harvest & Family Memories',
      previewPhotos: [
        'https://picsum.photos/seed/garden-afternoon-1/1200/900',
        'https://picsum.photos/seed/garden-afternoon-2/1200/900',
      ],
      sampleMessages: [
        {
          sender: 'Sarah Hughes (Daughter)',
          text: 'Thinking of you mum! The grandkids loved sending you their autumn drawings.',
        },
        {
          sender: 'David Hughes (Son)',
          text: 'See you this Sunday for afternoon tea and choir singing.',
        },
      ],
    },
    {
      id: 'gaz-2',
      resident: 'Dennis Rowe',
      room: '4',
      family: 2,
      messages: 5,
      status: 'ready',
      statusLabel: 'Ready',
      avatarUrl: 'https://i.pravatar.cc/150?img=12',
      actions: ['preview', 'regenerate', 'pdf'],
      pdfUrl: SAMPLE_GAZETTE_PDF,
      coverHeadline: 'Weekend Courtyard Sunshine & Music',
      previewPhotos: ['https://picsum.photos/seed/craft-group-1/1200/900'],
      sampleMessages: [
        { sender: 'Claire Rowe (Daughter)', text: 'Love you dad! Wishing you a peaceful week.' },
      ],
    },
    {
      id: 'gaz-3',
      resident: 'Joan Parr',
      room: '8',
      family: 1,
      messages: 0,
      status: 'no_content',
      statusLabel: 'No content',
      avatarUrl: 'https://i.pravatar.cc/150?img=44',
      actions: ['message_family', 'add_wall_post'],
      pdfUrl: SAMPLE_GAZETTE_PDF,
      coverHeadline: 'Autumn at Florence House',
      previewPhotos: [],
      sampleMessages: [],
    },
    {
      id: 'gaz-4',
      resident: 'Albert Cole',
      room: '15',
      family: 4,
      messages: 31,
      status: 'over_limit',
      statusLabel: 'Over 30 messages',
      avatarUrl: 'https://i.pravatar.cc/150?img=11',
      actions: ['choose_which_to_keep'],
      pdfUrl: SAMPLE_GAZETTE_PDF,
      coverHeadline: 'Grand Celebration & 31 Warm Family Wishes',
      previewPhotos: ['https://picsum.photos/seed/birthday-tea-1/1200/900'],
      sampleMessages: [
        { sender: 'Emma Cole (Granddaughter)', text: 'Happy milestone granddad!' },
        {
          sender: 'Mark Cole (Son)',
          text: 'So proud of you, wishing you great health and happiness.',
        },
      ],
    },
    {
      id: 'gaz-5',
      resident: 'Rose Bell',
      room: '2',
      family: 2,
      messages: 6,
      status: 'printed',
      statusLabel: 'Printed',
      avatarUrl: 'https://i.pravatar.cc/150?img=32',
      actions: ['preview', 'pdf'],
      pdfUrl: SAMPLE_GAZETTE_PDF,
      coverHeadline: 'Baking Club & Orchard Apples',
      previewPhotos: ['https://picsum.photos/seed/craft-group-2/1200/900'],
      sampleMessages: [
        { sender: 'Priya Bell (Granddaughter)', text: 'Those scones looked delicious nanny!' },
      ],
    },
    {
      id: 'gaz-6',
      resident: 'Frank Hill',
      room: '9',
      family: 0,
      messages: 0,
      status: 'no_family',
      statusLabel: 'No family linked',
      avatarUrl: 'https://i.pravatar.cc/150?img=60',
      actions: ['invite_family'],
      pdfUrl: SAMPLE_GAZETTE_PDF,
      coverHeadline: 'Florence House Community Autumn Edition',
      previewPhotos: [],
      sampleMessages: [],
    },
  ],
};

export default mockGazettesData;
