import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

const listTag = (organizationId) => ({ type: 'ExternalPerson', id: `LIST-${organizationId}` });

export const generalDirectoryApi = createApi({
  reducerPath: 'generalDirectoryApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['ExternalPerson'],

  endpoints: (builder) => ({
    getExternalPeople: builder.query({
      query: ({ organizationId, page = 1, limit = 10, branchId, departmentId, type, keyword, siteStatus }) => {
        const params = { page, limit };
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        if (trimmedKeyword) {
          params.keyword = trimmedKeyword;
        }

        if (branchId) {
          params.branchId = branchId;
        }

        if (departmentId) {
          params.departmentId = departmentId;
        }

        if (type) {
          params.type = type;
        }

        if (siteStatus) {
          params.siteStatus = siteStatus;
        }

        return {
          url: API_ROUTES.ORGANIZATION_EXTERNAL_PEOPLE(organizationId),
          method: 'GET',
          params,
        };
      },
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
  }),
});

export const {
  useGetExternalPeopleQuery,
  useGetExternalPersonQuery,
  useCreateExternalPersonMutation,
  useUpdateExternalPersonMutation,
} = generalDirectoryApi;