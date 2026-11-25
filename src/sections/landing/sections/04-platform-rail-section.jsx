import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { Iconify } from 'src/components/iconify';
import { LANDING_IMAGES } from '../assets';
import { LANDING_CONTENT } from '../config/landing-content';

/* -------------------------------------------------------------------------- */
/*                                MINI-UI ENGINES                             */
/* -------------------------------------------------------------------------- */

/**
 * 01. ROTA MINI-UI:
 * 5 weekly shift bars (Mon-Fri) scale in. The open shift bar pulses red.
 */
function RotaMiniUi({ registerTimeline }) {
  const containerRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !containerRef.current) return;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      barsRef.current,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.45, stagger: 0.08, ease: 'power2.out' }
    );

    registerTimeline(0, tl);
  }, [registerTimeline]);

  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography className="tempy-mono" sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          WEEK 42 · FLOOR 2 WEST
        </Typography>
        <Chip
          size="small"
          label="1 OPEN SHIFT"
          sx={{
            height: 20,
            fontSize: 10,
            bgcolor: 'rgba(255, 72, 66, 0.2)',
            color: '#FF4842',
            border: '1px solid rgba(255, 72, 66, 0.4)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
          }}
        />
      </Stack>

      <Stack spacing={0.9}>
        {days.map((day, i) => {
          const isOpen = i === 2;
          return (
            <Stack key={day} direction="row" spacing={1.25} alignItems="center">
              <Typography className="tempy-mono" sx={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', width: 28, fontWeight: 600 }}>
                {day}
              </Typography>
              <Box
                ref={(el) => (barsRef.current[i] = el)}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 1,
                  bgcolor: isOpen ? '#FF4842' : i % 2 === 0 ? '#7478E8' : '#22C55E',
                  boxShadow: isOpen ? '0 0 10px rgba(255, 72, 66, 0.65)' : 'none',
                  animation: isOpen ? 'pulseOpenShift 1.2s infinite alternate' : 'none',
                }}
              />
              <Typography className="tempy-mono" sx={{ fontSize: 11, color: isOpen ? '#FF4842' : 'rgba(255,255,255,0.8)', width: 50, textAlign: 'right', fontWeight: 600 }}>
                {isOpen ? 'BIDDING' : 'FILLED'}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

/**
 * 02. TEMPY CONNECT MINI-UI:
 * 3 agency bid pills pop in; one wins with an indigo checkmark and "Filled in 4m".
 */
function ConnectMiniUi({ registerTimeline }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !containerRef.current) return;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      containerRef.current.querySelectorAll('.connect-pill'),
      { y: 14, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.4, ease: 'back.out(1.5)' }
    );

    registerTimeline(1, tl);
  }, [registerTimeline]);

  const bids = [
    { agency: 'CarePulse UK', rate: '£18.50/hr', status: 'Bid', won: false },
    { agency: 'Tempy Direct', rate: '£17.20/hr', status: 'Filled in 4m', won: true },
    { agency: 'FirstChoice Care', rate: '£19.00/hr', status: 'Bid', won: false },
  ];

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.9 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography className="tempy-mono" sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          BROADCAST DISPATCH
        </Typography>
        <Typography className="tempy-mono" sx={{ fontSize: 11, color: '#38BDF8', fontWeight: 700 }}>
          ● LIVE CLAIMS
        </Typography>
      </Stack>

      {bids.map((bid) => (
        <Stack
          key={bid.agency}
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          className="connect-pill"
          sx={{
            py: 0.6,
            px: 1.25,
            borderRadius: 1,
            bgcolor: bid.won ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
            border: bid.won ? '1px solid #38BDF8' : '1px solid rgba(255,255,255,0.08)',
            boxShadow: bid.won ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {bid.won ? (
              <Iconify icon="solar:check-circle-bold" width={14} sx={{ color: '#38BDF8' }} />
            ) : (
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.35)' }} />
            )}
            <Typography className="tempy-mono" sx={{ fontSize: 11, color: '#FFFFFF', fontWeight: bid.won ? 700 : 500 }}>
              {bid.agency}
            </Typography>
          </Stack>
          <Chip
            size="small"
            label={bid.status}
            sx={{
              height: 18,
              fontSize: 10,
              bgcolor: bid.won ? '#38BDF8' : 'transparent',
              color: bid.won ? '#0E1020' : 'rgba(255,255,255,0.7)',
              fontWeight: bid.won ? 700 : 500,
              fontFamily: 'var(--font-mono)',
            }}
          />
        </Stack>
      ))}
    </Box>
  );
}

