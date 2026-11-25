// Static Image Asset Registry for Tempy Hub Marketing Page
// Served from public assets directory: /assets/images/landingpage-images/
import { CONFIG } from 'src/config-global';

const BASE_URL = `${CONFIG.site.basePath}/assets/images/landingpage-images`;

export const LANDING_IMAGES = {
  statementResidentCarer: `${BASE_URL}/statement-resident-carer.jpg`,
  gardenWalkCinematic: `${BASE_URL}/garden-walk-cinematic.jpg`,
  kioskTabletReception: `${BASE_URL}/kiosk-tablet-reception.jpg`,
  heroCareHome3d: `${BASE_URL}/hero-care-home-3d.webp`,
  cutawayFloorPlan: `${BASE_URL}/cutaway-floor-plan.jpg`,
  bento01Rota: `${BASE_URL}/bento-01-rota.jpg`,
  bento02Connect: `${BASE_URL}/bento-02-connect.jpg`,
  bento03Kiosk: `${BASE_URL}/bento-03-kiosk.jpg`,
  bento04Peep: `${BASE_URL}/bento-04-peep.jpg`,
  bento05Competency: `${BASE_URL}/bento-05-competency.jpg`,
  bento06Family: `${BASE_URL}/bento-06-family.jpg`,
  kioskFirePressInset: `${BASE_URL}/kiosk-fire-press-inset.jpg`,
};
