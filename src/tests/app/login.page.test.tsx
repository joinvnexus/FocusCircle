import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

const signIn = vi.fn(async () => ({ error: null }));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ signIn }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("LoginPage", () => {
  it("submits credentials", async () => {
    const assignMock = vi.fn();
    Object.defineProperty(window, "location", {
      value: { assign: assignMock },
      writable: true,
    });

    render(<LoginPage />);

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledTimes(1);
    });

    expect(signIn).toHaveBeenCalledWith("user@example.com", "password123");
    expect(assignMock).toHaveBeenCalledWith("/dashboard");
  });
});
