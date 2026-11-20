import { Helmet } from 'react-helmet-async';
import { CONFIG } from 'src/config-global';
import { ShiftCreateView } from 'src/sections/shift';

export default function Page() {
    return (
        <>
            <Helmet>
                <title>Add shift - {CONFIG.site.name}</title>
            </Helmet>
            <ShiftCreateView />
        </>
    );
}
