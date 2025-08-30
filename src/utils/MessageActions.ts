// src/utils/MessageActions.ts
import axios from "axios";

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  type?: string;
  _tempKey?: string;
};

interface MessageActionParams {
  userId: string; // recipient ID
  token: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  sortMessagesAsc: (messages: Message[]) => Message[];
  justSentRef: React.MutableRefObject<boolean>;
  currentUserId: string; // sender ID for upload
}

interface MediaMessageParams extends MessageActionParams {
  file: Blob | File;
}

interface GiftMessageParams extends MessageActionParams {
  hiddenText: string;
}

// --- 1. Send Audio Message ---
export async function sendAudioMessage({
  userId,
  token,
  file,
  setMessages,
  sortMessagesAsc,
  justSentRef,
  currentUserId,
}: MediaMessageParams) {
  try {
    const filename = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.webm`;

    const formData = new FormData();
    formData.append("file", file, filename);
    formData.append("contentType", file.type || "audio/webm");
    formData.append("user_id", currentUserId);

    const uploadRes = await axios.post<{ url: string }>("/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const fileUrl = uploadRes.data.url;
    if (!fileUrl) throw new Error("Upload did not return a URL");

    const res = await axios.post<Message>(
      "/api/messages",
      {
        to: userId,
        content: fileUrl,
        type: "audio",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setMessages((prev) => sortMessagesAsc([...prev, res.data]));
    justSentRef.current = true;
  } catch (err: unknown) {
    const e = err as { response?: { data?: unknown }; message?: string };
    console.error("Audio send failed:", e.response?.data || e.message || e);
  }
}

// --- 2. Send Media (Image) ---
export async function sendMediaMessage({
  userId,
  token,
  file,
  setMessages,
  sortMessagesAsc,
  justSentRef,
  currentUserId,
}: MediaMessageParams) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", currentUserId);

    const uploadRes = await axios.post<{ url: string }>("/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const fileUrl = uploadRes.data.url;

    const res = await axios.post<Message>(
      "/api/messages",
      { to: userId, content: fileUrl, type: "image" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessages((prev) => sortMessagesAsc([...prev, res.data]));
    justSentRef.current = true;
  } catch (err: unknown) {
    const e = err as { response?: { data?: unknown }; message?: string };
    console.error("Image send failed:", e.response?.data || e.message || e);
  }
}

// --- 3. Send Location ---
export async function sendLocationMessage({
  userId,
  token,
  setMessages,
  sortMessagesAsc,
  justSentRef,
}: MessageActionParams) {
  try {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        const res = await axios.post<Message>(
          "/api/messages",
          { to: userId, content: mapsLink, type: "location" },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages((prev) => sortMessagesAsc([...prev, res.data]));
        justSentRef.current = true;
      },
      (err) => {
        console.error("Geolocation error:", err);
      }
    );
  } catch (err: unknown) {
    const e = err as { response?: { data?: unknown }; message?: string };
    console.error("Location send failed:", e.response?.data || e.message || e);
  }
}

// --- 4. Send Gift Message ---
export async function sendGiftMessage({
  userId,
  token,
  hiddenText,
  setMessages,
  sortMessagesAsc,
  justSentRef,
}: GiftMessageParams) {
  try {
    const res = await axios.post<Message>(
      "/api/messages",
      { to: userId, content: hiddenText, type: "gift" },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setMessages((prev) => sortMessagesAsc([...prev, res.data]));
    justSentRef.current = true;
  } catch (err: unknown) {
    const e = err as { response?: { data?: unknown }; message?: string };
    console.error("Gift send failed:", e.response?.data || e.message || e);
  }
}
