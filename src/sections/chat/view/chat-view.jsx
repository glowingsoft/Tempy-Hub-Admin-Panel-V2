import { useCallback, useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';

import { EmptyContent } from 'src/components/empty-content';
import { toast } from 'src/components/snackbar';
import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePathname, useRouter, useSearchParams } from 'src/routes/hooks';
import { ALL_BRANCHES_VALUE, OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import {
  useGetChatContactsQuery,
  useGetChatMessagesQuery,
  useSendChatMessageMutation,
} from 'src/store/Reducer/chats-api';
import { getUserBranchId } from 'src/utils/organization';

import { ChatHeaderCompose } from '../chat-header-compose';
import { ChatHeaderDetail } from '../chat-header-detail';
import { ChatMessageInput } from '../chat-message-input';
import { ChatMessageList } from '../chat-message-list';
import { ChatNav } from '../chat-nav';
import { ChatRoom } from '../chat-room';
import { ChatSentView } from '../chat-sent-view';
import { useCollapseNav } from '../hooks/use-collapse-nav';
import { Layout } from '../layout';
import {
  CHAT_AUDIENCE,
  CHAT_PAGE_SIZE,
  CHAT_TAB,
  collectResidentIds,
  findContactConversation,
  getConversationId,
  getMessageId,
  hasMorePages,
  mergeUniqueById,
  toastUnreachableRecipients,
} from '../utils';

// ----------------------------------------------------------------------

export function ChatView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { organizationId, isOwner, user } = useCurrentOrganization();
  const { branchId: ownerBranchId, onBranchChange } = useOwnerBranchFilter();

  const staffBranchId = getUserBranchId(user, organizationId);
  const selectedBranchId = isOwner
    ? ownerBranchId && ownerBranchId !== ALL_BRANCHES_VALUE
      ? ownerBranchId
      : ''
    : staffBranchId;

  const tab = searchParams.get('tab') === CHAT_TAB.SENT ? CHAT_TAB.SENT : CHAT_TAB.CONVERSATIONS;
  const selectedConversationId = searchParams.get('id') || '';
  const broadcastId = searchParams.get('broadcastId') || '';

  const [recipients, setRecipients] = useState([]);
  const [sendToAll, setSendToAll] = useState(false);
  const [contactKeyword, setContactKeyword] = useState('');
  const [contactPages, setContactPages] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [messages, setMessages] = useState([]);

  const debouncedKeyword = useDebounce(contactKeyword, 400).trim();
  const roomNav = useCollapseNav();
  const conversationsNav = useCollapseNav();

  const [sendChatMessage, { isLoading: sending }] = useSendChatMessageMutation();

  useEffect(() => {
    setContactPages(1);
  }, [organizationId, selectedBranchId, debouncedKeyword]);

  useEffect(() => {
    setMessagePage(1);
    setMessages([]);
  }, [selectedConversationId]);

  useEffect(() => {
    setRecipients([]);
    setSendToAll(false);
  }, [selectedConversationId, selectedBranchId]);

  const {
    data: contactsData,
    isLoading: contactsLoading,
    isFetching: contactsFetching,
  } = useGetChatContactsQuery(
    {
      organizationId,
      page: 1,
      limit: contactPages * CHAT_PAGE_SIZE,
      ...(selectedBranchId ? { branchId: selectedBranchId } : {}),
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
    },
    { skip: !organizationId }
  );

  const {
    data: conversationData,
    isLoading: conversationLoading,
    isFetching: conversationFetching,
    isError: conversationError,
  } = useGetChatMessagesQuery(
    {
      organizationId,
      conversationId: selectedConversationId,
      page: messagePage,
      limit: CHAT_PAGE_SIZE,
    },
    { skip: !organizationId || !selectedConversationId }
  );

  const contacts = contactsData?.data ?? [];
  const contactsMeta = contactsData?.meta ?? {};
  const conversationMeta = conversationData?.meta ?? {};
  const contact = conversationMeta.contact || contacts.find((item) => getConversationId(item) === selectedConversationId);

  useEffect(() => {
    const rows = conversationData?.data ?? [];
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }
    if (messagePage === 1) {
      setMessages(rows);
      return;
    }
    setMessages((previous) => mergeUniqueById(previous, rows, getMessageId));
  }, [conversationData, messagePage, selectedConversationId]);

  useEffect(() => {
    if (conversationError && selectedConversationId) {
      router.push(pathname);
    }
  }, [conversationError, pathname, router, selectedConversationId]);

  const pushChat = useCallback(
    ({ nextTab = CHAT_TAB.CONVERSATIONS, conversationId, nextBroadcastId } = {}) => {
      const params = new URLSearchParams();
      if (nextTab === CHAT_TAB.SENT) {
        params.set('tab', CHAT_TAB.SENT);
        if (nextBroadcastId) params.set('broadcastId', nextBroadcastId);
      } else if (conversationId) {
        params.set('id', conversationId);
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router]
  );

  const handleTabChange = useCallback(
    (_event, nextTab) => {
      if (!nextTab) return;
      pushChat({ nextTab });
    },
    [pushChat]
  );

  const handleSend = useCallback(
    async (message) => {
      if (!organizationId) return;

      try {
        if (selectedConversationId) {
          const result = await sendChatMessage({
            organizationId,
            conversationId: selectedConversationId,
            message,
          }).unwrap();
          toastUnreachableRecipients(result, toast);
          setMessagePage(1);
          return;
        }

        if (sendToAll) {
          if (!selectedBranchId) {
            toast.error('Select a site first');
            throw new Error('Select a site first');
          }

          const result = await sendChatMessage({
            organizationId,
            audience: CHAT_AUDIENCE.ALL,
            message,
            branchId: selectedBranchId,
          }).unwrap();
          toastUnreachableRecipients(result, toast);
          pushChat({ nextTab: CHAT_TAB.SENT, nextBroadcastId: result?.broadcastId });
          return;
        }

        if (!recipients.length) {
          toast.error('Select at least one recipient');
          throw new Error('Select at least one recipient');
        }

        if (recipients.length === 1) {
          const existingConversationId = findContactConversation(contacts, recipients[0].recipientId);
          if (existingConversationId) {
            const result = await sendChatMessage({
              organizationId,
              conversationId: existingConversationId,
              message,
            }).unwrap();
            toastUnreachableRecipients(result, toast);
            pushChat({ conversationId: existingConversationId });
            return;
          }
        }

        const residentIds = collectResidentIds(recipients);
        if (!residentIds.length) {
          toast.error('Selected contacts have no linked residents');
          throw new Error('Selected contacts have no linked residents');
        }

        const branchId = selectedBranchId || recipients[0]?.branchId;
        if (!branchId) {
          toast.error('Select a site first');
          throw new Error('Select a site first');
        }

        const result = await sendChatMessage({
          organizationId,
          audience: CHAT_AUDIENCE.SELECTED,
          residentIds,
          message,
          branchId,
        }).unwrap();
        toastUnreachableRecipients(result, toast);

        if (result?.conversationId && recipients.length === 1) {
          pushChat({ conversationId: result.conversationId });
          return;
        }

        pushChat({ nextTab: CHAT_TAB.SENT, nextBroadcastId: result?.broadcastId });
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Unable to send message');
        throw error;
      }
    },
    [
      contacts,
      organizationId,
      pushChat,
      recipients,
      selectedBranchId,
      selectedConversationId,
      sendChatMessage,
      sendToAll,
    ]
  );

  const composerEnabled = Boolean(selectedConversationId || sendToAll || recipients.length);
  const conversationBusy = conversationLoading || conversationFetching;

  const headingAction = useMemo(
    () =>
      isOwner ? (
        <OwnerBranchFilterActions value={ownerBranchId} onChange={onBranchChange} />
      ) : null,
    [isOwner, onBranchChange, ownerBranchId]
  );

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        flexDirection: 'column',
        minHeight: 0,
        pt: { xs: 1, md: 1.5 },
        pb: 1.5,
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1.5}
        sx={{ mb: 1.5, flexShrink: 0 }}
      >
        <Typography variant="h5">Messages</Typography>

        <ToggleButtonGroup
          exclusive
          size="small"
          value={tab}
          onChange={handleTabChange}
          sx={{
            p: 0.25,
            borderRadius: 1,
            bgcolor: 'background.neutral',
            '& .MuiToggleButtonGroup-grouped': {
              border: 0,
              px: 1.5,
              py: 0.5,
              typography: 'subtitle2',
              textTransform: 'none',
              color: 'text.secondary',
              '&.Mui-selected': {
                color: 'text.primary',
                bgcolor: 'background.paper',
                boxShadow: (theme) => theme.customShadows.z1,
                '&:hover': { bgcolor: 'background.paper' },
              },
            },
          }}
        >
          <ToggleButton value={CHAT_TAB.CONVERSATIONS}>Conversations</ToggleButton>
          <ToggleButton value={CHAT_TAB.SENT}>Sent</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ flexGrow: 1 }} />
        {headingAction}
      </Stack>

      <Box sx={{ display: tab === CHAT_TAB.SENT ? 'flex' : 'none', flex: '1 1 auto', minHeight: 0 }}>
        <ChatSentView
          organizationId={organizationId}
          branchId={selectedBranchId}
          broadcastId={broadcastId}
          onOpenBroadcast={(id) => pushChat({ nextTab: CHAT_TAB.SENT, nextBroadcastId: id })}
          onBack={() => pushChat({ nextTab: CHAT_TAB.SENT })}
        />
      </Box>

      <Box sx={{ display: tab === CHAT_TAB.CONVERSATIONS ? 'flex' : 'none', flex: '1 1 auto', minHeight: 0, minWidth: 0 }}>
        <Layout
          sx={{
            minHeight: 0,
            flex: '1 1 auto',
            width: 1,
            height: { md: 'calc(100dvh - 176px)' },
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.customShadows.card,
          }}
          slots={{
            header: selectedConversationId ? (
              <ChatHeaderDetail
                collapseNav={roomNav}
                contact={contact}
                loading={conversationBusy}
              />
            ) : (
              <ChatHeaderCompose
                organizationId={organizationId}
                branchId={selectedBranchId}
                recipients={recipients}
                onAddRecipients={setRecipients}
                sendToAll={sendToAll}
                onSendToAllChange={(checked) => {
                  setSendToAll(checked);
                  if (checked) setRecipients([]);
                }}
              />
            ),
            nav: (
              <ChatNav
                contacts={contacts}
                canLoadMore={contacts.length < (Number(contactsMeta.totalRecords) || 0)}
                onLoadMore={() => {
                  if (
                    !contactsFetching &&
                    contacts.length < (Number(contactsMeta.totalRecords) || 0)
                  ) {
                    setContactPages((current) => current + 1);
                  }
                }}
                keyword={contactKeyword}
                onKeywordChange={setContactKeyword}
                loading={contactsLoading || contactsFetching}
                selectedConversationId={selectedConversationId}
                basePath={pathname}
                collapseNav={conversationsNav}
              />
            ),
            main: (
              <>
                {selectedConversationId ? (
                  <ChatMessageList
                    messages={messages}
                    loading={conversationBusy}
                    meta={conversationMeta}
                    page={messagePage}
                    onLoadOlder={() => {
                      if (!conversationFetching && hasMorePages(conversationMeta, messagePage)) {
                        setMessagePage((current) => current + 1);
                      }
                    }}
                  />
                ) : (
                  <EmptyContent
                    imgUrl={`${CONFIG.site.basePath}/assets/icons/empty/ic-chat-active.svg`}
                    title={sendToAll ? 'Message all next of kin' : 'Write a message'}
                    description={
                      sendToAll
                        ? 'This will be sent to every active next of kin at the selected site.'
                        : 'Select next of kin, or open a conversation.'
                    }
                    slotProps={{ img: { maxWidth: 96 } }}
                    sx={{ py: 2 }}
                  />
                )}

                <ChatMessageInput
                  disabled={!composerEnabled}
                  sending={sending}
                  onSend={handleSend}
                />
              </>
            ),
            details: selectedConversationId && (
              <ChatRoom collapseNav={roomNav} contact={contact} loading={conversationBusy} />
            ),
          }}
        />
      </Box>
    </DashboardContent>
  );
}
