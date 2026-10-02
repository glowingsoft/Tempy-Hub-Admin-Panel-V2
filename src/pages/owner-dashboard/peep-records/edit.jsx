import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';
import { CONFIG } from 'src/config-global';
import { PeepRecordNewEditView } from 'src/sections/peep-records/view';
import { getPeepRecordById } from 'src/sections/peep-records/mocks/data';

export default function Page() {
    const { id = '' } = useParams();
    const currentRecord = getPeepRecordById(id);

    return (
        <>
            <Helmet><title>Edit PEEP Record | Owner Dashboard - {CONFIG.site.name}</title></Helmet>
            <PeepRecordNewEditView currentRecord={currentRecord} />
        </>
    );
}
