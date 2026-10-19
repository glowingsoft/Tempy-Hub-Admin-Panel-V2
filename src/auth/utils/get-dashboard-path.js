import { paths } from 'src/routes/paths';

export function isAuthenticatedUser(user) {
  return Boolean(user?.token);
}

export function getDashboardPath(user) {
  switch (user?.permission) {
    case 1:
      return paths.dashboard.root;
    case 2:
      return paths.siteManager.root;
    case 3:
      return paths.lineManager.root;
    case 4:
      return paths.owner.root;
    case 5:
      return paths.staff.dashboard;
    default:
      return paths.dashboard.root;
  }
}
