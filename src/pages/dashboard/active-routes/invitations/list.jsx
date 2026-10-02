import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/config-global';
import { InvitationListView } from 'src/sections/active-sections/invitations/view/invitation-list-view';


// ----------------------------------------------------------------------

const metadata = { title: `Invitations | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <InvitationListView />
        </>
    );
}
