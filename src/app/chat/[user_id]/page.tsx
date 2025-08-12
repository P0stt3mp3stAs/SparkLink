'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from 'react-oidc-context';
import axios from 'axios';
import Send from '@/components/Send';

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
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

  // flags & refs for scroll behavior
  const [initialLoad, setInitialLoad] = useState(true);
  const justSentRef = useRef(false);
  const lastMessageIdRef = useRef<string | null>(null);

  const handleSendOnce = () => { console.log('Send Once clicked'); };
  const handleSendLater = () => { console.log('Send Later clicked'); };
  const handleSendBomb = () => { console.log('Send Bomb clicked'); };
  const handleAudio = () => { console.log('Audio clicked'); };
  const handleMedia = () => { console.log('Media clicked'); };
  const handleLocation = () => { console.log('Location clicked'); };
  const handleGift = () => { console.log('Gift clicked'); };

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

  const fetchMessages = async () => {
    if (!user_id || !auth.user?.id_token) return;
    try {
      const res = await axios.get(`/api/messages?user_id=${user_id}`, {
        headers: {
          Authorization: `Bearer ${auth.user.id_token}`,
        },
      });
      const msgs = Array.isArray(res.data) ? sortMessagesAsc(res.data as Message[]) : [];
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriendInfo = async () => {
    if (!user_id || !auth.user?.id_token) return;
    try {
      const res = await axios.get('/api/my-friends', {
        headers: { Authorization: `Bearer ${auth.user.id_token}` },
      });
      const friendData = (res.data as Friend[]).find((f) => f.user_id === user_id) || null;
      setFriend(friendData);
    } catch (err) {
      console.error('Failed to load friend info:', err);
      setFriend(null);
    }
  };

  // Scroll logic:
  // - on initialLoad => jump to bottom
  // - if we justSent => smooth scroll to bottom
  // - if lastMessageId changed (new message received) => smooth scroll to bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const lastMessageId = messages.length ? messages[messages.length - 1].id : null;
    const prevLast = lastMessageIdRef.current;

    if (initialLoad) {
      // instant jump on first load
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    } else if (justSentRef.current) {
      // you sent a message -> scroll down
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else if (lastMessageId && prevLast !== lastMessageId) {
      // new message arrived -> scroll down
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }

    // update trackers
    lastMessageIdRef.current = lastMessageId;
    justSentRef.current = false;
    if (initialLoad) setInitialLoad(false);
  }, [messages]);

  useEffect(() => {
    fetchFriendInfo();
  }, [user_id, auth.user?.id_token]);

  useEffect(() => {
    // initial fetch
    fetchMessages();

    // polling
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      fetchMessages();
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user_id, auth.user?.id_token]);

  const handleSend = async () => {
    if (!input.trim() || !auth.user?.id_token) return;

    try {
      const res = await axios.post(
        '/api/send-message',
        { to: user_id, content: input.trim() },
        {
          headers: {
            Authorization: `Bearer ${auth.user.id_token}`,
          },
        }
      );

      // mark that we just sent a message so the effect will scroll
      justSentRef.current = true;

      // append the new message (server response expected to be the saved message)
      setMessages((prev) => {
        const newArr = [...prev, res.data as Message];
        return sortMessagesAsc(newArr);
      });

      setInput('');
    } catch (err) {
      console.error('Send failed:', err);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-10 flex items-center px-4 py-2 bg-black shadow space-x-3">
        <img
          src={friend?.profile_image || '/default-avatar.png'}
          alt={friend?.username || 'Friend'}
          className="w-10 h-10 rounded-full object-cover"
        />
        <h1 className="text-xl font-bold text-white">
          {friend?.username || user_id}
        </h1>
      </header>

      {/* Messages list */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-2 flex flex-col pb-[60px] pt-[64px] px-4"
      >
        {loading ? (
          <p>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
  key={msg.id}
  className={`p-2 w-fit max-w-[70%] break-words whitespace-pre-wrap ${
    msg.content.length < 25
      ? 'rounded-full'
      : 'rounded-3xl'
  } ${
    msg.sender_id === myUserId
      ? 'bg-green-500 text-white self-end'
      : 'bg-gray-200 text-black self-start'
  }`}
>
  {msg.content}
</div>
          ))
        )}
        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Send bar */}
      <Send
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onSendOnce={handleSendOnce}
        onSendLater={handleSendLater}
        onSendBomb={handleSendBomb}
        onAudio={handleAudio}
        onMedia={handleMedia}
        onLocation={handleLocation}
        onGift={handleGift}
      />
    </div>
  );
}
