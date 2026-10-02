import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ShiftDetailView } from 'src/sections/shift';
export default function Page() { return <><Helmet><title>Shift details | Owner Dashboard - {CONFIG.site.name}</title></Helmet><ShiftDetailView /></>; }
