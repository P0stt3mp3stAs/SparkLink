// src/utils/recordAudio.ts
export async function recordAudio(): Promise<Blob | null> {
  try {
    // Ask for microphone permission
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];

    return new Promise((resolve) => {
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        resolve(audioBlob);
      };

      // Start recording
      mediaRecorder.start();

      // Auto-stop after 5 seconds (or adjust as you like)
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }, 5000);
    });
  } catch (err) {
    console.error("Audio recording failed:", err);
    return null;
  }
}
