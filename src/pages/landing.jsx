import { Helmet } from 'react-helmet-async';
import { LandingView } from 'src/sections/landing';

// ----------------------------------------------------------------------

const metadata = {
  title: 'Tempy Hub · Care Home Operations, Safety & Compliance Platform',
  description:
    'All-in-one operations, PEEP safety and CQC-aligned compliance platform built exclusively for UK care homes and healthcare operators.',
};

export default function Page() {
  return (
    <>
      <Helmet>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </Helmet>

      <LandingView />
    </>
  );
}
