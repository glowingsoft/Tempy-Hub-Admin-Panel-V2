// Mock Data for Newsletters Section

export const NEWSLETTER_MONTHS = [
  'January 2026',
  'February 2026',
  'March 2026',
  'April 2026',
  'May 2026',
  'June 2026',
  'July 2026',
  'August 2026',
  'September 2026',
  'October 2026',
  'November 2026',
  'December 2026',
];

export const mockNewsletterData = {
  header: {
    homeName: 'FLORENCE HOUSE',
    editionTitle: 'October newsletter',
    tagline: 'Autumn Edition · Issue 14 · Florence Care Community',
    dateLabel: 'October 2026',
  },
  sections: {
    welcome: {
      id: 'welcome',
      title: 'Welcome from the manager',
      subtitle: 'Written by you',
      defaultChecked: true,
      author: 'Claire Adams, Home Manager',
      text: 'Welcome to our October newsletter. It has been a lovely month filled with autumn sunshine, cozy afternoon teas, and wonderful family visits. Thank you to everyone who joined our autumn harvest festival!',
    },
    highlights: {
      id: 'highlights',
      title: 'Highlights',
      subtitle: 'Auto-filled: 5 wall posts',
      defaultChecked: true,
      items: [
        {
          id: 'hl-1',
          title: 'Garden afternoon',
          tag: 'Courtyard Activities',
          blurb: 'Residents enjoyed tending the conservatory planters and harvesting crisp herbs in the garden.',
          image: 'https://picsum.photos/seed/garden-afternoon-1/600/400',
        },
        {
          id: 'hl-2',
          title: 'Baking club',
          tag: 'Culinary Workshop',
          blurb: 'Warm cinnamon scones and spiced blackberry crumble freshly baked with chef Marco.',
          image: 'https://picsum.photos/seed/baking-club-1/600/400',
        },
        {
          id: 'hl-3',
          title: 'Choir & music singing',
          tag: 'Live Entertainment',
          blurb: 'A joyful sing-along session with local choir volunteers in the sunny main lounge.',
          image: 'https://picsum.photos/seed/choir-group-1/600/400',
        },
      ],
    },
    comingUp: {
      id: 'comingUp',
      title: 'Coming up',
      subtitle: 'From the activities calendar',
      defaultChecked: true,
      events: [
        {
          id: 'ev-1',
          date: 'Tue 7 Oct',
          time: '10:30 AM',
          title: 'Flu jabs',
          description: 'Annual winter wellness clinic administered by visiting nursing team.',
          badge: 'Health',
        },
        {
          id: 'ev-2',
          date: 'Fri 17 Oct',
          time: '2:00 PM',
          title: 'Music session',
          description: 'Acoustic guitar and classic vocal performances in the garden lounge.',
          badge: 'Social',
        },
        {
          id: 'ev-3',
          date: 'Thu 23 Oct',
          time: '3:00 PM',
          title: 'Pumpkin Carving & Tea',
          description: 'Family crafting afternoon with seasonal pumpkin decorating and spiced tea.',
          badge: 'Crafts',
        },
      ],
    },
    photoGallery: {
      id: 'photoGallery',
      title: 'Photo gallery',
      subtitle: 'Up to 6 photos',
      defaultChecked: true,
      photos: [
        { id: 'ph-1', url: 'https://picsum.photos/seed/autumn-walk-1/500/500', caption: 'Courtyard walk' },
        { id: 'ph-2', url: 'https://picsum.photos/seed/craft-work-2/500/500', caption: 'Art workshop' },
        { id: 'ph-3', url: 'https://picsum.photos/seed/tea-table-3/500/500', caption: 'Afternoon tea' },
        { id: 'ph-4', url: 'https://picsum.photos/seed/choir-4/500/500', caption: 'Choir practice' },
        { id: 'ph-5', url: 'https://picsum.photos/seed/baking-club-1/500/500', caption: 'Chef scones' },
        { id: 'ph-6', url: 'https://picsum.photos/seed/garden-afternoon-1/500/500', caption: 'Sunny patio' },
      ],
    },
  },
  delivery: {
    audiences: [
      { id: 'all', label: 'All Florence House families', count: 42 },
      { id: 'floor1', label: 'Ground Floor families', count: 18 },
      { id: 'floor2', label: 'First Floor families', count: 24 },
    ],
  },
};

export default mockNewsletterData;
