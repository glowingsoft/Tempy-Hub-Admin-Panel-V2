import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ShiftCreateView } from 'src/sections/shift';
export default function Page() { return <><Helmet><title>Add shift | Owner Dashboard - {CONFIG.site.name}</title></Helmet><ShiftCreateView /></>; }
