// src/app/chat/[user_id]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import Send from '@/components/Send';
import { handleSendOnce as sendOnce } from '@/components/ExtraSendButtons';
import {
  sendAudioMessage,
  sendMediaMessage,
  sendLocationMessage,
  sendGiftMessage,
} from "@/utils/MessageActions";
import AudioRecorder from '@/components/AudioRecorder';
import AudioMessage from '@/components/AudioMessage';
import Link from "next/link";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  type?: string;
  _tempKey?: string;
};

type Friend = {
  user_id: string;
  username: string;
  profile_image: string | null;
  age: number | null;
};

export default function ChatPage() {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const [initialLoad, setInitialLoad] = useState(true);
  const justSentRef = useRef(false);
  const lastMessageIdRef = useRef<string | null>(null);

  const { user_id } = useParams();
  const auth = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [friend, setFriend] = useState<Friend | null>(null);
  const [error, setError] = useState<string | null>(null);

  const myUserId = auth.user?.profile?.sub;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [showAudioRecorder, setShowAudioRecorder] = useState(false);

  const sortMessagesAsc = (arr: Message[]) =>
    arr.slice().sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Fetch messages
  const fetchMessages = async () => {
    if (!user_id || !auth.user?.id_token) return;
    try {
      const res = await axios.get(`/api/messages?user_id=${user_id}`, {
        headers: { Authorization: `Bearer ${auth.user.id_token}` },
      });

      const fetched = Array.isArray(res.data) ? (res.data as Message[]) : [];

      setMessages(prev => {
        const prevMap = new Map(prev.map(m => [m.id, m]));
        for (const msg of fetched) prevMap.set(msg.id, msg);
        return sortMessagesAsc(Array.from(prevMap.values()));
      });
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch friend info
  const fetchFriendInfo = async () => {
    if (!user_id || !auth.user?.id_token) return;
    try {
      const res = await axios.get('/api/my-friends', {
        headers: { Authorization: `Bearer ${auth.user.id_token}` },
      });
      const friendData = (res.data as Friend[]).find(f => f.user_id === user_id) || null;
      setFriend(friendData);
    } catch {
      setFriend(null);
    }
  };

  // Scroll management
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const lastMessageId = messages.length ? messages[messages.length - 1].id : null;
    const prevLast = lastMessageIdRef.current;

    if (initialLoad) bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    else if (justSentRef.current) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    else if (lastMessageId && prevLast !== lastMessageId) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    lastMessageIdRef.current = lastMessageId;
    justSentRef.current = false;
    if (initialLoad) setInitialLoad(false);
  }, [messages, initialLoad]);

  useEffect(() => { fetchFriendInfo(); }, [user_id, auth.user?.id_token]);

  // Polling
  useEffect(() => {
    fetchMessages();
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchMessages, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [user_id, auth.user?.id_token]);

  // Automatically send due scheduled messages
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!auth.user?.id_token) return;
      try {
        await axios.post(
          '/api/messages/send-due',
          {},
          { headers: { Authorization: `Bearer ${auth.user.id_token}` } }
        );
        fetchMessages();
      } catch (err) {
        console.error('Failed to send due messages:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [auth.user?.id_token]);

  const handleSend = async () => {
    if (!input.trim() || !auth.user?.id_token) return;
    try {
      const res = await axios.post(
        '/api/messages',
        { to: user_id, content: input.trim(), type: 'normal' },
        { headers: { Authorization: `Bearer ${auth.user.id_token}` } }
      );
      justSentRef.current = true;
      setMessages(prev => sortMessagesAsc([...prev, res.data as Message]));
      setInput('');
    } catch (err) {
      console.error('Send failed:', err);
      setError('Failed to send message');
    }
  };

  // "Send Once" logic
  const [openedOnceMessages, setOpenedOnceMessages] = useState<string[]>([]);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  const handleSendBomb = async () => {
    if (!input.trim() || !auth.user?.id_token) return;

    try {
      const bombMessages = Array.from({ length: 5 }).map(() => ({
        to: user_id,
        content: input.trim(),
        type: 'bomb',
      }));

      const token = auth.user.id_token;

      const responses = await Promise.all(
        bombMessages.map(msg =>
          axios.post('/api/messages', msg, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      setMessages(prev =>
        sortMessagesAsc([
          ...prev,
          ...responses.map((res, index) => ({
            ...(res.data as Message),
            _tempKey: `${(res.data as Message).id}-${index}`,
          })),
        ])
      );

      setInput('');
      justSentRef.current = true;
    } catch (err) {
      console.error('Send Bomb failed:', err);
      setError('Failed to send bomb messages');
    }
  };

  return (
    <div className="flex flex-col h-screen sm:h-[calc(100vh-4.77rem)]">
      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-3 rounded-lg shadow-lg z-50">
          {error}
          <button 
            onClick={() => setError(null)} 
            className="ml-2 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {showScheduleModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 text-black">
          <div className="bg-[#FCE9CE] p-4 rounded-3xl max-w-sm w-full">
            <h2 className="text-lg font-bold mb-3">Schedule Message</h2>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded-full mb-4 text-black"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1 rounded-full bg-[#2A5073] text-white"
              >
                ×
              </button>
              <button
                onClick={async () => {
                  if (!scheduledTime || !input.trim() || !auth.user?.id_token) return;
                  const isoTime = new Date(scheduledTime).toISOString();
                  try {
                    const res = await axios.post(
                      '/api/messages',
                      {
                        to: user_id,
                        content: input.trim(),
                        type: 'scheduled',
                        scheduled_at: isoTime,
                      },
                      { headers: { Authorization: `Bearer ${auth.user.id_token}` } }
                    );
                    setMessages(prev => sortMessagesAsc([...prev, res.data as Message]));
                    setInput('');
                    setShowScheduleModal(false);
                    setScheduledTime('');
                  } catch (err) {
                    console.error('Failed to schedule message:', err);
                    setError('Failed to schedule message');
                  }
                }}
                className="px-3 py-1 rounded-full bg-[#FFD700] text-white"
              >
                ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {showAudioRecorder && (
        <AudioRecorder
          onRecordingComplete={(audioBlob) => {
            if (auth.user?.id_token && myUserId) {
              sendAudioMessage({
                userId: Array.isArray(user_id) ? user_id[0] : (user_id as string),
                token: auth.user.id_token,
                file: audioBlob,
                setMessages,
                sortMessagesAsc,
                justSentRef,
                currentUserId: myUserId,
              });
            }
            setShowAudioRecorder(false);
          }}
          onCancel={() => setShowAudioRecorder(false)}
        />
      )}

      {/* Header */}
      <header className="fixed top-4 -translate-x-1/2 left-1/2 z-10 flex items-center px-2 py-2 bg-[#FCE9CE] shadow space-x-3 rounded-full text-black">
        <Link href={`/uprofiles/${friend?.user_id || user_id}`} className="flex items-center gap-2">
          <img
            src={friend?.profile_image || "/default-avatar.png"}
            alt={friend?.username || "Friend"}
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-80 transition"
          />
          <h1 className="text-xl font-bold cursor-pointer hover:underline">
            {friend?.username ||
              "..."}
          </h1>
        </Link>
      </header>

      {/* FIXED CHAT CONTAINER */}
<div
  className="
    fixed inset-0
    top-20 bottom-16 sm:bottom-35 px-4
    flex flex-col
  "
>
  {/* SCROLLABLE MESSAGES BOX */}
  <div
    ref={messagesContainerRef}
    className="
      flex-1 overflow-y-auto w-full
      bg-gradient-to-b from-[#FCE9CE] to-[#FFF5E6]
      rounded-xl
      p-3 space-y-2
      flex flex-col 
    "
  >
    {loading ? (
      <p className="text-gray-500">Loading messages...</p>
    ) : messages.length === 0 ? (
      <p className="text-gray-500">No messages yet.</p>
    ) : (
      messages.map((msg) => {
        const isMine = msg.sender_id === myUserId;
        const isOnce = msg.type === "once";
        const isOpened = openedOnceMessages.includes(msg.id);
        const key = msg._tempKey || msg.id;

        return (
          <div
            key={key}
            onClick={() => {
              if (isOnce && !isOpened) {
                setOpenedOnceMessages(prev => [...prev, msg.id]);
                setTimeout(async () => {
                  setMessages(prev => prev.filter(m => m.id !== msg.id));
                  try {
                    if (auth.user?.id_token) {
                      await axios.delete(`/api/messages/${msg.id}`, {
                        headers: { Authorization: `Bearer ${auth.user.id_token}` },
                      });
                    }
                  } catch (err) {
                    console.error("Failed to delete once message:", err);
                  }
                }, 3000);
              }
            }}
            className={`
              p-2 w-fit max-w-[70%] break-words whitespace-pre-wrap cursor-pointer
              ${
                msg.type === "audio" || msg.type === "image"
                  ? "rounded-3xl"
                  : msg.content.length < 25
                  ? "rounded-full"
                  : "rounded-3xl"
              }
              ${isMine ? "bg-[#2A5073] text-white self-end" : "bg-[#FCE9CE] text-black self-start"}
              ${isOnce && !isOpened ? "blur-sm select-none" : ""}
            `}
          >
            {isOnce && !isOpened ? (
              "🔒 Click to view once"
            ) : msg.type === "audio" ||
              msg.content.endsWith(".webm") ||
              msg.content.endsWith(".mp3") ||
              msg.content.endsWith(".wav") ? (
              <AudioMessage src={msg.content} />
            ) : msg.type === "image" ||
              msg.content.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i) ? (
              <img
                src={msg.content}
                alt="Shared image"
                className="max-w-xs max-h-64 rounded-2xl shadow cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
            ) : msg.type === "location" ? (
              (() => {
                const coordsMatch = msg.content.match(/q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);
                if (!coordsMatch) return null;
                const lat = coordsMatch[1];
                const lng = coordsMatch[3];
                const embedUrl = `https://www.google.com/maps?q=${lat},${lng}&hl=es;z=14&output=embed`;

                return (
                  <div className="w-full max-w-sm h-64 rounded-lg overflow-hidden shadow">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                );
              })()
            ) : (
              msg.content
            )}
          </div>
        );
      })
    )}

    <div ref={bottomRef} />
  </div>
</div>

      {/* Send bar */}
      <Send
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onSendOnce={() => {
          if (!auth.user?.id_token) return;
          sendOnce({
            input,
            setInput,
            authToken: auth.user.id_token,
            userId: Array.isArray(user_id) ? user_id[0] : (user_id as string),
            setMessages,
            sortMessagesAsc,
            justSentRef,
          });
        }}
        onSendLater={() => setShowScheduleModal(true)}
        onSendBomb={handleSendBomb}

        // left buttons
        onAudio={() => setShowAudioRecorder(true)}

        onMedia={async () => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.accept = "image/*";
          fileInput.onchange = () => {
            const file = fileInput.files?.[0];
            if (file && auth.user?.id_token && myUserId) {
              sendMediaMessage({
                userId: Array.isArray(user_id) ? user_id[0] : (user_id as string),
                token: auth.user.id_token,
                file,
                setMessages,
                sortMessagesAsc,
                justSentRef,
                currentUserId: myUserId,
              });
            }
          };
          fileInput.click();
        }}
        onLocation={() => {
          if (auth.user?.id_token) {
            sendLocationMessage({
              userId: Array.isArray(user_id) ? user_id[0] : (user_id as string),
              token: auth.user.id_token,
              setMessages,
              sortMessagesAsc,
              justSentRef,
              currentUserId: myUserId || '',
            });
          }
        }}
        onGift={() => {
          if (auth.user?.id_token) {
            sendGiftMessage({
              userId: Array.isArray(user_id) ? user_id[0] : (user_id as string),
              token: auth.user.id_token,
              hiddenText: input,
              setMessages,
              sortMessagesAsc,
              justSentRef,
              currentUserId: myUserId || '',
            });
            setInput("");
          }
        }}
      />
    </div>
  );
}