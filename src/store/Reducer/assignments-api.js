import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------

export const assignmentsApi = createApi({
  reducerPath: 'assignmentsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Assignments', 'Assignment', 'CompetencyMatrix', 'TrainingRecords'],

  endpoints: (builder) => ({
    // GET /app/training?page&limit&search&status -> { data: TrainingAssignment[], meta: { statusCounts, compliance } }
    getAppStaffTrainingRecords: builder.query({
      query: ({ organizationId, page = 1, limit = 10, search, status } = {}) => ({
        url: API_ROUTES.APP_TRAINING,
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status && status !== 'all' ? { status } : {}),
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['TrainingRecords'],
    }),

    // GET /app/competencies?page&limit&search&status -> { data: { items, compliance } }
    getAppStaffCompetencies: builder.query({
      query: ({ organizationId, page = 1, limit = 10, search, status } = {}) => ({
        url: API_ROUTES.APP_COMPETENCIES,
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status && status !== 'all' ? { status } : {}),
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['CompetencyMatrix'],
    }),

    // POST /admin/organizations/:organizationId/assignments
    createAssignment: builder.mutation({
      query: ({ organizationId, data }) => ({
        url: API_ROUTES.ORGANIZATION_ASSIGNMENTS(organizationId),
        method: 'POST',
        body: data,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: ['Assignments', 'CompetencyMatrix', 'TrainingRecords'],
    }),

    // GET /admin/assignments/:assignmentId
    getAssignment: builder.query({
      query: ({ assignmentId, organizationId }) => ({
        url: API_ROUTES.ASSIGNMENT_BY_ID(assignmentId),
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { assignmentId }) => [
        { type: 'Assignment', id: assignmentId },
      ],
    }),

    // PATCH /admin/assignments/:assignmentId
    updateAssignment: builder.mutation({
      query: ({ assignmentId, organizationId, data }) => ({
        url: API_ROUTES.ASSIGNMENT_BY_ID(assignmentId),
        method: 'PATCH',
        body: data,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'Assignment', id: assignmentId },
        'Assignments',
        'CompetencyMatrix',
        'TrainingRecords',
      ],
    }),

    // POST /admin/assignments/:assignmentId/records
    createAssignmentRecord: builder.mutation({
      query: ({ assignmentId, organizationId, data }) => ({
        url: API_ROUTES.ASSIGNMENT_RECORDS(assignmentId),
        method: 'POST',
        body: data,
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      invalidatesTags: (result, error, { assignmentId }) => [
        { type: 'Assignment', id: assignmentId },
        'Assignments',
        'CompetencyMatrix',
        'TrainingRecords',
      ],
    }),

    // GET /admin/organizations/:organizationId/training-records?keyword=&status=&page=1&limit=10
    getTrainingRecords: builder.query({
      query: ({ organizationId, keyword, status, page = 1, limit = 10, ...params } = {}) => ({
        url: API_ROUTES.ORGANIZATION_TRAINING_RECORDS(organizationId),
        params: {
          ...(keyword ? { keyword } : {}),
          ...(status && status !== 'all' ? { status } : {}),
          page,
          limit,
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['TrainingRecords'],
    }),

    // GET /admin/organizations/:organizationId/competency-matrix
    getCompetencyMatrix: builder.query({
      query: ({ organizationId, keyword, branchId, departmentId, jobTitleId, page, limit, ...params } = {}) => ({
        url: API_ROUTES.COMPETENCY_MATRIX(organizationId),
        params: {
          ...(keyword ? { keyword } : {}),
          ...(branchId && branchId !== 'all' ? { branchId } : {}),
          ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
          ...(jobTitleId && jobTitleId !== 'all' ? { jobTitleId } : {}),
          ...(page ? { page } : {}),
          ...(limit ? { limit } : {}),
          ...params,
        },
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
      }),
      providesTags: ['CompetencyMatrix'],
    }),
  }),
});

export const {
  useGetAppStaffTrainingRecordsQuery,
  useGetAppStaffCompetenciesQuery,
  useCreateAssignmentMutation,
  useGetAssignmentQuery,
  useLazyGetAssignmentQuery,
  useUpdateAssignmentMutation,
  useCreateAssignmentRecordMutation,
  useGetTrainingRecordsQuery,
  useLazyGetTrainingRecordsQuery,
  useGetCompetencyMatrixQuery,
  useLazyGetCompetencyMatrixQuery,
} = assignmentsApi;