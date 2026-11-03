export const CHAT_TAB = {
  CONVERSATIONS: 'conversations',
  SENT: 'sent',
};

export const CHAT_AUDIENCE = {
  ALL: 'all',
  SELECTED: 'selected',
};

export const CHAT_PAGE_SIZE = 20;

export function getConversationId(item) {
  return item?.conversationId || '';
}

export function getBroadcastId(item) {
  return item?.broadcastId || '';
}

export function getMessageId(item) {
  return item?._id || item?.id || '';
}

export function reverseMessages(messages = []) {
  return [...messages].reverse();
}

export function mergeUniqueById(existing, incoming, getId) {
  const seen = new Set(existing.map(getId).filter(Boolean));
  const next = [...existing];

  incoming.forEach((item) => {
    const id = getId(item);
    if (!id || seen.has(id)) return;
    seen.add(id);
    next.push(item);
  });

  return next;
}

export function formatResidentNames(residents = []) {
  return residents
    .map((resident) => resident?.name)
    .filter(Boolean)
    .join(', ');
}

export function mapRecipientOption(recipient) {
  const residents = Array.isArray(recipient?.residents) ? recipient.residents : [];
  const residentNames = formatResidentNames(residents);

  return {
    value: recipient.recipientId,
    label: residentNames ? `${recipient.name} (${residentNames})` : recipient.name,
    recipientId: recipient.recipientId,
    branchId: recipient.branchId,
    name: recipient.name,
    email: recipient.email,
    photoUrl: recipient.photoUrl,
    roleLabel: recipient.roleLabel,
    residents,
  };
}

export function collectResidentIds(recipients = []) {
  const ids = [];
  const seen = new Set();

  recipients.forEach((recipient) => {
    (recipient.residents || []).forEach((resident) => {
      const id = resident.residentId || resident._id;
      if (!id || seen.has(id)) return;
      seen.add(id);
      ids.push(id);
    });
  });

  return ids;
}

export function findContactConversation(contacts = [], recipientId) {
  return contacts.find((contact) => contact.recipientId === recipientId)?.conversationId || '';
}

export function isMessageSeen(message) {
  return Boolean(message?.isRead || message?.readAt);
}

export function getSeenLabel(message) {
  return isMessageSeen(message) ? 'Seen' : 'Not seen';
}

export function hasMorePages(meta, page) {
  const totalPages = Number(meta?.totalPages);
  if (Number.isFinite(totalPages) && totalPages > 0) {
    return page < totalPages;
  }
  return false;
}

export function toastUnreachableRecipients(result, toast) {
  const missingNok = result?.residentsWithoutNextOfKin || [];
  const notReached = result?.recipientsNotReached || [];

  if (missingNok.length) {
    toast.warning(
      `${missingNok.length} resident${missingNok.length === 1 ? '' : 's'} have no next of kin`
    );
  }

  if (notReached.length) {
    toast.warning(
      `${notReached.length} recipient${notReached.length === 1 ? '' : 's'} could not be reached`
    );
  }
}
