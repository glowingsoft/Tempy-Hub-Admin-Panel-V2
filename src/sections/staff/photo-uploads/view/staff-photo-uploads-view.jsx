import { FamilyModerationView } from 'src/sections/moderation/view/family-moderation-view';

// ----------------------------------------------------------------------

export function StaffPhotoUploadsView() {
  return <FamilyModerationView heading="Photo Upload" canCreate canModerate={false} />;
}

export default StaffPhotoUploadsView;
