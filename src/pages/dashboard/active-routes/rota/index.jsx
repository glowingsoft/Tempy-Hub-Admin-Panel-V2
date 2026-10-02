import { Helmet } from "react-helmet-async";
import { CONFIG } from "src/config-global";
import RotaView from "src/sections/active-sections/rota/view/rota-view";

const metadata = { title: `Rota | Dashboard - ${CONFIG.site.name}` };
export default function Page({ ownerDashboard = false, showTempyConnect = false }) {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>
            <RotaView ownerDashboard={ownerDashboard} showTempyConnect={showTempyConnect} />
        </>
    );
}