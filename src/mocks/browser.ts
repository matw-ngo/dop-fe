/**
 * MSW Browser Setup for Development
 *
 * This enables API mocking in the browser during development,
 * allowing frontend development without backend dependencies.
 */

import { setupWorker } from "msw/browser";
import { consentHandlers } from "../__tests__/msw/handlers/consent";
import { dopHandlers } from "../__tests__/msw/handlers/dop";

// Combine all handlers
const allHandlers = [...consentHandlers, ...dopHandlers];

// Create MSW worker
export const worker = setupWorker(...allHandlers);

// Note: Worker is started by MSWProvider component
// to avoid SSR issues in Next.js
