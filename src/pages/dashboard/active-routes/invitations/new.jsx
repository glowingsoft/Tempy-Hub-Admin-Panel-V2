import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import InvitationAddEditView from 'src/sections/active-sections/invitations/view/invitation-add-edit-view';


// ----------------------------------------------------------------------

const metadata = { title: `Invitations | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <InvitationAddEditView />
        </>
    );
}
