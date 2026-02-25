import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const SESSION_KEY = "consent_session_id";
const SESSION_EXPIRY_DAYS = 30;

let cachedSessionId: string | null = null;

export const useConsentSession = () => {
  const [sessionId, setSessionId] = useState<string | null>(cachedSessionId);

  useEffect(() => {
    if (cachedSessionId) {
      if (sessionId !== cachedSessionId) {
        setSessionId(cachedSessionId);
      }
      return;
    }

    // Check for existing session
    const storedSession = localStorage.getItem(SESSION_KEY);
    const storedTimestamp = localStorage.getItem(`${SESSION_KEY}_timestamp`);

    if (storedSession && storedTimestamp) {
      const now = new Date().getTime();
      const sessionTime = parseInt(storedTimestamp, 10);
      const daysDiff = (now - sessionTime) / (1000 * 60 * 60 * 24);

      if (daysDiff <= SESSION_EXPIRY_DAYS) {
        cachedSessionId = storedSession;
        setSessionId(storedSession);
        return;
      }
    }

    // Create new session if none exists or expired
    if (!cachedSessionId) {
      const newSessionId = uuidv4();
      const now = new Date().getTime();

      localStorage.setItem(SESSION_KEY, newSessionId);
      localStorage.setItem(`${SESSION_KEY}_timestamp`, now.toString());
      cachedSessionId = newSessionId;
      setSessionId(newSessionId);
    }
  }, [sessionId]);

  return sessionId;
};
