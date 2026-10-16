import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { StaffPhotoUploadsView } from 'src/sections/staff/photo-uploads/view/staff-photo-uploads-view';

// ----------------------------------------------------------------------

const metadata = { title: `Photo Uploads | Staff Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
      </Helmet>

      <StaffPhotoUploadsView />
    </>
  );
}