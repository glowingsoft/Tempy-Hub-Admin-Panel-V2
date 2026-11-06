import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// Visitor survey configuration (owner PUT; SM/LM GET)
//
// GET/PUT /admin/organizations/:organizationId/visitor-survey-settings
// GET/PUT /admin/organizations/:organizationId/visitor-survey-questions
// POST /admin/organizations/:organizationId/visitor-survey-responses
//   request: {
//     "branchId": "string", "hostStaffId": "string", "visitorName": "string",
//     "stayDuration": "string", "answers": [{ "questionId": "string", "value": "string" }]
//   }
// ----------------------------------------------------------------------

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

const settingsTag = (organizationId) => ({
  type: 'VisitorSurveySettings',
  id: organizationId || 'LIST',
});

const questionsTag = (organizationId) => ({
  type: 'VisitorSurveyQuestions',
  id: organizationId || 'LIST',
});

export const visitorSurveyApi = createApi({
  reducerPath: 'visitorSurveyApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['VisitorSurveySettings', 'VisitorSurveyQuestions', 'VisitorFeedback'],
  endpoints: (builder) => ({
    getVisitorSurveySettings: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId } = {}) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_SURVEY_SETTINGS(organizationId),
        method: 'GET',
        headers: orgHeaders(organizationId),
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { organizationId } = {}) => [settingsTag(organizationId)],
    }),

    updateVisitorSurveySettings: builder.mutation({
      extraOptions: { disableToast: true },
      query: ({ organizationId, ...body } = {}) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_SURVEY_SETTINGS(organizationId),
        method: 'PUT',
        headers: orgHeaders(organizationId),
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId } = {}) => [settingsTag(organizationId)],
    }),

    getVisitorSurveyQuestions: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, includeInactive = true } = {}) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_SURVEY_QUESTIONS(organizationId),
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: includeInactive ? { includeInactive: true } : undefined,
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, { organizationId } = {}) => [questionsTag(organizationId)],
    }),

    updateVisitorSurveyQuestions: builder.mutation({
      extraOptions: { disableToast: true },
      query: ({ organizationId, questions } = {}) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_SURVEY_QUESTIONS(organizationId),
        method: 'PUT',
        headers: orgHeaders(organizationId),
        body: { questions },
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId } = {}) => [questionsTag(organizationId)],
    }),

    submitVisitorFeedback: builder.mutation({
      extraOptions: { disableToast: true },
      query: ({ organizationId, branchId, ...body } = {}) => ({
        url: API_ROUTES.ORGANIZATION_VISITOR_SURVEY_RESPONSES(organizationId),
        method: 'POST',
        headers: {
          ...orgHeaders(organizationId),
          ...(branchId ? { 'x-branch-id': branchId } : {}),
        },
        params: {
          ...(branchId ? { branchId } : {}),
        },
        body: {
          ...(branchId ? { branchId } : {}),
          ...body,
        },
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId } = {}) => [
        { type: 'VisitorFeedback', id: organizationId || 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetVisitorSurveySettingsQuery,
  useUpdateVisitorSurveySettingsMutation,
  useGetVisitorSurveyQuestionsQuery,
  useUpdateVisitorSurveyQuestionsMutation,
  useSubmitVisitorFeedbackMutation,
} = visitorSurveyApi;
