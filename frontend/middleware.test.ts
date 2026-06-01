import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { middleware } from "./middleware";

describe("middleware", () => {
  it("redirects unauthenticated users away from protected routes", () => {
    const request = new NextRequest("http://localhost:3000/dashboard");

    const response = middleware(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/login?next=%2Fdashboard");
  });

  it("allows authenticated users through protected routes", () => {
    const request = new NextRequest("http://localhost:3000/dashboard", {
      headers: {
        cookie: "founderos_token=abc123",
      },
    });

    const response = middleware(request);

    expect(response.status).toBe(200);
  });
});
