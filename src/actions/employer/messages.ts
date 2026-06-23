"use server";

import {
  getUnreadMessagingCount,
  getMessagingThreads,
  getMessagingMessages,
  sendMessagingMessage,
} from "@/actions/messaging";

export async function getUnreadMessageCount(): Promise<number> {
  return getUnreadMessagingCount("employer");
}

export async function getConversations() {
  return getMessagingThreads("employer");
}

export async function getMessages(threadId: string) {
  return getMessagingMessages(threadId);
}

export async function sendMessage(threadId: string, content: string) {
  return sendMessagingMessage(threadId, content, "/employer/messages");
}
