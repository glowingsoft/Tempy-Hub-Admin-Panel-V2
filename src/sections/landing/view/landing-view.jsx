import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import '../styles/landing.css';
import { loadAllLandingLibraries } from '../hooks/use-script-loader';
import { useLenisScroll } from '../hooks/use-lenis-scroll';

import { LandingNavbar } from '../components/landing-navbar';
import { LANDING_IMAGES } from '../assets';

// All 15 Sections
import { SplashScreen } from 'src/components/loading-screen';
import { HeroSection } from '../sections/01-hero-section';
import { StatementSection } from '../sections/02-statement-section';
import { JourneySection } from '../sections/03-journey-section';
import { PlatformRailSection } from '../sections/04-platform-rail-section';
import { SafetyEvacuationSection } from '../sections/05-safety-evacuation-section';
import { StatsSection } from '../sections/06-stats-section';
import { CinematicBannerSection } from '../sections/07-cinematic-banner-section';
import { WhoItsForSection } from '../sections/08-who-its-for-section';
import { KioskHardwareSection } from '../sections/08b-kiosk-hardware-section';
import { RoiCalculatorSection } from '../sections/09-roi-calculator-section';
import { SecurityTrustSection } from '../sections/10-security-trust-section';
import { FaqSection } from '../sections/12-faq-section';
import { FinalCtaSection } from '../sections/13-final-cta-section';
import { FooterSection } from '../sections/14-footer-section';

export function LandingView() {
  const [loading, setLoading] = useState(true);

  // Initialize smooth scroll & libraries once loaded
  useLenisScroll(!loading);

  useEffect(() => {
    let isMounted = true;
    let timer = null;

    loadAllLandingLibraries().then(() => {
      timer = setTimeout(() => {
        if (isMounted) {
          setLoading(false);
        }
      }, 500);
    });

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Box
      className="tempy-landing-root"
      sx={{
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
      }}
    >
      {/* Adaptive Inverting Navbar */}
      <LandingNavbar />

      {/* Main Content Sections */}
      <Box component="main">
        {/* 01. Hero Section */}
        <HeroSection />

        {/* 02. Statement Section */}
        <StatementSection imageSrc={LANDING_IMAGES.statementResidentCarer} />

        {/* 03. Journey Before/After Road */}
        <JourneySection />

        {/* 04. Platform Feature Rail */}
        <PlatformRailSection />

        {/* 05. Live Evacuation Safety Moment */}
        <SafetyEvacuationSection />

        {/* 06. Operational Stats */}
        <StatsSection />

        {/* 07. Full-bleed Cinematic Banner & Cloud Exit */}
        <CinematicBannerSection />

        {/* 08. Who We Stand With (Active Row List) */}
        <WhoItsForSection />

        {/* 08B. Dedicated Kiosk Hardware Showcase */}
        <KioskHardwareSection />

        {/* 09. Interactive ROI Calculator */}
        <RoiCalculatorSection />

        {/* 10. Security & Sovereign UK Data */}
        <SecurityTrustSection />

        {/* 12. F.A.Q. Accordion */}
        <FaqSection />

        {/* 13. Radiating Rings Final CTA */}
        <FinalCtaSection />
      </Box>

      {/* 14. Footer with Scrubbed Ghost Wordmark */}
      <FooterSection />
    </Box>
  );
}
