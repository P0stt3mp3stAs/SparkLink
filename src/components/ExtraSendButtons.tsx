import axios from "axios";

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  type?: string;
}

interface HandleSendOnceParams {
  input: string;
  setInput: (value: string) => void;
  authToken: string;
  userId: string;
  setMessages: (updater: (prev: Message[]) => Message[]) => void;
  sortMessagesAsc: (messages: Message[]) => Message[];
  justSentRef: React.MutableRefObject<boolean>;
}

export async function handleSendOnce({
  input,
  setInput,
  authToken,
  userId,
  setMessages,
  sortMessagesAsc,
  justSentRef,
}: HandleSendOnceParams) {
  if (!input.trim() || !authToken) return;

  // Create temporary local message
  const tempId = crypto.randomUUID();
  const tempMsg: Message = {
    id: tempId,
    sender_id: "me",
    receiver_id: userId,
    content: input.trim(),
    timestamp: new Date().toISOString(),
    type: "once",
  };

  // Add immediately
  justSentRef.current = true;
  setMessages(prev => sortMessagesAsc([...prev, tempMsg]));
  setInput("");

  try {
    const res = await axios.post<Message>(
      "/api/messages",
      { to: userId, content: input.trim(), type: "once" },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    // Replace temp message with backend message
    setMessages(prev =>
      sortMessagesAsc(prev.map(m => (m.id === tempId ? res.data : m)))
    );
  } catch (err) {
    console.error("Send Once failed:", err);
    // Remove temp message on failure
    setMessages(prev => prev.filter(m => m.id !== tempId));
  }
}
