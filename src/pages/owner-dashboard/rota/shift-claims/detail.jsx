import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ShiftClaimDetailView } from 'src/sections/shift-claim';
export default function Page() { return <><Helmet><title>Shift claim details | Owner Dashboard - {CONFIG.site.name}</title></Helmet><ShiftClaimDetailView /></>; }
