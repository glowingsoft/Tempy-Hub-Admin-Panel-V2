/**
 * Centralized Landing Page Data
 * Single source of truth for all copy, metrics, features, specifications, and layout data across the Tempy Hub landing experience.
 */

export const LANDING_PAGE_DATA = {
  // ---------------------------------------------------------------------------
  // Global & Navigation
  // ---------------------------------------------------------------------------
  global: {
    brandName: 'TEMPYHUB',
    tagline: 'One platform. Every shift, every visit.',
    ticker: [
      'CQC READY',
      'GDPR COMPLIANT',
      'UK DATA HOSTED',
      '1,000,000+ SHIFTS SCHEDULED',
      'ISO 27001 CLOUD',
      'NHS DSPT ALIGNED',
    ],
    navLinks: [
      { label: 'PLATFORM', href: '#platform' },
      { label: 'SAFETY', href: '#safety' },
      { label: 'STAFFING', href: '#staffing' },
      { label: 'SECURITY', href: '#security' },
      { label: 'FAQ', href: '#faq' },
    ],
  },

  // ---------------------------------------------------------------------------
  // 01. Hero Section
  // ---------------------------------------------------------------------------
  hero: {
    kicker: 'Built for care homes · HIPAA compliant',
    h1: 'KNOW WHO IS IN THE BUILDING. EVERY SHIFT, EVERY VISIT.',
    lines: ['KNOW WHO IS IN', 'THE BUILDING. EVERY', 'SHIFT, EVERY VISIT.'],
    body: "TempyHub is the sign-in, staffing and compliance hub for care homes. One platform for the kiosk at reception, the apps your team and visitors carry, and the manager's desk.",
    primaryCta: 'EXPLORE THE ECOSYSTEM',
    cta: 'EXPLORE THE ECOSYSTEM',
    chips: {
      badge: 'LIVE 3D TWIN · ISOMETRIC',
      bottomLeft: 'SHIFT FILLED IN 4 MIN · TEMPY CONNECT',
      topRight: '24 / 24 RESIDENTS SAFE',
    },
    badges: [
      'CQC Inspection Ready',
      '100% GDPR & UK data hosted',
      '1,000,000+ shifts scheduled',
    ],
  },

  // ---------------------------------------------------------------------------
  // 02. Statement Section
  // ---------------------------------------------------------------------------
  statement: {
    lead: 'WE REPLACE THE CHAOS.',
    punch: 'YOU KEEP THE CARE.',
    sub: 'Designed alongside Registered Managers and Care Operations Directors to eliminate administrative friction.',
  },

  // ---------------------------------------------------------------------------
  // 03. Journey Before & After Pairs
  // ---------------------------------------------------------------------------
  journeyPairs: [
    {
      before: 'Manual rota spreadsheets that break when someone calls in sick',
      after: 'Automated shift schedules with one-click internal bidding and agency fallback',
    },
    {
      before: 'Frantic morning calls to expensive agencies with hidden fees',
      after: 'Transparent agency spend with guaranteed fill rates on Tempy Connect',
    },
    {
      before: 'Paper fire drill clipboards with outdated mobility and room info',
      after: 'Instant evacuation roll call with live, colour-coded PEEP pins',
    },
    {
      before: 'Worried families calling the front desk for daily resident status',
      after: 'Families connected via photo journals, digital gazettes and community walls',
    },
    {
      before: 'Stressed managers dreading inspections and hunting for compliance records',
      after: 'One-click audit reports ready for fire inspectors and Care Quality Commissioners',
    },
  ],

  // ---------------------------------------------------------------------------
  // 04. The Ecosystem (Platform Rail)
  // ---------------------------------------------------------------------------
  ecosystem: {
    kicker: 'THE ECOSYSTEM',
    titleLine1: 'ONE PLATFORM.',
    titleLine2: 'EVERY PILLAR COVERED.',
    intro: 'Built specifically to replace disjointed single-purpose tools with an integrated operational spine.',
    pillars: [
      {
        idx: '01',
        title: 'ROTA & SHIFT MANAGEMENT',
        desc: 'Drag-and-drop rota, skills matching, shift claims, repeat templates, conflict detection including rest-period rules and overtime caps.',
        icon: 'solar:calendar-bold-duotone',
        badge: 'Core Scheduling',
        accent: '#7478E8',
        colSpan: 7,
        imageKey: 'bento01Rota',
        features: [
          'Interactive 4-week drag-and-drop schedule planner',
          'Skills and training matching per care home floor',
          'Working Time Directive & rest-period validation',
          'Open shift broadcast with 1-click team bidding',
          'Direct payroll CSV export with overtime rules',
        ],
        metric: '98.4% Shifts filled internally',
      },
      {
        idx: '02',
        title: 'TEMPY CONNECT',
        desc: 'One-click broadcast to vetted agencies, live fill-rate tracking, central spend and consolidated invoicing, instant claim approval.',
        icon: 'solar:users-group-rounded-bold-duotone',
        badge: 'Agency Marketplace',
        accent: '#38BDF8',
        colSpan: 5,
        imageKey: 'bento02Connect',
        features: [
          'Instant multi-agency broadcast for emergency cover',
          'Guaranteed fill rate tracking in under 4 minutes',
          'Automated compliance checks (DBS, NMC, Right to Work)',
          'Consolidated weekly invoicing with zero hidden markups',
          'Real-time agency spend reduction analytics',
        ],
        metric: '4 Mins average fill time',
      },
      {
        idx: '03',
        title: 'KIOSK, TIME & ATTENDANCE',
        desc: 'ID / 4-digit PIN / QR verification, live on-site headcount, automated breaks and overtime calculation, GPS mobile clock-in, visitor passcodes.',
        icon: 'solar:tablet-bold-duotone',
        badge: 'Hardware & Attendance',
        accent: '#A78BFA',
        colSpan: 4,
        imageKey: 'bento03Kiosk',
        features: [
          'Dedicated wall-mounted reception kiosk hardware',
          'Fast 4-digit PIN & contactless QR sign-in',
          'Live on-site staff, visitor & contractor headcount',
          'Automatic break deductions & timesheet generation',
          'Geofenced mobile clock-in for visiting clinicians',
        ],
        metric: '100% Verified attendance',
      },
      {
        idx: '04',
        title: 'PEEP & FIRE DRILLS',
        desc: 'Interactive floor plans, resident mobility pins, muster roll call with Safe / Accounted For / Assistance Needed / Missing, drill PDF exports.',
        icon: 'solar:shield-warning-bold-duotone',
        badge: 'Emergency & Safety',
        accent: '#FF6B6B',
        colSpan: 8,
        featured: true,
        imageKey: 'bento04Peep',
        features: [
          'Interactive 3D isometric care home floor plans',
          'Colour-coded resident evacuation mobility pins (PEEP)',
          'Live muster roll call with instant headcounts',
          'Offline tablet sync during fire alarm activation',
          '1-Click CQC & fire inspection PDF audit reports',
        ],
        metric: '3m 42s drill evacuation speed',
      },
      {
        idx: '05',
        title: 'COMPETENCY & SUPERVISION',
        desc: 'Heatmap skill matrix, supervision cycles, appraisals, document vault and verified e-sign compliance tracking.',
        icon: 'solar:diploma-verified-bold-duotone',
        badge: 'Workforce Compliance',
        accent: '#2DD4BF',
        colSpan: 5,
        imageKey: 'bento05Competency',
        features: [
          'Visual skill matrix heatmap across all care staff',
          'Automated 30/60/90-day mandatory training expiry alerts',
          'Staff 1-to-1 supervision logs & appraisal records',
          'Encrypted policy document vault with e-signatures',
          'Single-click Care Quality Commission compliance exports',
        ],
        metric: '100% CQC audit readiness',
      },
      {
        idx: '06',
        title: 'FAMILY JOURNAL',
        desc: 'Digital gazette, moderated community wall, photo consent workflow, and secure family updates in real time.',
        icon: 'solar:heart-bold-duotone',
        badge: 'Family Engagement',
        accent: '#F472B6',
        colSpan: 7,
        imageKey: 'bento06Family',
        features: [
          'Moderated care home activity & community noticeboard',
          'GDPR-compliant resident photo consent controls',
          'Secure dedicated family portal & mobile notifications',
          'Daily digital newsletter and dining menu updates',
          'Direct family messaging with registered managers',
        ],
        metric: '96% Family satisfaction score',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 05. Evacuation and PEEP Section
  // ---------------------------------------------------------------------------
  evacuation: {
    kicker: 'EVACUATION AND PEEP',
    headline: 'When the alarm sounds, everyone is accounted for.',
    body: "Raise a smoke alarm or a real fire from the kiosk or your phone. Every user's app gets the alert, each manager sees their own team on the roll call, and the count keeps working if the connection drops.",
    checks: [
      {
        title: 'Two alert types.',
        desc: 'Smoke alarm for drills and precautions, real fire for emergencies.',
      },
      {
        title: 'Resident PEEPs on file.',
        desc: 'Floor plans with room pins, reviewed on a monthly cycle.',
      },
      {
        title: 'Drill records ready for inspection.',
        desc: 'Drills, compartment drills and events, tracked against yearly targets.',
      },
    ],
    floorPlanPins: [
      {
        id: 'p1',
        room: 'Rm 101',
        resident: 'Arthur Ward',
        status: 'Independent',
        color: '#22C55E',
        top: '28%',
        left: '26%',
        desc: 'Unassisted primary exit evacuation',
      },
      {
        id: 'p2',
        room: 'Rm 105',
        resident: 'Eleanor Kelly',
        status: 'Assisted 1-Person',
        color: '#FFAB00',
        top: '34%',
        left: '68%',
        desc: 'Requires 1-carer walking guide',
      },
      {
        id: 'p3',
        room: 'Rm 118',
        resident: 'Margaret Hall',
        status: 'Evac Chair / Bedbound',
        color: '#FF4842',
        top: '65%',
        left: '36%',
        desc: 'Evac Chair · 2 dedicated carers',
      },
      {
        id: 'p4',
        room: 'Rm 112',
        resident: 'David Evans',
        status: 'Independent',
        color: '#22C55E',
        top: '58%',
        left: '74%',
        desc: 'Unassisted primary exit evacuation',
      },
      {
        id: 'p5',
        room: 'Muster A',
        resident: 'Exit A Assembly',
        status: 'Primary Safe Zone',
        color: '#10B981',
        top: '78%',
        left: '56%',
        desc: 'Designated courtyard muster area',
      },
    ],
  },

  // ---------------------------------------------------------------------------
  // 06. Operational Stats
  // ---------------------------------------------------------------------------
  stats: [
    {
      value: 1000000,
      prefix: '',
      suffix: '+',
      label: 'Shifts Scheduled',
      sub: 'Across residential, nursing, and dementia care homes nationwide',
    },
    {
      value: 26,
      prefix: '',
      suffix: '%',
      label: 'Agency Spend Reduced',
      sub: 'Achieved in the first quarter via smart internal shift claiming',
    },
    {
      value: 48,
      prefix: '',
      suffix: ' HRS',
      label: 'Typical Onboarding',
      sub: 'Zero setup friction; import your current staff rotas in minutes',
    },
    {
      value: 15,
      prefix: '',
      suffix: '+ HRS',
      label: 'Manager Admin Saved Weekly',
      sub: 'Reclaim precious hours for resident care and team leadership',
    },
  ],

  // ---------------------------------------------------------------------------
  // 07. Cinematic Banner
  // ---------------------------------------------------------------------------
  cinematic: {
    headline: 'CARE THAT WORKS AS HARD AS YOU DO.',
    points: ['ONE PLATFORM', 'ONE POINT OF CONTACT', 'FULL SITE VISIBILITY'],
  },

  // ---------------------------------------------------------------------------
  // 08. Stakeholders ("Who We Stand With")
  // ---------------------------------------------------------------------------
  whoWeStandWith: [
    {
      idx: '01',
      role: 'OWNERS & EXECUTIVES',
      highlight: 'Multi-site labour control, retention, and inspection readiness',
      desc: 'Gain cross-group visibility into labour margins, agency reliance, and statutory training records. Protect your operating licence and care home brand reputation.',
    },
    {
      idx: '02',
      role: 'REGISTERED MANAGERS',
      highlight: 'Reclaim 15+ hours a week and eliminate rota panic',
      desc: 'Go home knowing the weekend shifts are covered without frantic phone calls. Walk into CQC inspections with instant digital audits and timestamped evidence.',
    },
    {
      idx: '03',
      role: 'CARERS & NURSES',
      highlight: 'Total schedule clarity on mobile with flexible shift claims',
      desc: 'View assigned shifts, claim premium shifts for extra income, request annual leave, and clock in with a single touch or PIN at the kiosk.',
    },
    {
      idx: '04',
      role: 'FAMILIES',
      highlight: 'Peace of mind with weekly gazettes and life updates',
      desc: 'Receive digital photo updates, activity milestones, and notices directly through the secure family portal with full GDPR consent safeguards.',
    },
    {
      idx: '05',
      role: 'RECEPTION & VISITORS',
      highlight: 'Fast, secure touchless entry with auto muster roll calls',
      desc: 'Visitors and visiting healthcare professionals sign in at the kiosk with one-time passcodes, instantly appearing on the live evacuation register.',
    },
  ],

  // ---------------------------------------------------------------------------
  // 08B. Dedicated Kiosk Hardware Showcase
  // ---------------------------------------------------------------------------
  kioskHardware: {
    kicker: 'PHYSICAL HARDWARE · RECEPTION TABLET KIOSK',
    headline: 'HARDWARE DESIGNED FOR THE FRONT DESK.',
    intro: 'Commercial-grade, wall-mounted or desktop tablet stations designed for continuous 24/7 care home reception operation. Sealed anti-tamper enclosure with POE or 24V supply.',
    pills: {
      leftPhoto: 'ONLINE · 24V POWERED',
      pinPhoto: 'SARAH J. · SENIOR CARER CLOCKED IN',
    },
    features: [
      {
        idx: '01',
        title: '4-DIGIT PIN & RFID VERIFICATION',
        desc: 'Sub-second clock-in for carers and nurses. Automatically computes shift handovers, breaks, and overtime rules.',
        icon: 'solar:key-minimalistic-square-bold',
        accent: '#22C55E',
      },
      {
        idx: '02',
        title: 'VISITOR & CONTRACTOR PASSCODES',
        desc: 'Family sign-in with digital health declarations, instant contractor time stamps, and agency badge checks.',
        icon: 'solar:shield-check-bold',
        accent: '#38BDF8',
      },
      {
        idx: '03',
        title: 'INSTANT LIVE FIRE MUSTER SYNC',
        desc: 'Every tap immediately synchronises on-site headcounts with the emergency evacuation map on any manager tablet.',
        icon: 'solar:fire-bold',
        accent: '#FF4842',
      },
    ],
    specStrip: {
      label: 'SPECIFICATION: INDUSTRIAL VESA WALL MOUNT · TAMPER RESISTANT · BACKUP BATTERY',
      chips: ['IPAD / IOS', 'ANDROID TABLET', 'TOUCH TERMINAL', '24V DC / POE'],
    },
  },

  // ---------------------------------------------------------------------------
  // 09. ROI Calculator
  // ---------------------------------------------------------------------------
  calculator: {
    title: 'ESTIMATE YOUR OPERATIONAL ROI',
    subtitle: 'See how much your home or multi-site group saves each month with automated shift allocation and audit readiness.',
    defaultBeds: 45,
    defaultAgencyHours: 280,
  },

  // ---------------------------------------------------------------------------
  // 10. Security & Trust
  // ---------------------------------------------------------------------------
  security: [
    {
      title: 'UK DATA RESIDENCY',
      desc: 'Hosted in UK Sovereign data centres with ISO 27001 certification and NHS Data Security and Protection Toolkit (DSPT) alignment.',
      icon: 'solar:shield-check-bold',
    },
    {
      title: 'ROLE-BASED ACCESS',
      desc: 'Granular permissions ensure carers, nurses, managers, owners, and agency staff see strictly what is pertinent to their duty.',
      icon: 'solar:lock-keyhole-minimalistic-bold',
    },
    {
      title: 'PHOTO PRIVACY SAFEGUARD',
      desc: 'Multi-tiered moderation workflow with automated resident consent filtering before images reach family walls or gazettes.',
      icon: 'solar:camera-minimalistic-bold',
    },
    {
      title: 'CQC EVIDENCE EXPORTER',
      desc: 'Generate complete inspection packs for Safe, Effective, Caring, Responsive and Well-Led key lines of enquiry at a touch.',
      icon: 'solar:document-medicine-bold',
    },
  ],

  // ---------------------------------------------------------------------------
  // Sectors Marquee
  // ---------------------------------------------------------------------------
  sectorsMarquee: [
    'NURSING HOMES',
    'RESIDENTIAL CARE',
    'DEMENTIA SPECIALISTS',
    'ASSISTED LIVING',
    'MULTI-SITE CARE GROUPS',
    'EXTRA CARE HOUSING',
  ],

  // ---------------------------------------------------------------------------
  // 12. FAQ Section
  // ---------------------------------------------------------------------------
  faqs: [
    {
      q: 'How fast can our care home onboard onto Tempy Hub?',
      a: 'Most single homes and small groups go fully live in under 48 hours. Our UK support team imports your staff rosters, resident room lists, and existing floor plans directly.',
    },
    {
      q: 'Does Tempy Hub support multi-site care group management?',
      a: 'Yes. Multi-site executives receive consolidated group dashboards, inter-site staff bank sharing, group-wide agency spend controls, and automated compliance rollups.',
    },
    {
      q: 'What hardware is required for the kiosk time & attendance?',
      a: 'Tempy Hub Kiosk runs natively on iPads, Android tablets (Samsung Galaxy Tab), or dedicated commercial touch terminals with wall mounts or desk stands.',
    },
    {
      q: 'Does Tempy Hub replace our existing staffing agencies?',
      a: 'Not unless you want it to! Tempy Connect allows you to invite your preferred agencies onto the platform so all bookings, rates, and timesheets flow through one unified system.',
    },
    {
      q: 'How does Tempy Hub comply with CQC regulations and UK GDPR?',
      a: 'All data is stored exclusively in UK ISO 27001 certified data centres. We adhere strictly to NHS DSPT standards, maintain tamper-evident audit logs, and provide instant CQC evidence packs.',
    },
  ],

  // ---------------------------------------------------------------------------
  // 13. Final CTA
  // ---------------------------------------------------------------------------
  finalCta: {
    headline: 'READY TO MODERNISE YOUR CARE HOME OPERATIONS?',
    subtext: 'No credit card required. Free 30-minute operational consultation and demo included.',
    btnLabel: 'BOOK A DEMO',
    secondary: 'SPEAK WITH A CARE TECH SPECIALIST',
  },

  // ---------------------------------------------------------------------------
  // 14. Footer Section
  // ---------------------------------------------------------------------------
  footer: {
    tagline: 'One platform. Every shift, every visit.',
    cqcBadge: 'UNITED KINGDOM · CQC ALIGNED',
    cols: [
      {
        title: 'Platform',
        links: ['Rota Scheduling', 'Tempy Connect', 'Kiosk & Attendance', 'Live PEEP Maps', 'Supervision & Audits'],
      },
      {
        title: 'Solutions',
        links: ['Registered Managers', 'Care Home Owners', 'Carers & Staff', 'Family Engagement', 'CQC Inspection Pack'],
      },
      {
        title: 'Security & Legal',
        links: ['UK Data Hosting', 'ISO 27001 Alignment', 'NHS DSPT Standards', 'GDPR & Privacy Policy', 'Terms of Service'],
      },
    ],
    legal: {
      copyright: `© ${new Date().getFullYear()} TEMPY HUB LTD. ALL RIGHTS RESERVED. REGISTERED IN ENGLAND & WALES.`,
      links: [
        { label: 'PRIVACY POLICY', href: '#' },
        { label: 'TERMS OF SERVICE', href: '#' },
        { label: 'SECURITY', href: '#' },
      ],
    },
  },
};

// Aliases for legacy imports
export const LANDING_CONTENT = {
  ...LANDING_PAGE_DATA,
  platformRail: LANDING_PAGE_DATA.ecosystem.pillars,
  navLinks: LANDING_PAGE_DATA.global.navLinks,
  ticker: LANDING_PAGE_DATA.global.ticker,
};
