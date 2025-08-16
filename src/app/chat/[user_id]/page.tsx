'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import Send from '@/components/Send';
import { handleSendOnce as sendOnce } from '@/components/ExtraSendButtons';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  type?: string;
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

  const myUserId = auth.user?.profile?.sub;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    }
  };

  // "Send Once" logic
  const [openedOnceMessages, setOpenedOnceMessages] = useState<string[]>([]);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduledTime, setScheduledTime] = useState('');

  // Example inside handleSendBomb
const handleSendBomb = async () => {
  if (!input.trim() || !auth.user?.id_token) return; // ✅ safe

  try {
    const bombMessages = Array.from({ length: 5 }).map(() => ({
      to: user_id,
      content: input.trim(),
      type: 'bomb',
    }));

    const token = auth.user.id_token; // ✅ TS knows it's defined

    const responses = await Promise.all(
      bombMessages.map(msg =>
        axios.post('/api/messages', msg, {
          headers: { Authorization: `Bearer ${token}` }, // safe
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
  }
};


  return (
    <div className="flex flex-col h-screen">
      {showScheduleModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 text-white">
          <div className="bg-yellow-950 p-4 rounded-3xl max-w-sm w-full">
            <h2 className="text-lg font-bold mb-3">Schedule Message</h2>
            <input
              type="datetime-local"
              className="border p-2 w-full rounded-full mb-4"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1 rounded-full bg-red-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!scheduledTime || !input.trim()) return;
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
                      { headers: { Authorization: `Bearer ${auth.user?.id_token}` } }
                    );
                    setMessages(prev => sortMessagesAsc([...prev, res.data as Message]));
                    setInput('');
                    setShowScheduleModal(false);
                    setScheduledTime('');
                  } catch (err) {
                    console.error('Failed to schedule message:', err);
                  }
                }}
                className="px-3 py-1 rounded-full bg-blue-400 text-white"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center px-4 py-2 bg-black shadow space-x-3">
        <img
          src={friend?.profile_image || '/default-avatar.png'}
          alt={friend?.username || 'Friend'}
          className="w-10 h-10 rounded-full object-cover"
        />
        <h1 className="text-xl font-bold text-white">
          {friend?.username || (Array.isArray(user_id) ? user_id[0] : (user_id as string))}
        </h1>
      </header>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-2 flex flex-col pb-[60px] pt-[64px] px-4"
      >
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg, index) => {
            const isMine = msg.sender_id === myUserId;
            const isOnce = msg.type === 'once';
            const isOpened = openedOnceMessages.includes(msg.id);

            const key = (msg as any)._tempKey || msg.id; // ensure unique

            return (
              <div
                key={key}
                onClick={() => {
                  if (isOnce && !isOpened) {
                    setOpenedOnceMessages(prev => [...prev, msg.id]);
                    setTimeout(async () => {
                      setMessages(prev => prev.filter(m => m.id !== msg.id));
                      try {
                        await axios.delete(`/api/messages/${msg.id}`, {
                          headers: { Authorization: `Bearer ${auth.user?.id_token}` },
                        });
                      } catch (err) {
                        console.error('Failed to delete once message:', err);
                      }
                    }, 3000);
                  }
                }}
                className={`p-2 w-fit max-w-[70%] break-words whitespace-pre-wrap cursor-pointer
                  ${msg.content.length < 25 ? 'rounded-full' : 'rounded-3xl'}
                  ${isMine ? 'bg-green-500 text-white self-end' : 'bg-gray-200 text-black self-start'}
                  ${isOnce && !isOpened ? 'blur-sm select-none' : ''}
                `}
              >
                {isOnce && !isOpened ? '🔒 Click to view once' : msg.content}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Send bar */}
      <Send
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onSendOnce={() =>
          sendOnce({
            input,
            setInput,
            authToken: auth.user?.id_token!,
            userId: Array.isArray(user_id) ? user_id[0] : (user_id as string),
            setMessages,
            sortMessagesAsc,
            justSentRef,
          })
        }
        onSendLater={() => setShowScheduleModal(true)}
        onSendBomb={handleSendBomb}

        // left buttons
        onAudio={() => console.log('Audio clicked')}
        onMedia={() => console.log('Media clicked')}
        onLocation={() => console.log('Location clicked')}
        onGift={() => console.log('Gift clicked')}
      />
    </div>
  );
}
