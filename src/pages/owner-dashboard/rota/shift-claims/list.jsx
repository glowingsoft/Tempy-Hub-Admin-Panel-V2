import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ShiftClaimListView } from 'src/sections/shift-claim';
export default function Page() { return <><Helmet><title>Shift Claims | Owner Dashboard - {CONFIG.site.name}</title></Helmet><ShiftClaimListView /></>; }
