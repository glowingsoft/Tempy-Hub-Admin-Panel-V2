import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Family gazettes
//
// GET    /admin/organizations/:organizationId/family-gazettes
// GET    /admin/organizations/:organizationId/family-gazettes/:gazetteItemId
// GET    /admin/organizations/:organizationId/family-gazettes/:gazetteItemId/pdf
// GET    /admin/organizations/:organizationId/family-gazettes/download
// POST   /admin/organizations/:organizationId/family-gazettes  { branchId }
// PUT    /admin/family/gazettes/:gazetteItemId  { action: "regenerate" }
// PUT    /admin/family/gazette-issues  { action: "printed", branchId }
// ----------------------------------------------------------------------

const listTag = (organizationId) => ({ type: 'FamilyGazette', id: `LIST-${organizationId}` });

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

const parseFilename = (disposition, fallback) => {
  const match = (disposition || '').match(/filename\*?=(?:UTF-8''|"?)([^";]+)/i);
  if (!match?.[1]) return fallback;
  return decodeURIComponent(match[1].replace(/"/g, '').trim());
};

const blobResponseHandler = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok || contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return { message: 'Unable to download file' };
    }
  }

  const blob = await response.blob();
  return {
    blob,
    filename: parseFilename(response.headers.get('content-disposition'), 'gazette.pdf'),
  };
};

export const familyGazettesApi = createApi({
  reducerPath: 'familyGazettesApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['FamilyGazette'],
  endpoints: (builder) => ({
    getFamilyGazettes: builder.query({
      query: ({ organizationId, page = 1, limit = 10, status, branchId, keyword } = {}) => {
        const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

        return {
          url: API_ROUTES.ORGANIZATION_FAMILY_GAZETTES(organizationId),
          method: 'GET',
          headers: orgHeaders(organizationId),
          params: {
            page,
            limit,
            ...(status && status !== 'all' ? { status } : {}),
            ...(branchId ? { branchId } : {}),
            ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
          },
        };
      },
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId }) =>
        result?.data
          ? [
              ...result.data
                .filter((item) => item?.itemId)
                .map(({ itemId }) => ({ type: 'FamilyGazette', id: itemId })),
              listTag(organizationId),
            ]
          : [listTag(organizationId)],
    }),

    getFamilyGazette: builder.query({
      query: ({ organizationId, gazetteItemId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_GAZETTE_BY_ID(organizationId, gazetteItemId),
        method: 'GET',
        headers: orgHeaders(organizationId),
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { gazetteItemId }) => [{ type: 'FamilyGazette', id: gazetteItemId }],
    }),

    getFamilyGazettePdf: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, gazetteItemId, download = false, format } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_GAZETTE_PDF(organizationId, gazetteItemId),
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: {
          download,
          ...(format ? { format } : {}),
        },
        responseHandler: format === 'url' ? undefined : blobResponseHandler,
      }),
      transformResponse: (res) => {
        if (res?.blob instanceof Blob) return res;
        return res?.data ?? res;
      },
      keepUnusedDataFor: 0,
    }),

    downloadAllFamilyGazettes: builder.mutation({
      extraOptions: { disableToast: true },
      query: ({ organizationId, branchId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_GAZETTES_DOWNLOAD(organizationId),
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: {
          ...(branchId ? { branchId } : {}),
        },
        responseHandler: blobResponseHandler,
      }),
    }),

    createFamilyGazette: builder.mutation({
      query: ({ organizationId, branchId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_FAMILY_GAZETTES(organizationId),
        method: 'POST',
        headers: orgHeaders(organizationId),
        body: { branchId },
      }),
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    markFamilyGazettesPrinted: builder.mutation({
      query: ({ organizationId, branchId } = {}) => ({
        url: API_ROUTES.FAMILY_GAZETTE_ISSUES,
        method: 'PUT',
        headers: orgHeaders(organizationId),
        body: {
          action: 'printed',
          branchId,
        },
      }),
      invalidatesTags: (result, error, { organizationId }) => [listTag(organizationId)],
    }),

    regenerateFamilyGazette: builder.mutation({
      query: ({ organizationId, gazetteItemId } = {}) => ({
        url: API_ROUTES.FAMILY_GAZETTE_BY_ID(gazetteItemId),
        method: 'PUT',
        headers: orgHeaders(organizationId),
        body: { action: 'regenerate' },
      }),
      invalidatesTags: (result, error, { organizationId, gazetteItemId }) => [
        { type: 'FamilyGazette', id: gazetteItemId },
        listTag(organizationId),
      ],
    }),
  }),
});

export const {
  useGetFamilyGazettesQuery,
  useGetFamilyGazetteQuery,
  useLazyGetFamilyGazettePdfQuery,
  useDownloadAllFamilyGazettesMutation,
  useCreateFamilyGazetteMutation,
  useMarkFamilyGazettesPrintedMutation,
  useRegenerateFamilyGazetteMutation,
} = familyGazettesApi;
