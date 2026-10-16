import { createApi } from "@reduxjs/toolkit/query/react";
import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from "../baseQuery";

// ----------------------------------------------------------------------
// Auth API
//
// POST /auth/login
//   request:
//   {
//     "email": "superadmin@tempyhub.com",
//     "password": "...",
//     "deviceId": "123",
//     "deviceType": "desktop",
//     "timezone": "Asia/Karachi"
//   }
//   response:
//   {
//     "message": "Login success",
//     "data": {
//       "basicInfo": { ... },
//       "accountState": { ... },
//       "token": "JWT_TOKEN",
//       "access": { ... }
//     }
//   }
// ----------------------------------------------------------------------

const ADMIN_ACCESS_TOKEN =
  import.meta.env.VITE_ADMIN_ACCESS_TOKEN;

export const authApi = createApi({
  reducerPath: "auth",
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['profile'],
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (loginData) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: "POST",
        body: loginData,
      }),
      transformResponse: (res) => res?.data ?? res,
    }),

    adminLogin: builder.mutation({
      query: (loginData) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: "POST",
        body: loginData,
        ...(ADMIN_ACCESS_TOKEN ? { headers: { 'x-admin-access-token': ADMIN_ACCESS_TOKEN } } : {}),
      }),
      transformResponse: (res) => res?.data ?? res,
    }),

    // Get invitation details by inviteToken (GET /auth/invitations/:token)
    getInvitationByToken: builder.query({
      query: (token) => ({
        url: API_ROUTES.AUTH.INVITATION_BY_TOKEN(token),
        method: "GET",
      }),
      transformResponse: (res) => res?.data ?? res,
      providesTags: (result, error, token) => [{ type: 'Invitation', id: token }],
    }),

    // Accept invitation and set password (POST /auth/invitations/:token/accept)
    acceptInvitation: builder.mutation({
      query: ({ token, ...body }) => ({
        url: API_ROUTES.AUTH.ACCEPT_INVITATION(token),
        method: "POST",
        body,
      }),
      transformResponse: (res) => res?.data ?? res,
    }),

    resendOtpEmail: builder.mutation({
      query: ({ email }) => ({
        url: API_ROUTES.AUTH.RESEND_OTP_EMAIL,
        method: "POST",
        body: { email },
      }),
      transformResponse: (res) => res?.data ?? res,
    }),

    verifyOtpEmail: builder.mutation({
      query: ({ email, otp }) => ({
        url: API_ROUTES.AUTH.VERIFY_OTP_EMAIL,
        method: "POST",
        body: { email, otp },
      }),
      transformResponse: (res) => res?.data ?? res,
    }),

    resetPassword: builder.mutation({
      query: ({ email, newPassword, resetToken }) => ({
        url: API_ROUTES.AUTH.RESET_PASSWORD,
        method: "POST",
        body: { email, newPassword, resetToken },
      }),
      transformResponse: (res) => res?.data ?? res,
    }),
  }),
});

export const {
  useLoginMutation,
  useAdminLoginMutation,
  useGetInvitationByTokenQuery,
  useAcceptInvitationMutation,
  useResendOtpEmailMutation,
  useVerifyOtpEmailMutation,
  useResetPasswordMutation,
} = authApi;
