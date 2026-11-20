import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ShiftClaimListView } from 'src/sections/shift-claim';
export default function Page() { return <><Helmet><title>Shift claims - {CONFIG.site.name}</title></Helmet><ShiftClaimListView /></>; }
