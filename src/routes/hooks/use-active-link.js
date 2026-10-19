import { usePathname } from './use-pathname';
import { hasParams, removeParams, isExternalLink, removeLastSlash } from '../utils';

// ----------------------------------------------------------------------

function isDashboardRootPath(itemPath) {
  return itemPath.split('/').filter(Boolean).length === 1;
}

function isNestedPath(pathname, itemPath) {
  return pathname === itemPath || pathname.startsWith(`${itemPath}/`);
}

// ----------------------------------------------------------------------

export function useActiveLink(itemPath, deep = true) {
  const pathname = removeLastSlash(usePathname());

  const pathHasParams = hasParams(itemPath);

  const notValid = itemPath?.startsWith('#') || isExternalLink(itemPath);

  if (notValid) {
    return false;
  }

  const originItemPath = removeLastSlash(removeParams(itemPath));

  /**
   * Dashboard roots (`/owner-dashboard`, `/dashboard`, `/staff`, …) stay exact
   * so they are not highlighted on every nested module page.
   *
   * Every other item stays active on its list, create, detail, and edit routes.
   */
  const isDeep = deep || pathHasParams || !isDashboardRootPath(originItemPath);

  if (isDeep) {
    const defaultActive = isNestedPath(pathname, originItemPath);
    const hasParamsActive = pathHasParams && originItemPath === pathname;

    return defaultActive || hasParamsActive;
  }

  return pathname === originItemPath;
}
