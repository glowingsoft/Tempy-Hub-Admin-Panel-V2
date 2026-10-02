import { Helmet } from "react-helmet-async";
import { CONFIG } from "src/config-global";
import RoleListView from "src/sections/active-sections/role/view/role-list-view";

const metadata = { title: `Roles | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RoleListView />
    </>
  );
}
