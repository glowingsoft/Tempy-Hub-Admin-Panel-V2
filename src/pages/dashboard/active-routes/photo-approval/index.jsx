import { Helmet } from "react-helmet-async";
import { CONFIG } from "src/config-global";
import PhotoApprovalListView from "src/sections/active-sections/photo-approval/view/photo-approval-list-view";


const metadata = { title: `Uploaded Photos | Dashboard - ${CONFIG.site.name}` };
export default function Index() {
    return (
        <>
            <Helmet>
                <title>{metadata.title}</title>
            </Helmet>
            <PhotoApprovalListView />
        </>
    )
}