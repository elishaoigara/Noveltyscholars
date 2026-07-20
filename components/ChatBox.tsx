"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Message, Profile } from "@/lib/types";

interface ChatBoxProps {
  orderId: string;
  userId: string;
  profileName?: string;
}

export function ChatBox({ orderId, userId, profileName = "User" }: ChatBoxProps) {
  const [messages, setMessages] = useState<
    (Message & { profiles?: { full_name: string } | null })[]
  >([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*, profiles(full_name)")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  }, [orderId, supabase]);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`messages-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message & {
            profiles?: { full_name: string } | null;
          };
          supabase
            .from("profiles")
            .select("full_name")
            .eq("id", newMsg.user_id)
            .single<Pick<Profile, "full_name">>()
            .then(({ data }) => {
              setMessages((prev) => [
                ...prev,
                { ...newMsg, profiles: data ? { full_name: data.full_name } : null },
              ]);
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, fetchMessages, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      order_id: orderId,
      user_id: userId,
      content: newMessage.trim(),
    });

    if (error) {
      console.error("Failed to send message:", error);
    }
    setNewMessage("");
    setSending(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-[70vh] sm:h-[500px] max-h-[500px] border border-border rounded-2xl overflow-hidden surface-raised">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border surface-sunken shrink-0">
        <h3 className="font-semibold text-sm text-heading">Order Chat</h3>
        <p className="text-xs text-muted-foreground">
          Communicate with your writer here
        </p>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground text-center px-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.user_id === userId;
            return (
              <div
                key={msg.id}
                className={cn("flex gap-2", isMine ? "justify-end" : "justify-start")}
              >
                {!isMine && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(msg.profiles?.full_name || "User")}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 text-sm break-words",
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  )}
                >
                  {!isMine && (
                    <p className="text-xs font-semibold text-primary mb-0.5">
                      {msg.profiles?.full_name || "User"}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  <p
                    className={cn(
                      "text-[10px] mt-1",
                      isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}
                  >
                    {new Date(msg.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {isMine && (
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {getInitials(profileName)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 p-2.5 sm:p-3 border-t border-border surface-sunken shrink-0">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 surface-raised"
          disabled={sending}
        />
        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()} className="shrink-0">
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
