"use client";

import { ChatBox } from "@/components/ChatBox";

interface OrderChatWrapperProps {
  orderId: string;
  userId: string;
  profileName: string;
}

export function OrderChatWrapper({ orderId, userId, profileName }: OrderChatWrapperProps) {
  return <ChatBox orderId={orderId} userId={userId} profileName={profileName} />;
}
