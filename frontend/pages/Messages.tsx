import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send, ArrowLeft, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import backend from "@/lib/backend";

interface Message {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  messageType: string;
  readAt: string | null;
  createdAt: string;
}

interface Conversation {
  id: number;
  bookingId: number | null;
  clientId: string;
  freelancerId: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  clientUnreadCount: number;
  freelancerUnreadCount: number;
  otherUserName: string;
  otherUserPhoto: string | null;
  bookingServiceTitle: string | null;
  bookingDate: string | null;
}

export default function Messages() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    loadConversations();
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages(parseInt(conversationId));
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      const response = await backend.messages.listConversations();
      setConversations(response.conversations);
    } catch (error: any) {
      console.error("Failed to load conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const response = await backend.messages.getMessages({ conversationId: convId });
      setMessages(response.messages);
    } catch (error: any) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !conversationId) return;

    setSending(true);
    try {
      const response = await backend.messages.sendMessage({
        conversationId: parseInt(conversationId),
        content: newMessage.trim(),
      });
      setMessages([...messages, response.message]);
      setNewMessage("");
      loadConversations(); // Refresh conversation list
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const selectedConversation = conversations.find(c => c.id === parseInt(conversationId || "0"));

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-6xl">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-[500px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-[#E91E63]" />
        Messages
      </h1>

      <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="p-3 border-b bg-gray-50">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    conv.id === parseInt(conversationId || "0") ? "bg-pink-50 border-l-4 border-l-[#E91E63]" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E91E63] to-[#F4B942] flex items-center justify-center flex-shrink-0">
                      {conv.otherUserPhoto ? (
                        <img src={conv.otherUserPhoto} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium truncate">{conv.otherUserName}</span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-muted-foreground">{formatTime(conv.lastMessageAt)}</span>
                        )}
                      </div>
                      {conv.bookingServiceTitle && (
                        <p className="text-xs text-[#E91E63]">{conv.bookingServiceTitle}</p>
                      )}
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage || "No messages yet"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden bg-white flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-3 border-b bg-gray-50 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => navigate("/messages")}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E91E63] to-[#F4B942] flex items-center justify-center">
                  {selectedConversation.otherUserPhoto ? (
                    <img src={selectedConversation.otherUserPhoto} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedConversation.otherUserName}</p>
                  {selectedConversation.bookingServiceTitle && (
                    <p className="text-xs text-muted-foreground">{selectedConversation.bookingServiceTitle}</p>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderId === currentUser?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        msg.senderId === currentUser?.id
                          ? "bg-gradient-to-r from-[#E91E63] to-[#F4B942] text-white"
                          : "bg-gray-100"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? "text-white/70" : "text-muted-foreground"}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#E91E63]"
                  />
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="rounded-full bg-gradient-to-r from-[#E91E63] to-[#F4B942]"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

