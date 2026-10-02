import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { ShiftEditView } from 'src/sections/shift';
import { getMockShiftById } from 'src/sections/shift/mocks/data';

export default function Page() {
  const { id = '' } = useParams();

  const currentShift = getMockShiftById(id);

  return (
    <>
      <Helmet>
        <title>Edit shift | Owner Dashboard - {CONFIG.site.name}</title>
      </Helmet>

      <ShiftEditView shift={currentShift} />
    </>
  );
}
