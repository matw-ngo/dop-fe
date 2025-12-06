import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// Setup MSW server for Node/Vitest environment
export const server = setupServer(...handlers);
