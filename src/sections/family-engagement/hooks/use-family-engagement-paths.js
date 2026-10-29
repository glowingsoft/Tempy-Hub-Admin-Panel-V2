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
        newsletterEdit: paths.owner.familyEngagement.newsletterEdit,
        gazettes: paths.owner.familyEngagement.gazettes,
        familyGroups: paths.owner.familyEngagement.familyGroups,
        familyMemberships: paths.owner.familyEngagement.memberships,
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
        newsletterEdit: paths.lineManager.familyEngagement.newsletterEdit,
        gazettes: paths.lineManager.familyEngagement.gazettes,
        familyGroups: paths.lineManager.familyEngagement.familyGroups,
        familyMemberships: paths.lineManager.familyEngagement.memberships,
        directory: paths.lineManager.residents,
        residents: paths.lineManager.residents,
        feedback: paths.lineManager.feedback,
        fireDrills: paths.lineManager.fireDrills,
        rota: paths.lineManager.teamRota,
      };
    }

    if (pathname.startsWith(paths.staff.root)) {
      return {
        dashboardRoot: paths.staff.dashboard || paths.staff.root,
        familyOverview: paths.staff.familyEngagement?.myResidents,
        moderation: paths.staff.familyEngagement?.myResidents,
        communityWall: paths.staff.familyEngagement?.communityWall,
        photoUploads: paths.staff.familyEngagement?.photoUploads,
        myResidents: paths.staff.familyEngagement?.myResidents,
        myResidentDetail: paths.staff.familyEngagement?.myResidentDetail,
        newsletters: paths.staff.familyEngagement?.communityWall,
        newsletterEdit: () => paths.staff.familyEngagement?.communityWall,
        gazettes: paths.staff.familyEngagement?.gazettes,
        familyGroups: paths.staff.familyEngagement?.communityWall,
        directory: paths.staff.dashboard,
        residents: paths.staff.dashboard,
        documents: paths.staff.documents.root,
        rota: paths.staff.rota,
      };
    }

    return {
      dashboardRoot: paths.siteManager.root,
      familyOverview: paths.siteManager.familyEngagement.overview,
      moderation: paths.siteManager.familyEngagement.moderation,
      communityWall: paths.siteManager.familyEngagement.communityWall,
      newsletters: paths.siteManager.familyEngagement.newsletters,
      newsletterEdit: paths.siteManager.familyEngagement.newsletterEdit,
      gazettes: paths.siteManager.familyEngagement.gazettes,
      familyGroups: paths.siteManager.familyEngagement.familyGroups,
      familyMemberships: paths.siteManager.familyEngagement.memberships,
      directory: paths.siteManager.directory.root,
      residents: paths.siteManager.residents.root,
      feedback: paths.siteManager.feedback,
      fireDrills: paths.siteManager.fireDrills,
      rota: paths.siteManager.rota,
    };
  }, [pathname]);
}