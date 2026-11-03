import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

/**
 * Returns a flat list of { label, groupLabel } objects for all applies-to entries.
 * Used by detail view (show all) and table row (truncate to 2).
 */
export function getRequirementAppliesToItems(requirement, jobTitlesMap = {}, departmentsMap = {}) {
  // Prefer API-populated arrays (row.jobTitles / row.departments) if present
  const populatedJobTitles = Array.isArray(requirement?.jobTitles) ? requirement.jobTitles : null;
  const populatedDepartments = Array.isArray(requirement?.departments) ? requirement.departments : null;

  const jobTitleIds = Array.isArray(requirement?.appliesTo?.jobTitleIds)
    ? requirement.appliesTo.jobTitleIds
    : [];
  const departmentIds = Array.isArray(requirement?.appliesTo?.departmentIds)
    ? requirement.appliesTo.departmentIds
    : [];

  const jobTitleItems = populatedJobTitles
    ? populatedJobTitles.map((item) => ({ label: item.name, groupLabel: 'Job title' })).filter((i) => i.label)
    : jobTitleIds
      .map((item) => {
        if (typeof item === 'object' && item?.name) return { label: item.name, groupLabel: 'Job title' };
        const id = typeof item === 'object' ? item?._id : item;
        const name = jobTitlesMap[id]?.name || id;
        return name ? { label: name, groupLabel: 'Job title' } : null;
      })
      .filter(Boolean);

  const departmentItems = populatedDepartments
    ? populatedDepartments.map((item) => ({ label: item.name, groupLabel: 'Department' })).filter((i) => i.label)
    : departmentIds
      .map((item) => {
        if (typeof item === 'object' && item?.name) return { label: item.name, groupLabel: 'Department' };
        const id = typeof item === 'object' ? item?._id : item;
        const name = departmentsMap[id]?.name || id;
        return name ? { label: name, groupLabel: 'Department' } : null;
      })
      .filter(Boolean);

  return [...jobTitleItems, ...departmentItems];
}

/**
 * Legacy plain-text formatter (used for CSV/PDF export).
 */
export function formatRequirementAppliesTo(requirement, jobTitlesMap = {}, departmentsMap = {}) {
  const items = getRequirementAppliesToItems(requirement, jobTitlesMap, departmentsMap);
  if (!items.length) return '—';

  const byGroup = {};
  items.forEach(({ label, groupLabel }) => {
    if (!byGroup[groupLabel]) byGroup[groupLabel] = [];
    byGroup[groupLabel].push(label);
  });

  return Object.entries(byGroup)
    .map(([group, names]) => `${group}s: ${names.join(', ')}`)
    .join('; ');
}

function hasSelection(value) {
  if (Array.isArray(value)) return value.some(hasSelection);
  if (value && typeof value === 'object') {
    return Boolean(value._id || value.id || value.value || value.name || value.label);
  }
  return Boolean(value);
}

export function hasRequirementDepartmentOrJobTitles(requirement, jobTitlesMap = {}, departmentsMap = {}) {
  const hasJobTitles = [
    requirement?.jobTitleId,
    requirement?.jobTitle,
    requirement?.jobTitleIds,
    requirement?.jobTitles,
    requirement?.appliesTo?.jobTitleIds,
  ].some(hasSelection);

  const hasDepartments = [
    requirement?.departmentId,
    requirement?.department,
    requirement?.departmentIds,
    requirement?.departments,
    requirement?.appliesTo?.departmentIds,
  ].some(hasSelection);

  if (hasJobTitles || hasDepartments) return true;

  const appliesToItems = getRequirementAppliesToItems(requirement, jobTitlesMap, departmentsMap);
  return appliesToItems.length > 0;
}

// ----------------------------------------------------------------------

const MAX_VISIBLE = 2;

