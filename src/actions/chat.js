import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import { keyBy } from 'src/utils/helper';
import axios, { fetcher, endpoints } from 'src/utils/axios';
import { mockChatContacts, mockChatConversations } from 'src/sections/chat/mocks/data';

// ----------------------------------------------------------------------

const enableServer = false;

const CHART_ENDPOINT = endpoints.chat;

const MOCK_CONVERSATIONS_KEY = 'chat:mock:conversations';

const getConversationKey = (conversationId) =>
  enableServer
    ? [CHART_ENDPOINT, { params: { conversationId, endpoint: 'conversation' } }]
    : ['chat:mock:conversation', conversationId];

const getConversationsKey = () =>
  enableServer
    ? [CHART_ENDPOINT, { params: { endpoint: 'conversations' } }]
    : MOCK_CONVERSATIONS_KEY;

const fetchMockContacts = async () => ({ contacts: mockChatContacts });

const fetchMockConversations = async () => ({ conversations: mockChatConversations });

const fetchMockConversation = async ([, conversationId]) => ({
  conversation: mockChatConversations.find((item) => item.id === conversationId),
});

const swrOptions = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

export function useGetContacts() {
  const url = [CHART_ENDPOINT, { params: { endpoint: 'contacts' } }];

  const { data, isLoading, error, isValidating } = useSWR(
    enableServer ? url : 'chat:mock:contacts',
    enableServer ? fetcher : fetchMockContacts,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      contacts: data?.contacts || [],
      contactsLoading: isLoading,
      contactsError: error,
      contactsValidating: isValidating,
      contactsEmpty: !isLoading && !data?.contacts.length,
    }),
    [data?.contacts, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetConversations() {
  const url = [CHART_ENDPOINT, { params: { endpoint: 'conversations' } }];

  const { data, isLoading, error, isValidating } = useSWR(
    enableServer ? url : MOCK_CONVERSATIONS_KEY,
    enableServer ? fetcher : fetchMockConversations,
    swrOptions
  );

  const memoizedValue = useMemo(() => {
    const byId = data?.conversations.length ? keyBy(data.conversations, 'id') : {};
    const allIds = Object.keys(byId);

    return {
      conversations: { byId, allIds },
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !allIds.length,
    };
  }, [data?.conversations, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

export function useGetConversation(conversationId) {
  const url = conversationId
    ? [CHART_ENDPOINT, { params: { conversationId, endpoint: 'conversation' } }]
    : '';

  const key = conversationId
    ? enableServer
      ? url
      : ['chat:mock:conversation', conversationId]
    : null;

  const { data, isLoading, error, isValidating } = useSWR(
    key,
    enableServer ? fetcher : fetchMockConversation,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      conversation: data?.conversation,
      conversationLoading: isLoading,
      conversationError: error,
      conversationValidating: isValidating,
    }),
    [data?.conversation, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function sendMessage(conversationId, messageData) {
  const conversationsUrl = getConversationsKey();
  const conversationUrl = getConversationKey(conversationId);

  if (!enableServer) {
    const conversation = mockChatConversations.find((item) => item.id === conversationId);

    if (!conversation) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }

    conversation.messages = [...conversation.messages, messageData];

    mutate(conversationUrl, { conversation }, false);
    mutate(conversationsUrl, { conversations: mockChatConversations }, false);

    return;
  }

  const data = { conversationId, messageData };
  await axios.put(CHART_ENDPOINT, data);

  /**
   * Work in local
   */
  mutate(
    conversationUrl,
    (currentData) => {
      const currentConversation =
        currentData?.conversation ||
        mockChatConversations.find((conversation) => conversation.id === conversationId);

      const conversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, messageData],
      };

      return { ...currentData, conversation };
    },
    false
  );

  mutate(
    conversationsUrl,
    (currentData) => {
      const currentConversations = currentData?.conversations || mockChatConversations;

      const conversations = currentConversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, messageData] }
          : conversation
      );

      return { ...currentData, conversations };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function createConversation(conversationData) {
  const url = getConversationsKey();

  if (!enableServer) {
    mockChatConversations.push(conversationData);

    mutate(url, { conversations: mockChatConversations }, false);

    return { conversation: conversationData };
  }

  /**
   * Work on server
   */
  const data = { conversationData };
  const res = await axios.post(CHART_ENDPOINT, data);

  /**
   * Work in local
   */
  mutate(
    url,
    (currentData) => {
      const currentConversations = currentData?.conversations || mockChatConversations;

      const conversations = [...currentConversations, conversationData];

      return { ...currentData, conversations };
    },
    false
  );

  return res.data;
}

// ----------------------------------------------------------------------

export async function clickConversation(conversationId) {
  /**
   * Work on server
   */
  if (enableServer) {
    await axios.get(CHART_ENDPOINT, { params: { conversationId, endpoint: 'mark-as-seen' } });
  } else {
    const conversation = mockChatConversations.find((item) => item.id === conversationId);

    if (conversation) {
      conversation.unreadCount = 0;
    }
  }

  /**
   * Work in local
   */
  mutate(
    getConversationsKey(),
    (currentData) => {
      const currentConversations = currentData?.conversations || mockChatConversations;

      const conversations = currentConversations.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
      );

      return { ...currentData, conversations };
    },
    false
  );
}
