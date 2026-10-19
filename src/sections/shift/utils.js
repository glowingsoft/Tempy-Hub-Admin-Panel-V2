export {
  getOwnerOrganizationId,
  getOwnerOrganizationName,
} from 'src/utils/organization';

/**
 * @param {object} shift
 * @returns {string} the assigned staff member's name, or an open/unassigned label
 */
export function getShiftStaffName(shift) {
  return (
    shift?.staff?.name ||
    shift?.staff?.user?.name ||
    shift?.staff?.userId?.name ||
    shift?.staff?.employeeCode ||
    'Open / Unassigned'
  );
}
