import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const organizationsApi = createApi({
  reducerPath: 'organizationsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['OrganizationModuleAccess'],

  endpoints: (builder) => ({
    getOrganizationModuleAccess: builder.query({
      query: (organizationId) => ({
        url: API_ROUTES.ORGANIZATION_MODULE_ACCESS(organizationId),
        method: 'GET',
      }),
      // The list of modules can come back as `data`, `data.moduleAccess`, or a
      // bare array depending on the endpoint — normalise to an array here.
      transformResponse: (res) => {
        const payload = res?.data ?? res;
        if (Array.isArray(payload)) return payload;
        return payload?.moduleAccess ?? [];
      },
      providesTags: (result, error, organizationId) => [
        { type: 'OrganizationModuleAccess', id: organizationId },
      ],
    }),

    // NOTE: the update mutation is intentionally NOT implemented yet.
    // updateOrganizationModuleAccess: builder.mutation({
    //   query: ({ organizationId, moduleAccess }) => ({
    //     url: API_ROUTES.ORGANIZATION_MODULE_ACCESS(organizationId),
    //     method: 'PUT',
    //     body: { moduleAccess },
    //   }),
    //   invalidatesTags: (result, error, { organizationId }) => [
    //     { type: 'OrganizationModuleAccess', id: organizationId },
    //   ],
    // }),
  }),
});

export const { useGetOrganizationModuleAccessQuery } = organizationsApi;
