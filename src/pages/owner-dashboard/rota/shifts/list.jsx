import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ShiftListView } from 'src/sections/shift';
export default function Page() { return <><Helmet><title>Shifts | Owner Dashboard - {CONFIG.site.name}</title></Helmet><ShiftListView /></>; }
