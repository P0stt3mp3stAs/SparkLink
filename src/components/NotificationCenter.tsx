'use client';
import { useState, useEffect, useRef, useCallback, MouseEvent, TouchEvent } from 'react';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/navigation';
import { FaBell } from 'react-icons/fa';

type Notification = {
  id: number;
  user_id: string;
  from_user_id: string;
  is_read: boolean;
  username?: string;
};

interface UserInfo {
  sub?: string;
  profile?: {
    sub?: string;
  };
}

function NotificationButton({ unreadCount, onClick }: { unreadCount: number; onClick?: () => void }) {
  return (
    <div className="relative inline-block">
      <button
        onClick={onClick}
        className="p-3 bg-yellow-400 rounded-full text-black shadow-md hover:bg-yellow-300 transition-colors"
      >
        <FaBell size={20} />
      </button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -left-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
          {unreadCount}
        </span>
      )}
    </div>
  );
}

interface Position {
  x: number;
  y: number;
}

export default function NotificationCenter() {
  const auth = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showList, setShowList] = useState(false);

  /** ---------------- DRAG SYSTEM ---------------- */
  const [position, setPosition] = useState<Position>({ x: 16.5, y: 120 });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = (e: MouseEvent<HTMLDivElement> | TouchEvent<HTMLDivElement>) => {
    const isTouch = 'touches' in e;
    const point = isTouch ? e.touches[0] : e as MouseEvent<HTMLDivElement>;
    
    if (!containerRef.current) return;
    
    setDragging(true);
    const rect = containerRef.current.getBoundingClientRect();

    setDragOffset({
      x: point.clientX - rect.left,
      y: point.clientY - rect.top,
    });
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent<Document>) => {
      if (!dragging) return;
      
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    },
    [dragging, dragOffset]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent<Document>) => {
      if (!dragging) return;
      
      const point = e.touches[0];
      setPosition({
        x: point.clientX - dragOffset.x,
        y: point.clientY - dragOffset.y,
      });
    },
    [dragging, dragOffset]
  );

  const stopDragging = () => setDragging(false);

  useEffect(() => {
    if (!dragging) return;

    const handleDocMouseMove = (e: MouseEvent) => handleMouseMove(e as unknown as MouseEvent<Document>);
    const handleDocTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleTouchMove(e as unknown as TouchEvent<Document>);
    };

    document.addEventListener('mousemove', handleDocMouseMove as unknown as EventListener);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchmove', handleDocTouchMove as unknown as EventListener, { passive: false });
    document.addEventListener('touchend', stopDragging);

    return () => {
      document.removeEventListener('mousemove', handleDocMouseMove as unknown as EventListener);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchmove', handleDocTouchMove as unknown as EventListener);
      document.removeEventListener('touchend', stopDragging);
    };
  }, [dragging, handleMouseMove, handleTouchMove]);

  /** ---------------- NOTIFICATION LOGIC ---------------- */
  const _authUser = auth?.user as UserInfo | undefined;
  const userId = _authUser?.sub || _authUser?.profile?.sub;

  const fetchNotifications = async () => {
    if (!userId) return;
    setLoading(true);

    try {
      const res = await fetch('/api/check-and-create-match-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getNotifications', userId }),
      });

      const json = await res.json();
      if (json.error) {
        setError(json.error);
        setNotifications([]);
        return;
      }

      const notifs: Notification[] = json.notifications || [];

      const usernames = await Promise.all(
        notifs.map(async (n) => {
          const u = await fetch('/api/get-username', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: n.from_user_id }),
          });
          const uJson = await u.json();
          return uJson.username || 'unknown';
        })
      );

      setNotifications(
        notifs.map((n, i) => ({
          ...n,
          username: usernames[i],
        }))
      );
    } catch (err) {
      console.error(err);
      setError('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleClick = async (notif: Notification) => {
    if (!userId) return;

    try {
      await fetch('/api/check-and-create-match-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'markRead', userId, notificationId: notif.id }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );

      router.push(`/chat/${notif.from_user_id}`);
    } catch {
      router.push(`/chat/${notif.from_user_id}`);
    }
  };

  /** ---------------- RENDER ---------------- */
  return (
    <div
      ref={containerRef}
      className={`fixed z-50 cursor-${dragging ? 'grabbing' : 'grab'} select-none`}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onMouseDown={startDragging}
      onTouchStart={startDragging}
    >
      {/* Button */}
      <NotificationButton
        unreadCount={unreadCount}
        onClick={() => {
          if (!dragging) setShowList((prev) => !prev);
        }}
      />

      {/* List */}
      {showList && (
        <div className="
          mt-2 w-64 p-4 rounded-3xl
          bg-gradient-to-b from-[#FCE9CE]/60 to-transparent
          backdrop-blur-xl
          max-h-[70vh] overflow-y-auto
        ">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-black">Notifications</h3>
            <div className="text-black">{unreadCount}</div>
          </div>

          {loading && <div className="text-black">Loading...</div>}
          {error && <div className="text-black">{error}</div>}
          {!loading && notifications.length === 0 && <div className="text-black">No notifications</div>}

          <ul className="space-y-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                onClick={() => handleClick(n)}
                className={`p-3 rounded-2xl cursor-pointer ${
                  n.is_read ? 'bg-[#FCE9CE]' : 'bg-[#FFD700] hover:bg-[#FFDE2A]'
                }`}
              >
                <div className="text-black">
                  You have matched with <span className="font-semibold">{n.username}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}