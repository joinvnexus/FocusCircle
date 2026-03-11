import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordPage from "@/app/reset-password/page";
import * as authActions from "@/app/actions/auth";

vi.mock("@/app/actions/auth", () => ({
  requestPasswordResetAction: vi.fn().mockResolvedValue({ error: null }),
  resetPasswordAction: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("ResetPasswordPage", () => {
  it("requests a password reset email", async () => {
    const requestPasswordResetAction = vi.mocked(authActions.requestPasswordResetAction);
    render(<ResetPasswordPage />);

    await userEvent.type(screen.getByLabelText("Email"), "user@example.com");
    await userEvent.click(screen.getByRole("button", { name: /email reset link/i }));

    await waitFor(() => {
      expect(requestPasswordResetAction).toHaveBeenCalledTimes(1);
    });

    expect(requestPasswordResetAction).toHaveBeenCalledWith({ email: "user@example.com" });
  });

  it("submits a new password", async () => {
    const resetPasswordAction = vi.mocked(authActions.resetPasswordAction);
    render(<ResetPasswordPage />);

    await userEvent.type(screen.getByLabelText("New password"), "password123");
    const buttons = screen.getAllByRole("button", { name: /update password/i });
    await userEvent.click(buttons[0]);

    await waitFor(() => {
      expect(resetPasswordAction).toHaveBeenCalledTimes(1);
    });

    expect(resetPasswordAction).toHaveBeenCalledWith({ password: "password123" });
  });
});
