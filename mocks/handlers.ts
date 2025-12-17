import { HttpResponse, http } from "msw";

// Mock API handlers
export const handlers = [
  // Example: Mock GET /api/users
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Smith", email: "jane@example.com" },
    ]);
  }),

  // Example: Mock POST /api/users
  http.post("/api/users", async ({ request }) => {
    const newUser = (await request.json()) as Record<string, any>;
    return HttpResponse.json({ id: "3", ...newUser }, { status: 201 });
  }),

  // Mock health check
  http.get("/api/health", () => {
    return HttpResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  }),

  // Mock authentication endpoints
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    if (email === "test@example.com" && password === "password123") {
      return HttpResponse.json({
        user: { id: "1", email: "test@example.com", name: "Test User" },
        token: "mock-jwt-token",
      });
    }

    return HttpResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }),

  // Mock profile endpoint
  http.get("/api/profile", ({ request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.includes("Bearer mock-jwt-token")) {
      return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({
      id: "1",
      email: "test@example.com",
      name: "Test User",
      avatar: null,
    });
  }),
];
