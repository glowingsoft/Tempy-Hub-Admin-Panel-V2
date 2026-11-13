export const FamilyPostAudience = {
  ALL: 'all',
  BRANCH: 'branch',
  TAGGED: 'tagged',
};

export const FAMILY_POST_AUDIENCE_OPTIONS = [
  {
    value: FamilyPostAudience.ALL,
    label: 'All families & residents',
    description: 'Visible to all residents and connected family members',
    icon: 'solar:users-group-rounded-bold',
  },
  {
    value: FamilyPostAudience.BRANCH,
    label: 'This site’s families',
    description: 'Visible only to registered family contacts for this site',
    icon: 'solar:home-smile-bold',
  },
  {
    value: FamilyPostAudience.TAGGED,
    label: 'Tagged resident families only',
    description: 'Private post shared only with relatives of the tagged residents',
    icon: 'solar:lock-keyhole-bold',
  },
];

export const FAMILY_POST_TAB_OPTIONS = [
  { value: 'all', label: 'All posts', color: 'default', countKey: 'all' },
  { value: 'pinned', label: 'Pin', color: 'info', countKey: 'pinned' },
  { value: 'photos', label: 'Photos', color: 'primary', countKey: 'photos' },
  { value: 'scheduled', label: 'Scheduled', color: 'warning', countKey: 'scheduled' },
  { value: 'drafts', label: 'Draft', color: 'default', countKey: 'draft' },
];

export const FAMILY_POST_DATE_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 90, label: 'Last 90 days' },
  { value: '', label: 'All time' },
];

export const FAMILY_POST_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
];

export const MAX_POST_PHOTOS = 10;
export const FAMILY_POSTS_PAGE_SIZE = 50;

export function getPostId(post) {
  return post?.postId || post?.id || '';
}

export function getPostPhotoUrls(post) {
  return (post?.photos || [])
    .map((photo) => (typeof photo === 'string' ? photo : photo?.url))
    .filter(Boolean);
}