/**
 * 03. KIOSK TIME & ATTENDANCE MINI-UI:
 * 4 PIN dots fill sequentially, then a green check flashes.
 */
function KioskMiniUi({ registerTimeline }) {
  const containerRef = useRef(null);
  const dotsRef = useRef([]);
  const verifiedRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !containerRef.current) return;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      dotsRef.current,
      { scale: 0.6, backgroundColor: 'rgba(255,255,255,0.2)' },
      { scale: 1.25, backgroundColor: '#A78BFA', stagger: 0.12, duration: 0.2, ease: 'back.out(2)' }
    ).fromTo(
      verifiedRef.current,
      { opacity: 0, y: 8, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' },
      '+=0.1'
    );

    registerTimeline(2, tl);
  }, [registerTimeline]);

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', p: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.2 }}>
      <Typography className="tempy-mono" sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
        WALL KIOSK · ENTER 4-DIGIT PIN
      </Typography>

      <Stack direction="row" spacing={1.75} sx={{ py: 0.5 }}>
        {[0, 1, 2, 3].map((i) => (
          <Box
            key={i}
            ref={(el) => (dotsRef.current[i] = el)}
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '1.5px solid rgba(167, 139, 250, 0.7)',
              boxShadow: '0 0 8px rgba(167, 139, 250, 0.4)',
            }}
          />
        ))}
      </Stack>

      <Box
        ref={verifiedRef}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          py: 0.4,
          px: 1.5,
          borderRadius: '9999px',
          bgcolor: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid #22C55E',
        }}
      >
        <Iconify icon="solar:check-circle-bold" width={14} sx={{ color: '#22C55E' }} />
        <Typography className="tempy-mono" sx={{ fontSize: 11, fontWeight: 700, color: '#22C55E' }}>
          SARAH J. · SENIOR CARER CLOCKED IN
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * 04. PEEP & FIRE DRILLS MINI-UI (FEATURED, 8 COLS):
 * Clean 3-row layout: Radar Header, Room Evacuation Status badges, and Roll Call Counters bar.
 */
