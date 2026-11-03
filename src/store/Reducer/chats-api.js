import { createApi } from '@reduxjs/toolkit/query/react';

import { API_ROUTES } from '../apiRoutes';
import { createCustomFetchBaseQuery } from '../baseQuery';

// ----------------------------------------------------------------------
// One-way staff → family messages
//
// GET  /chats/contacts
// GET  /chats/contacts/:conversationId
// GET  /chats/recipients
// POST /chats/message
// GET  /chats/sent
// GET  /chats/sent/:broadcastId
// ----------------------------------------------------------------------

const orgHeaders = (organizationId) =>
  organizationId ? { 'x-org-id': organizationId } : undefined;

const listParams = ({ page = 1, limit = 20, branchId, keyword } = {}) => {
  const trimmedKeyword = typeof keyword === 'string' ? keyword.trim() : '';

  return {
    page,
    limit,
    ...(branchId ? { branchId } : {}),
    ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
  };
};

const contactsListTag = (organizationId) => ({
  type: 'ChatContact',
  id: `LIST-${organizationId || 'CURRENT'}`,
});

const sentListTag = (organizationId) => ({
  type: 'ChatSent',
  id: `LIST-${organizationId || 'CURRENT'}`,
});

export const chatsApi = createApi({
  reducerPath: 'chatsApi',
  baseQuery: createCustomFetchBaseQuery(),
  tagTypes: ['ChatContact', 'ChatConversation', 'ChatRecipient', 'ChatSent'],
  endpoints: (builder) => ({
    getChatContacts: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, page = 1, limit = 20, branchId, keyword } = {}) => ({
        url: API_ROUTES.CHATS_CONTACTS,
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: listParams({ page, limit, branchId, keyword }),
      }),
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId } = {}) =>
        result?.data
          ? [
              ...result.data
                .filter((item) => item?.conversationId)
                .map(({ conversationId }) => ({ type: 'ChatContact', id: conversationId })),
              contactsListTag(organizationId),
            ]
          : [contactsListTag(organizationId)],
    }),

    getChatRecipients: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, page = 1, limit = 20, branchId, keyword } = {}) => ({
        url: API_ROUTES.CHATS_RECIPIENTS,
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: listParams({ page, limit, branchId, keyword }),
      }),
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId } = {}) => [
        { type: 'ChatRecipient', id: `LIST-${organizationId || 'CURRENT'}` },
      ],
    }),

    getChatMessages: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, conversationId, page = 1, limit = 20 } = {}) => ({
        url: API_ROUTES.CHATS_CONTACT_MESSAGES(conversationId),
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: { page, limit },
      }),
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { conversationId } = {}) => [
        { type: 'ChatConversation', id: conversationId },
      ],
    }),

    sendChatMessage: builder.mutation({
      extraOptions: { disableToast: true },
      query: ({ organizationId, conversationId, audience, residentIds, message, branchId } = {}) => ({
        url: API_ROUTES.CHATS_MESSAGE,
        method: 'POST',
        headers: orgHeaders(organizationId),
        body: conversationId
          ? { conversationId, message }
          : {
              audience,
              message,
              ...(branchId ? { branchId } : {}),
              ...(audience === 'selected' ? { residentIds: residentIds || [] } : {}),
            },
      }),
      transformResponse: (res) => res?.data ?? res,
      invalidatesTags: (result, error, { organizationId, conversationId } = {}) => [
        contactsListTag(organizationId),
        sentListTag(organizationId),
        ...(conversationId || result?.conversationId
          ? [{ type: 'ChatConversation', id: conversationId || result.conversationId }]
          : []),
      ],
    }),

    getChatSent: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, page = 1, limit = 20, branchId, keyword } = {}) => ({
        url: API_ROUTES.CHATS_SENT,
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: listParams({ page, limit, branchId, keyword }),
      }),
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { organizationId } = {}) =>
        result?.data
          ? [
              ...result.data
                .filter((item) => item?.broadcastId)
                .map(({ broadcastId }) => ({ type: 'ChatSent', id: broadcastId })),
              sentListTag(organizationId),
            ]
          : [sentListTag(organizationId)],
    }),

    getChatSentBroadcast: builder.query({
      extraOptions: { disableToast: true },
      query: ({ organizationId, broadcastId, page = 1, limit = 20 } = {}) => ({
        url: API_ROUTES.CHATS_SENT_BY_ID(broadcastId),
        method: 'GET',
        headers: orgHeaders(organizationId),
        params: { page, limit },
      }),
      transformResponse: (res) => ({
        data: Array.isArray(res?.data) ? res.data : [],
        meta: res?.meta ?? {},
      }),
      providesTags: (result, error, { broadcastId } = {}) => [
        { type: 'ChatSent', id: broadcastId },
      ],
    }),
  }),
});

export const {
  useGetChatContactsQuery,
  useGetChatRecipientsQuery,
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
  useGetChatSentQuery,
  useGetChatSentBroadcastQuery,
} = chatsApi;
