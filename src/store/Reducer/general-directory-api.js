import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

const listTag = (organizationId) => ({ type: 'ExternalPerson', id: `LIST-${organizationId}` });

const directoryListParams = ({
  page,
  limit,
  branchId,
  departmentId,
  type,
  keyword,
  siteStatus,
  format,
} = {}) => {
  const params = {};
  const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

  if (page != null) params.page = page;
  if (limit != null) params.limit = limit;
  if (trimmedKeyword) params.keyword = trimmedKeyword;
  if (branchId) params.branchId = branchId;
  if (departmentId) params.departmentId = departmentId;
  if (type) params.type = type;
  if (siteStatus) params.siteStatus = siteStatus;
  if (format) params.format = format;

  return params;
};

const parseFilename = (disposition, fallback) => {
  const match = (disposition || '').match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  if (!match?.[1]) return fallback;
  return decodeURIComponent(match[1].replace(/"/g, '').trim());
};

const csvResponseHandler = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return { message: 'Unable to export directory' };
    }
  }

  return {
    blob: await response.blob(),
    filename: parseFilename(response.headers.get('content-disposition'), 'directory.csv'),
  };
};

export const generalDirectoryApi = createApi({
  reducerPath: 'generalDirectoryApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['ExternalPerson'],

  endpoints: (builder) => ({
    getExternalPeople: builder.query({
      query: ({ organizationId, page = 1, limit = 10, branchId, departmentId, type, keyword, siteStatus }) => ({
        url: API_ROUTES.ORGANIZATION_EXTERNAL_PEOPLE(organizationId),
        method: 'GET',
        params: directoryListParams({
          page,
          limit,
          branchId,
          departmentId,
          type,
          keyword,
          siteStatus,
        }),
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
            ...result.data.map(({ _id }) => ({ type: 'ExternalPerson', id: _id })),
            listTag(organizationId),
          ]
          : [listTag(organizationId)],
    }),

    exportExternalPeopleCsv: builder.mutation({
      query: ({ organizationId, branchId, departmentId, type, keyword, siteStatus }) => ({
        url: API_ROUTES.ORGANIZATION_EXTERNAL_PEOPLE(organizationId),
        method: 'GET',
        params: directoryListParams({
          branchId,
          departmentId,
          type,
          keyword,
          siteStatus,
          format: 'csv',
        }),
        responseHandler: csvResponseHandler,
      }),
    }),

    getExternalPerson: builder.query({
      query: (arg) => {
        const externalPersonId = typeof arg === 'string' ? arg : arg?.externalPersonId || arg?.id;
        const organizationId = typeof arg === 'object' ? arg?.organizationId : undefined;

        return {
          url: API_ROUTES.EXTERNAL_PERSON_BY_ID(externalPersonId),
          method: 'GET',
          params: organizationId ? { organizationId } : undefined,
          headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        };
      },
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, arg) => {
        const externalPersonId = typeof arg === 'string' ? arg : arg?.externalPersonId || arg?.id;
        return [{ type: 'ExternalPerson', id: externalPersonId }];
      },
    }),

    createExternalPerson: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_EXTERNAL_PEOPLE(organizationId),
        method: 'POST',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    updateExternalPerson: builder.mutation({
      query: ({ externalPersonId, organizationId, ...body }) => ({
        url: API_ROUTES.EXTERNAL_PERSON_BY_ID(externalPersonId),
        method: 'PATCH',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { externalPersonId, organizationId }) => [
        { type: 'ExternalPerson', id: externalPersonId },
        ...(organizationId ? [listTag(organizationId)] : []),
      ],
    }),

    updateUserAccountStatus: builder.mutation({
      query: ({ organizationId, userId, status, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_USER_ACCOUNT(organizationId, userId),
        method: 'PATCH',
        headers: organizationId ? { 'x-org-id': organizationId } : undefined,
        body: { status, ...body },
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId, userId }) => [
        listTag(organizationId),
        ...(userId ? [{ type: 'ExternalPerson', id: userId }] : []),
      ],
    }),
  }),
});

export const {
  useGetExternalPeopleQuery,
  useExportExternalPeopleCsvMutation,
  useGetExternalPersonQuery,
  useCreateExternalPersonMutation,
  useUpdateExternalPersonMutation,
  useUpdateUserAccountStatusMutation,
} = generalDirectoryApi;