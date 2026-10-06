import { useMemo } from 'react';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function useFamilyEngagementPaths() {
  const pathname = usePathname();

  return useMemo(() => {
    if (pathname.startsWith(paths.owner.root)) {
      return {
        dashboardRoot: paths.owner.root,
        familyOverview: paths.owner.familyEngagement.overview,
        moderation: paths.owner.familyEngagement.moderation,
        communityWall: paths.owner.familyEngagement.communityWall,
        newsletters: paths.owner.familyEngagement.newsletters,
        gazettes: paths.owner.familyEngagement.gazettes,
        familyGroups: paths.owner.familyEngagement.familyGroups,
        directory: paths.owner.directory.root,
        residents: paths.owner.residents.root,
      };
    }

    if (pathname.startsWith(paths.lineManager.root)) {
      return {
        dashboardRoot: paths.lineManager.root,
        familyOverview: paths.lineManager.familyEngagement.overview,
        moderation: paths.lineManager.familyEngagement.moderation,
        communityWall: paths.lineManager.familyEngagement.communityWall,
        newsletters: paths.lineManager.familyEngagement.newsletters,
        gazettes: paths.lineManager.familyEngagement.gazettes,
        familyGroups: paths.lineManager.familyEngagement.familyGroups,
        directory: paths.lineManager.residents,
        residents: paths.lineManager.residents,
        feedback: paths.lineManager.feedback,
        fireDrills: paths.lineManager.fireDrills,
        rota: paths.lineManager.teamRota,
      };
    }

    return {
      dashboardRoot: paths.siteManager.root,
      familyOverview: paths.siteManager.familyEngagement.overview,
      moderation: paths.siteManager.familyEngagement.moderation,
      communityWall: paths.siteManager.familyEngagement.communityWall,
      newsletters: paths.siteManager.familyEngagement.newsletters,
      gazettes: paths.siteManager.familyEngagement.gazettes,
      familyGroups: paths.siteManager.familyEngagement.familyGroups,
      directory: paths.siteManager.directory.root,
      residents: paths.siteManager.residents.root,
      feedback: paths.siteManager.feedback,
      fireDrills: paths.siteManager.fireDrills,
      rota: paths.siteManager.rota,
    };
  }, [pathname]);
}