function PeepMiniUi({ registerTimeline }) {
  const containerRef = useRef(null);
  const badgesRef = useRef([]);
  const statsRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !containerRef.current) return;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      badgesRef.current,
      { y: 10, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, stagger: 0.08, duration: 0.35, ease: 'back.out(1.5)' }
    ).fromTo(
      statsRef.current,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out' },
      0.25
    );

    registerTimeline(3, tl);
  }, [registerTimeline]);

  const rooms = [
    { id: 1, label: 'Rm 101', status: 'Independent (Safe)', color: '#22C55E', icon: 'solar:check-circle-bold' },
    { id: 2, label: 'Rm 104', status: 'Assisted 1-Person', color: '#FFAB00', icon: 'solar:user-hand-up-bold' },
    { id: 3, label: 'Rm 108', status: 'Evac Chair Active', color: '#FF6B6B', icon: 'solar:danger-triangle-bold' },
    { id: 4, label: 'Lounge', status: 'Safe Muster Zone', color: '#38BDF8', icon: 'solar:flag-bold' },
  ];

  const rollCall = [
    { label: 'RESIDENTS', count: '24/24', color: '#22C55E' },
    { label: 'STAFF', count: '12/12', color: '#7478E8' },
    { label: 'AGENCY', count: '3/3', color: '#FFAB00' },
    { label: 'VISITORS', count: '5/5', color: '#38BDF8' },
  ];

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        p: { xs: 1.5, sm: 2 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 1.25,
      }}
    >
      {/* Top Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#FF6B6B',
              boxShadow: '0 0 10px #FF6B6B',
              animation: 'pulseDot 1.2s infinite alternate',
            }}
          />
          <Typography className="tempy-mono" sx={{ fontSize: 11, color: '#FFFFFF', fontWeight: 700, letterSpacing: '0.04em' }}>
            LIVE PEEP EVACUATION RADAR · 100% CQC READY
          </Typography>
        </Stack>
        <Chip
          size="small"
          label="MUSTERING"
          sx={{
            height: 20,
            fontSize: 9.5,
            bgcolor: 'rgba(255, 107, 107, 0.18)',
            color: '#FF6B6B',
            border: '1px solid rgba(255, 107, 107, 0.4)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
          }}
        />
      </Stack>

      {/* Middle: Room Evacuation Status Chips */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 1,
        }}
      >
        {rooms.map((room, i) => (
          <Stack
            key={room.id}
            ref={(el) => (badgesRef.current[i] = el)}
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              py: 0.6,
              px: 1,
              borderRadius: 1,
              bgcolor: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid color-mix(in srgb, ${room.color} 30%, transparent)`,
            }}
          >
            <Iconify icon={room.icon} width={14} sx={{ color: room.color, flexShrink: 0 }} />
            <Box sx={{ overflow: 'hidden' }}>
              <Typography className="tempy-mono" sx={{ fontSize: 10.5, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
                {room.label}
              </Typography>
              <Typography className="tempy-mono" sx={{ fontSize: 9.5, color: room.color, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                {room.status}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>

      {/* Bottom: Roll Call Counters Bar */}
      <Box
        ref={statsRef}
        sx={{
          py: 0.6,
          px: 1.5,
          borderRadius: 1.5,
          bgcolor: 'rgba(14, 16, 32, 0.92)',
          border: '1px solid rgba(255, 107, 107, 0.35)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography className="tempy-mono" sx={{ fontSize: 10.5, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
          ROLL CALL:
        </Typography>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {rollCall.map((stat) => (
            <Stack key={stat.label} direction="row" spacing={0.5} alignItems="center">
              <Typography className="tempy-mono" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
                {stat.label}
              </Typography>
              <Typography className="tempy-mono" sx={{ fontSize: 11, fontWeight: 800, color: stat.color }}>
                {stat.count}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

/**
 * 05. COMPETENCY & SUPERVISION MINI-UI:
 * 20-cell heatmap matrix fades in with random stagger; 3 cells flash amber.
 */
function CompetencyMiniUi({ registerTimeline }) {
  const containerRef = useRef(null);
  const cellsRef = useRef([]);

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !containerRef.current) return;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      cellsRef.current,
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 0.35, stagger: { amount: 0.4, from: 'random' }, ease: 'power1.out' }
    );

    registerTimeline(4, tl);
  }, [registerTimeline]);

  const amberIndices = [3, 11, 17];

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography className="tempy-mono" sx={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
          SKILLS MATRIX (20 COMPETENCIES)
        </Typography>
        <Typography className="tempy-mono" sx={{ fontSize: 11, color: '#FFAB00', fontWeight: 700 }}>
          3 EXPIRING SOON
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.9 }}>
        {Array.from({ length: 20 }).map((_, i) => {
          const isAmber = amberIndices.includes(i);
          return (
            <Box
              key={i}
              ref={(el) => (cellsRef.current[i] = el)}
              sx={{
                height: 14,
                borderRadius: 0.5,
                bgcolor: isAmber ? '#FFAB00' : i % 3 === 0 ? '#22C55E' : '#2DD4BF',
                boxShadow: isAmber ? '0 0 10px rgba(255, 171, 0, 0.7)' : 'none',
                opacity: 0.85,
              }}
            />
          );
        })}
      </Box>

      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ pt: 0.5 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22C55E' }} />
          <Typography className="tempy-mono" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Valid (17)</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#FFAB00' }} />
          <Typography className="tempy-mono" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>Expiring in 30d (3)</Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

/**
 * 06. FAMILY JOURNAL MINI-UI:
 * Photo tile slides in from right, "Approved" manager verification pill ticks.
 */
function FamilyMiniUi({ registerTimeline }) {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !containerRef.current) return;

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(
      cardRef.current,
      { x: 40, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.4)' }
    );

    registerTimeline(5, tl);
  }, [registerTimeline]);

  return (
    <Box ref={containerRef} sx={{ width: '100%', height: '100%', p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box
        ref={cardRef}
        sx={{
          width: '100%',
          p: 1.25,
          borderRadius: 2,
          bgcolor: 'rgba(244, 114, 182, 0.14)',
          border: '1px solid rgba(244, 114, 182, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            bgcolor: '#F472B6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 12px rgba(244, 114, 182, 0.4)',
            color: '#0E1020',
          }}
        >
          <Iconify icon="solar:camera-bold-duotone" width={24} />
        </Box>

        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography className="tempy-mono" sx={{ fontSize: 11, fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
            Garden Walk Photo Journal
          </Typography>
          <Typography className="tempy-mono" sx={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
            Shared with 14 Family Members
          </Typography>
        </Box>

        <Chip
          size="small"
          icon={<Iconify icon="solar:check-circle-bold" width={13} sx={{ color: '#22C55E !important' }} />}
          label="APPROVED"
          sx={{
            height: 22,
            fontSize: 10,
            bgcolor: 'rgba(34, 197, 94, 0.2)',
            color: '#22C55E',
            border: '1px solid rgba(34, 197, 94, 0.4)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
          }}
        />
      </Box>
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                               */
/* -------------------------------------------------------------------------- */

export function PlatformRailSection() {
  const cards = LANDING_CONTENT.platformRail;

  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const ghostRef = useRef(null);
  const spineSvgRef = useRef(null);
  const spinePathRef = useRef(null);
  const gridRef = useRef(null);
  const cardRefs = useRef([]);
  const miniUiTimelinesRef = useRef({});

  // Register timeline callback from children mini-UIs
  const registerTimeline = (index, tl) => {
    miniUiTimelinesRef.current[index] = tl;
  };

  // Image source lookup helper
  const getImageSrc = (idx) => {
    switch (idx) {
      case '01':
        return LANDING_IMAGES.bento01Rota;
      case '02':
        return LANDING_IMAGES.bento02Connect;
      case '03':
        return LANDING_IMAGES.bento03Kiosk;
      case '04':
        return LANDING_IMAGES.bento04Peep;
      case '05':
        return LANDING_IMAGES.bento05Competency;
      case '06':
        return LANDING_IMAGES.bento06Family;
      default:
        return LANDING_IMAGES.statementResidentCarer;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ctx = null;

    const initEcosystemAnimations = () => {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      if (!gsap || !ScrollTrigger) return;

      const section = sectionRef.current;
      const ghost = ghostRef.current;
      const spinePath = spinePathRef.current;
      const spineSvg = spineSvgRef.current;
      const grid = gridRef.current;
      const domCards = cardRefs.current.filter(Boolean);

      if (!section || !grid || domCards.length === 0) return;

      ctx = gsap.matchMedia();

      // ----------------------------------------------------------------------
      // DESKTOP ANIMATIONS (>= 900px)
      // ----------------------------------------------------------------------
      ctx.add('(min-width: 900px)', () => {
        // 1. Ghost Word Sticky scrubbed from 30vw to -40vw
        if (ghost) {
          gsap.fromTo(
            ghost,
            { x: '30vw' },
            {
              x: '-40vw',
              ease: 'none',
              scrollTrigger: {
                trigger: section,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.0,
              },
            }
          );
        }

        // 2. Headline Line 2 Fill-In (grey -> white scrub)
        gsap.fromTo(
          '.ecosystem-headline-fill',
          { color: '#3A3F55' },
          {
            color: '#FFFFFF',
            ease: 'none',
            scrollTrigger: {
              trigger: headlineRef.current,
              start: 'top 75%',
              end: 'bottom 55%',
              scrub: 0.8,
            },
          }
        );

        // 3. Card 3D Entrance with clearProps: 'transform,opacity'
        gsap.fromTo(
          domCards,
          {
            y: 80,
            z: -200,
            rotationX: -25,
            opacity: 0,
          },
          {
            y: 0,
            z: 0,
            rotationX: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.9,
            ease: 'back.out(1.2)',
            clearProps: 'transform,opacity',
            scrollTrigger: {
              trigger: grid,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // 4. Dynamic SVG Spine built from real card centres
        const buildSpine = () => {
          if (!spineSvg || !spinePath || domCards.length < 6) return;

          const b = grid.getBoundingClientRect();
          spineSvg.setAttribute('viewBox', `0 0 ${b.width} ${b.height}`);
          const p = domCards.map((c) => {
            const r = c.getBoundingClientRect();
            return [r.left - b.left + r.width / 2, r.top - b.top + r.height / 2];
          });

          let d = `M${p[0][0]},${p[0][1]}`;
          for (let i = 1; i < p.length; i++) {
            const m = (p[i - 1][1] + p[i][1]) / 2;
            d += ` C${p[i - 1][0]},${m} ${p[i][0]},${m} ${p[i][0]},${p[i][1]}`;
          }
          spinePath.setAttribute('d', d);
          const len = spinePath.getTotalLength();
          gsap.set(spinePath, { strokeDasharray: len });
        };

        ScrollTrigger.addEventListener('refreshInit', buildSpine);
        buildSpine();

        gsap.fromTo(
          spinePath,
          { strokeDashoffset: () => spinePath.getTotalLength() },
          {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: grid,
              start: 'top 70%',
              end: 'bottom 60%',
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );

        // 5. Card Activation: Play on enter and retain text/active state throughout the section
        const on = (c, tl) => {
          c.classList.add('is-active');
          if (tl) tl.timeScale(1).play();
        };

        const off = (c, tl) => {
          c.classList.remove('is-active');
          if (tl) tl.timeScale(2.5).reverse();
        };

        domCards.forEach((c, i) => {
          const tl = miniUiTimelinesRef.current[i];
          ScrollTrigger.create({
            trigger: c,
            start: 'top 80%',
            onEnter: () => on(c, tl),
            onEnterBack: () => on(c, tl),
            onLeaveBack: () => off(c, tl),
          });
        });

        return () => {
          ScrollTrigger.removeEventListener('refreshInit', buildSpine);
        };
      });

      // ----------------------------------------------------------------------
      // MOBILE / TOUCH FALLBACK (< 900px)
      // ----------------------------------------------------------------------
      ctx.add('(max-width: 899px)', () => {
        domCards.forEach((c, i) => {
          ScrollTrigger.create({
            trigger: c,
            start: 'top 80%',
            onEnter: () => {
              c.classList.add('is-active');
              miniUiTimelinesRef.current[i]?.timeScale(1).play();
            },
          });
        });

        gsap.fromTo(
          domCards,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: grid,
              start: 'top 85%',
            },
          }
        );
      });
    };

    if (window.gsap && window.ScrollTrigger) {
      initEcosystemAnimations();
    } else {
      const timer = setInterval(() => {
        if (window.gsap && window.ScrollTrigger) {
          clearInterval(timer);
          initEcosystemAnimations();
        }
      }, 150);
      return () => clearInterval(timer);
    }

    return () => {
      ctx?.revert();
    };
  }, [cards.length]);

  const renderMiniUi = (idx) => {
    switch (idx) {
      case '01':
        return <RotaMiniUi registerTimeline={registerTimeline} />;
      case '02':
        return <ConnectMiniUi registerTimeline={registerTimeline} />;
      case '03':
        return <KioskMiniUi registerTimeline={registerTimeline} />;
      case '04':
        return <PeepMiniUi registerTimeline={registerTimeline} />;
      case '05':
        return <CompetencyMiniUi registerTimeline={registerTimeline} />;
      case '06':
        return <FamilyMiniUi registerTimeline={registerTimeline} />;
      default:
        return null;
    }
  };

  return (
    <Box
      component="section"
      id="platform"
      ref={sectionRef}
      className="tempy-section theme-night"
      sx={{
        py: { xs: 6, md: 8.5 },
        position: 'relative',
        bgcolor: '#0E1020',
        color: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      {/* Sticky Ghost Word scales with the landing page's viewport mode. */}
      <Box
        ref={ghostRef}
        sx={{
          position: 'sticky',
          top: '20vh',
          left: 0,
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-display)',
          fontSize: '22vw',
          fontWeight: 900,
          color: 'rgba(84, 88, 216, 0.05)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
          letterSpacing: '-0.04em',
          lineHeight: 1,
          mb: '-22vw', // Prevents ghost word from pushing layout down
        }}
      >
        PLATFORM
      </Box>

      {/* SVG Threading Spine (viewBox set dynamically from grid size) */}
      <Box
        component="svg"
        id="spine"
        ref={spineSvgRef}
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
          display: { xs: 'none', md: 'block' },
        }}
      >
        <path
          ref={spinePathRef}
          fill="none"
          stroke="#7478E8"
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(116, 120, 232, 0.8))',
            opacity: 0.8,
          }}
        />
      </Box>

      <Container sx={{ position: 'relative', zIndex: 2 }}>
        {/* Section Header */}
        <Box ref={headlineRef} sx={{ mb: { xs: 5, md: 7 }, maxWidth: 840 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--indigo)', boxShadow: '0 0 10px #5458D8' }} />
            <Typography className="tempy-mono" sx={{ fontSize: 11, color: '#7478E8', letterSpacing: '0.12em', fontWeight: 600 }}>
              THE ECOSYSTEM
            </Typography>
          </Stack>

          {/* Balanced 2-Line Headline */}
          <Typography
            component="h2"
            className="tempy-display"
            sx={{
              fontSize: { xs: '28px', sm: '38px', md: '48px' },
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: '-0.03em',
            }}
          >
            <Box component="span" sx={{ display: 'block', color: '#FFFFFF' }}>
              ONE PLATFORM.
            </Box>
            <Box component="span" className="ecosystem-headline-fill" sx={{ display: 'block', color: '#3A3F55', transition: 'color 0.2s' }}>
              EVERY PILLAR COVERED.
            </Box>
          </Typography>

          <Typography
            className="tempy-body"
            sx={{
              fontSize: { xs: 14.5, md: 16 },
              color: 'rgba(255, 255, 255, 0.72)',
              mt: 1.5,
              lineHeight: 1.55,
              maxWidth: 580,
            }}
          >
            Built specifically to replace disjointed single-purpose tools with an integrated operational spine.
          </Typography>
        </Box>

        {/* 12-Column Bento Grid */}
        <Box
          ref={gridRef}
          className="grid"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' },
            gap: 3.5,
            perspective: 1200,
          }}
        >
          {cards.map((card, index) => {
            const accent = card.accent || '#7478E8';

            return (
              <Box
                key={card.idx}
                ref={(el) => (cardRefs.current[index] = el)}
                className="ecosystem-card card"
                style={{ '--accent': accent }}
                sx={{
                  gridColumn: { xs: 'span 1', md: `span ${card.colSpan || 6}` },
                  position: 'relative',
                  borderRadius: '24px',
                  bgcolor: '#1B1F2E',
                  border: '1px solid #2B3048',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'border-color 0.35s ease, box-shadow 0.35s ease',
                  // Active state
                  '&.is-active': {
                    borderColor: 'var(--accent)',
                    boxShadow: '0 20px 50px -20px var(--accent)',
                    '& .card-number': {
                      color: 'var(--accent)',
                    },
                    '& .card-photo-img': {
                      filter: 'grayscale(0) brightness(1)',
                    },
                    '& .card-photo-tint': {
                      opacity: 0.2,
                    },
                    '& .card-icon-tile': {
                      bgcolor: 'var(--accent)',
                      color: '#0E1020',
                    },
                  },
                }}
              >
                {/* Top 45% Photo Zone with Accent Tint Overlay */}
                <Box
                  className="card-photo-container"
                  sx={{
                    width: '100%',
                    height: { xs: 180, sm: 220 },
                    position: 'relative',
                    overflow: 'hidden',
                    bgcolor: '#0E1020',
                  }}
                >
                  <Box
                    component="img"
                    src={getImageSrc(card.idx)}
                    alt={card.title}
                    className="card-photo-img"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      filter: 'grayscale(0.85) brightness(0.6)',
                      transition: 'filter 0.5s ease',
                    }}
                  />
                  {/* Active tint overlay (mix-blend-mode: multiply) */}
                  <Box
                    className="card-photo-tint"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'var(--accent)',
                      mixBlendMode: 'multiply',
                      opacity: 0,
                      transition: 'opacity 0.5s ease',
                      pointerEvents: 'none',
                    }}
                  />
                </Box>

                {/* Overlapping Glass Mini-UI Panel */}
                <Box
                  sx={{
                    px: { xs: 2.5, md: 3 },
                    mt: -5,
                    position: 'relative',
                    zIndex: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      minHeight: 125,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(14, 16, 32, 0.82)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid',
                      borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
                      overflow: 'hidden',
                      display: 'flex',
                    }}
                  >
                    {renderMiniUi(card.idx)}
                  </Box>
                </Box>

                {/* Card Body: Below the Mini-UI */}
                <Box
                  sx={{
                    p: { xs: 2.5, md: 3.5 },
                    pt: 2.5,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    flex: 1,
                  }}
                >
                  <Box>
                    {/* Index & Category Pill */}
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography
                        className="card-number tempy-mono"
                        sx={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: 'rgba(255, 255, 255, 0.35)',
                          transition: 'color 0.35s ease',
                        }}
                      >
                        {card.idx}
                      </Typography>

                      <Chip
                        size="small"
                        label={card.badge}
                        sx={{
                          height: 22,
                          fontSize: 10,
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 600,
                          bgcolor: `color-mix(in srgb, ${accent} 14%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${accent} 35%, transparent)`,
                          color: accent,
                        }}
                      />
                    </Stack>

                    {/* Icon Tile & Title */}
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                      <Box
                        className="card-icon-tile"
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${accent} 40%, transparent)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          color: accent,
                          transition: 'background-color 0.35s ease, color 0.35s ease',
                        }}
                      >
                        <Iconify icon={card.icon} width={24} />
                      </Box>
                      <Typography
                        component="h3"
                        className="tempy-display"
                        sx={{
                          fontSize: { xs: 18, sm: 20 },
                          fontWeight: 700,
                          color: '#FFFFFF',
                          letterSpacing: '-0.01em',
                          lineHeight: 1.25,
                        }}
                      >
                        {card.title}
                      </Typography>
                    </Stack>

                    {/* Description */}
                    <Typography
                      className="tempy-body"
                      sx={{
                        fontSize: 14,
                        color: 'rgba(255, 255, 255, 0.72)',
                        lineHeight: 1.6,
                        mb: 2,
                      }}
                    >
                      {card.desc}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Container>

      <style>{`
        @keyframes pulseOpenShift {
          0% { opacity: 0.6; transform: scaleY(0.95); }
          100% { opacity: 1; transform: scaleY(1.05); }
        }
        @keyframes pulseDot {
          0% { transform: scale(0.85); opacity: 0.7; }
          100% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </Box>
  );
}