function AppliesToCell({ items }) {
  if (!items.length) {
    return <Typography variant="body2" color="text.secondary">—</Typography>;
  }

  const visible = items.slice(0, MAX_VISIBLE);
  const hiddenCount = items.length - MAX_VISIBLE;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'nowrap', gap: 0.5, alignItems: 'center' }}>
      {visible.map((item, idx) => (
        <Chip
          key={idx}
          label={item.label}
          size="small"
          variant="soft"
          color="default"
          sx={{ maxWidth: 110, fontSize: 11 }}
        />
      ))}
      {hiddenCount > 0 && (
        <Tooltip
          title={items
            .slice(MAX_VISIBLE)
            .map((i) => `${i.groupLabel}: ${i.label}`)
            .join('\n')}
          placement="top"
          arrow
        >
          <Chip
            label={`+${hiddenCount}`}
            size="small"
            variant="soft"
            color="primary"
            sx={{ fontSize: 11, cursor: 'default' }}
          />
        </Tooltip>
      )}
    </Box>
  );
}

AppliesToCell.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({ label: PropTypes.string, groupLabel: PropTypes.string })
  ),
};

// ----------------------------------------------------------------------

function ComplianTableRow({
  row,
  serialNumber,
  jobTitlesMap,
  departmentsMap,
  onViewRow,
  onEditRow,
  onAssignRow,
}) {
  const appliesToItems = getRequirementAppliesToItems(row, jobTitlesMap, departmentsMap);
  const hasAppliesTo = hasRequirementDepartmentOrJobTitles(row, jobTitlesMap, departmentsMap);
  const canAssignStaff = Boolean(onAssignRow && !hasAppliesTo);

  return (
    <TableRow hover onClick={onViewRow} sx={{ cursor: onViewRow ? 'pointer' : undefined }}>
      <TableCell sx={{ color: 'text.secondary', typography: 'body2' }}>
        {serialNumber}
      </TableCell>

      <TableCell>
        <Typography variant="body2" fontWeight={600}>
          {row.name || '—'}
        </Typography>
      </TableCell>

      <TableCell sx={{ textTransform: 'capitalize', color: 'text.secondary' }}>
        {row.type || '—'}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.renewalMonths == null ? '—' : `${row.renewalMonths} month${row.renewalMonths === 1 ? '' : 's'}`}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.firstCompletionDays == null ? '—' : `${row.firstCompletionDays} day${row.firstCompletionDays === 1 ? '' : 's'}`}
      </TableCell>

      <TableCell align="center">
        {typeof row.evidenceRequired === 'boolean' ? (
          <Label
            variant="soft"
            color={row.evidenceRequired ? 'success' : 'default'}
          >
            {row.evidenceRequired ? 'Yes' : 'No'}
          </Label>
        ) : (
          '—'
        )}
      </TableCell>

      <TableCell>
        <AppliesToCell items={appliesToItems} />
      </TableCell>

      {(onViewRow || onEditRow || onAssignRow) && (
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          {onViewRow && (
            <Tooltip title="View requirement" placement="top" arrow>
              <IconButton
                color="default"
                aria-label={`View ${row.name || 'requirement'}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onViewRow();
                }}
              >
                <Iconify icon="solar:eye-bold" />
              </IconButton>
            </Tooltip>
          )}

          {canAssignStaff && (
            <Tooltip title="Assign staff" placement="top" arrow>
              <IconButton
                color="primary"
                onClick={(event) => {
                  event.stopPropagation();
                  onAssignRow();
                }}
                sx={{ mr: 0.5 }}
              >
                <Iconify icon="solar:user-plus-bold" />
              </IconButton>
            </Tooltip>
          )}

          {onEditRow && (
            <Tooltip title="Edit requirement" placement="top" arrow>
              <IconButton
                color="default"
                onClick={(event) => {
                  event.stopPropagation();
                  onEditRow();
                }}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
          )}

          {!canAssignStaff && !onEditRow && '—'}
        </TableCell>
      )}
    </TableRow>
  );
}

ComplianTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
  jobTitlesMap: PropTypes.object,
  departmentsMap: PropTypes.object,
  onViewRow: PropTypes.func,
  onEditRow: PropTypes.func,
  onAssignRow: PropTypes.func,
};

export default ComplianTableRow;
