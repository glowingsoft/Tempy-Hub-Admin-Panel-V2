import { useMemo, useCallback } from 'react';

import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { useGetJobTitlesQuery } from 'src/store/Reducer/job-titles-api';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import { useGetMembersQuery } from 'src/store/Reducer/members-api';

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';

// ----------------------------------------------------------------------

/**
 * Resolves the display branch name from an item/row object and an optional lookup map.
 */
export function resolveBranchName(row, branchesMap = {}) {
  if (row?.branch && typeof row.branch === 'object' && row.branch.name) {
    return row.branch.name;
  }
  const branchId =
    typeof row?.branch === 'string' ? row.branch : row?.branch?._id || row?.branchId;
  if (branchId && branchesMap[branchId]?.name) {
    return branchesMap[branchId].name;
  }
  return row?.branchName || '—';
}

/**
 * Resolves the display job title name from an item/row object and an optional lookup map.
 */
export function resolveJobTitleName(row, jobTitlesMap = {}) {
  if (row?.jobTitle && typeof row.jobTitle === 'object' && row.jobTitle.name) {
    return row.jobTitle.name;
  }
  const jobTitleId =
    typeof row?.jobTitle === 'string' ? row.jobTitle : row?.jobTitle?._id || row?.jobTitleId;
  if (jobTitleId && jobTitlesMap[jobTitleId]?.name) {
    return jobTitlesMap[jobTitleId].name;
  }
  return row?.jobTitleName || '—';
}

/**
 * Resolves comma-separated department names from an item/row object and an optional lookup map.
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

/**
 * Resolves a row's role: its own `role`, else the role of the membership with the same userId.
 */
export function resolveMemberRole(row, membersMap = {}) {
  if (row?.role) return row.role;
  const userId = typeof row?.userId === 'object' ? row.userId?._id : row?.userId || row?.user?._id;
  return membersMap[userId]?.role;
}

// ----------------------------------------------------------------------

/**
 * Centralized hook to fetch and normalize organizational entities:
 * Branches / Sites, Job Titles, and Departments.
 *
 * Supports both:
 * 1. useOrganizationLookups(organizationId)
 * 2. useOrganizationLookups({ organizationId, branches, jobTitles, departments, limit })
 */
export function useOrganizationLookups(options) {
  const normalized =
    typeof options === 'string'
      ? { organizationId: options }
      : options || {};

  const organizationId = normalized.organizationId;
  const limit = normalized.limit || 1000;
  const shouldSkipBranches = !organizationId || normalized.branches === false;
  const shouldSkipJobTitles = !organizationId || normalized.jobTitles === false;
  const shouldSkipDepartments = !organizationId || normalized.departments === false;
  // Members are opt-in (`members: true`) so existing callers don't fetch them.
  const shouldSkipMembers = !organizationId || normalized.members !== true;

  const {
    data: branchesData,
    isLoading: isBranchesLoading,
    isFetching: isBranchesFetching,
  } = useGetBranchesQuery(
    { organizationId, limit },
    { skip: shouldSkipBranches }
  );

  const {
    data: jobTitlesData,
    isLoading: isJobTitlesLoading,
    isFetching: isJobTitlesFetching,
  } = useGetJobTitlesQuery(
    { organizationId, limit },
    { skip: shouldSkipJobTitles }
  );

  const {
    data: departmentsData,
    isLoading: isDepartmentsLoading,
    isFetching: isDepartmentsFetching,
  } = useGetDepartmentsQuery(
    { organizationId, limit },
    { skip: shouldSkipDepartments }
  );

  const { data: membersData, isLoading: isMembersLoading } = useGetMembersQuery(
    { organizationId, limit },
    { skip: shouldSkipMembers }
  );

  // Normalized Arrays
  const branches = useMemo(() => {
    if (organizationId) {
      return branchesData?.data ?? [];
    }
    return mockBranches;
  }, [branchesData, organizationId]);

  const jobTitles = useMemo(() => {
    if (organizationId) {
      return jobTitlesData?.data ?? [];
    }
    return mockJobTitles;
  }, [jobTitlesData, organizationId]);

  const departments = useMemo(() => {
    if (organizationId) {
      return departmentsData?.data ?? [];
    }
    return mockDepartments;
  }, [departmentsData, organizationId]);

  // Dropdown Options [{ value, label }]
  const branchOptions = useMemo(
    () => branches.map((item) => ({ value: item._id, label: item.name })),
    [branches]
  );

  const jobTitleOptions = useMemo(
    () => jobTitles.map((item) => ({ value: item._id, label: item.name })),
    [jobTitles]
  );

  const departmentOptions = useMemo(
    () => departments.map((item) => ({ value: item._id, label: item.name })),
    [departments]
  );

  // Lookup Maps
  const branchesMap = useMemo(() => {
    return Object.fromEntries(branches.map((item) => [item._id, item]));
  }, [branches]);

  const jobTitlesMap = useMemo(() => {
    return Object.fromEntries(jobTitles.map((item) => [item._id, item]));
  }, [jobTitles]);

  const departmentsMap = useMemo(() => {
    return Object.fromEntries(departments.map((item) => [item._id, item]));
  }, [departments]);

  // Keyed by userId (the members slice normalizes it) so other resources can join on it.
  const membersMap = useMemo(() => {
    return Object.fromEntries((membersData?.data ?? []).map((item) => [item.userId, item]));
  }, [membersData]);

  // Bound Resolvers
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
    branches,
    jobTitles,
    departments,
    branchOptions,
    jobTitleOptions,
    departmentOptions,
    branchesMap,
    jobTitlesMap,
    departmentsMap,
    membersMap,
    getBranchName,
    getJobTitleName,
    getDepartmentNames,
    resolveBranchName,
    resolveJobTitleName,
    resolveDepartmentNames,
    isBranchesLoading,
    isBranchesFetching,
    isJobTitlesLoading,
    isJobTitlesFetching,
    isDepartmentsLoading,
    isDepartmentsFetching,
    isMembersLoading,
    isLoading: isBranchesLoading || isJobTitlesLoading || isDepartmentsLoading || isMembersLoading,
  };
}