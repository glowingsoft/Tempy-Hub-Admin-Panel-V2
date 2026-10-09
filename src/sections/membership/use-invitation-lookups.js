import { useMemo, useCallback } from 'react';

import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetJobTitlesQuery } from 'src/store/Reducer/job-titles-api';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';

// ----------------------------------------------------------------------

/**
 * Resolves the display branch name from a row/invitation object and a lookup map.
 */
export function resolveBranchName(row, branchesMap = {}) {
  if (row?.branch && typeof row.branch === 'object' && row.branch.name) {
    return row.branch.name;
  }
  const branchId = typeof row?.branch === 'string' ? row.branch : (row?.branch?._id || row?.branchId);
  if (branchId && branchesMap[branchId]?.name) {
    return branchesMap[branchId].name;
  }
  return '—';
}

/**
 * Resolves the display job title name from a row/invitation object and a lookup map.
 */
export function resolveJobTitleName(row, jobTitlesMap = {}) {
  if (row?.jobTitle && typeof row.jobTitle === 'object' && row.jobTitle.name) {
    return row.jobTitle.name;
  }
  const jobTitleId = typeof row?.jobTitle === 'string' ? row.jobTitle : (row?.jobTitle?._id || row?.jobTitleId);
  if (jobTitleId && jobTitlesMap[jobTitleId]?.name) {
    return jobTitlesMap[jobTitleId].name;
  }
  return '—';
}

/**
 * Resolves comma-separated department names from a row/invitation object and a lookup map.
 */
export function resolveDepartmentNames(row, departmentsMap = {}) {
  if (
    Array.isArray(row?.departments) &&
    row.departments.length > 0 &&
    typeof row.departments[0] === 'object' &&
    row.departments[0]?.name
  ) {
    return row.departments.map((d) => d.name).filter(Boolean).join(', ') || '—';
  }

  const rawIds = [
    ...(Array.isArray(row?.departmentIds) ? row.departmentIds : []),
    ...(Array.isArray(row?.departments)
      ? row.departments.map((d) => (typeof d === 'string' ? d : d?._id))
      : []),
  ].filter(Boolean);

  const uniqueIds = [...new Set(rawIds)];
  const names = uniqueIds
    .map((id) => departmentsMap[id]?.name)
    .filter(Boolean);

  return names.length > 0 ? names.join(', ') : '—';
}

// ----------------------------------------------------------------------

export function useInvitationLookups(organizationId) {
  const { data: branchesData } = useGetBranchesQuery(
    { organizationId, limit: 1000 },
    { skip: !organizationId }
  );

  const { data: jobTitlesData } = useGetJobTitlesQuery(
    { organizationId, limit: 1000 },
    { skip: !organizationId }
  );

  const { data: departmentsData } = useGetDepartmentsQuery(
    { organizationId, limit: 1000 },
    { skip: !organizationId }
  );

  const branchesMap = useMemo(() => {
    const list = organizationId ? branchesData?.data ?? [] : mockBranches;
    return Object.fromEntries(list.map((item) => [item._id, item]));
  }, [branchesData, organizationId]);

  const jobTitlesMap = useMemo(() => {
    const list = organizationId ? jobTitlesData?.data ?? [] : mockJobTitles;
    return Object.fromEntries(list.map((item) => [item._id, item]));
  }, [jobTitlesData, organizationId]);

  const departmentsMap = useMemo(() => {
    const list = organizationId ? departmentsData?.data ?? [] : mockDepartments;
    return Object.fromEntries(list.map((item) => [item._id, item]));
  }, [departmentsData, organizationId]);

  const getBranchName = useCallback(
    (row) => resolveBranchName(row, branchesMap),
    [branchesMap]
  );

  const getJobTitleName = useCallback(
    (row) => resolveJobTitleName(row, jobTitlesMap),
    [jobTitlesMap]
  );

  const getDepartmentNames = useCallback(
    (row) => resolveDepartmentNames(row, departmentsMap),
    [departmentsMap]
  );

  return {
    branchesMap,
    jobTitlesMap,
    departmentsMap,
    getBranchName,
    getJobTitleName,
    getDepartmentNames,
  };
}
