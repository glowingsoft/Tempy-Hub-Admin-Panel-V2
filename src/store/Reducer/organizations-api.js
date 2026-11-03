import { createApi } from '@reduxjs/toolkit/query/react';
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

export const organizationsApi = createApi({
  reducerPath: 'organizationsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['Organization', 'OrganizationModuleAccess', 'StaffDashboardSettings', 'ModuleDefinition'],

  endpoints: (builder) => ({
    // Fetch paginated list of organizations with optional filters (page, limit, keyword, status)
    getOrganizations: builder.query({
      query: (params) => ({
        url: API_ROUTES.ORGANIZATIONS,
        method: 'GET',
        params,
      }),
      providesTags: ['Organization'],
    }),

    // Create a new organization with owner details and initial settings
    createOrganization: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.ORGANIZATIONS,
        method: 'POST',
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: ['Organization'],
    }),

    // Fetch single organization details by its organizationId
    getOrganizationById: builder.query({
      query: (organizationId) => ({
        url: API_ROUTES.ORGANIZATION_BY_ID(organizationId),
        method: 'GET',
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, organizationId) => [
        { type: 'Organization', id: organizationId },
      ],
    }),

    // Update organization details (e.g. name, emergency notification settings) by organizationId
    updateOrganization: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_BY_ID(organizationId),
        method: 'PATCH',
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'Organization', id: organizationId },
        'Organization',
      ],
    }),

    // Fetch enabled module access for a specific organization
    getOrganizationModuleAccess: builder.query({
      query: (organizationId) => ({
        url: API_ROUTES.ORGANIZATION_MODULE_ACCESS(organizationId),
        method: 'GET',
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, organizationId) => [
        { type: 'OrganizationModuleAccess', id: organizationId },
      ],
    }),

    // Update module access for a specific organization
    updateOrganizationModuleAccess: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_MODULE_ACCESS(organizationId),
        method: 'PUT',
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'OrganizationModuleAccess', id: organizationId },
        { type: 'Organization', id: organizationId },
      ],
    }),

    // Fetch paginated list of all system-wide module definitions / platform module catalog
    getModuleDefinitions: builder.query({
      query: (params) => ({
        url: API_ROUTES.MODULE_DEFINITIONS,
        method: 'GET',
        params,
      }),
      transformResponse: (res) => ({
        data: res?.data ?? [],
        meta: res?.meta ?? {},
      }),
      providesTags: ['ModuleDefinition'],
    }),

    // Fetch staff dashboard settings for a specific organization
    getStaffDashboardSettings: builder.query({
      query: (organizationId) => ({
        url: API_ROUTES.ORGANIZATION_STAFF_DASHBOARD_SETTINGS(organizationId),
        method: 'GET',
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, organizationId) => [
        { type: 'StaffDashboardSettings', id: organizationId },
      ],
    }),

    // Update staff dashboard settings for a specific organization
    updateStaffDashboardSettings: builder.mutation({
      query: ({ organizationId, ...body }) => ({
        url: API_ROUTES.ORGANIZATION_STAFF_DASHBOARD_SETTINGS(organizationId),
        method: 'PUT',
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId }) => [
        { type: 'StaffDashboardSettings', id: organizationId },
      ],
    }),
  }),
});

export const {
  useGetOrganizationsQuery,
  useGetOrganizationByIdQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useGetOrganizationModuleAccessQuery,
  useUpdateOrganizationModuleAccessMutation,
  useGetModuleDefinitionsQuery,
  useGetStaffDashboardSettingsQuery,
  useUpdateStaffDashboardSettingsMutation,
} = organizationsApi;
