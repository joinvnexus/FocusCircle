import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupPage from "@/app/signup/page";
import * as authActions from "@/app/actions/auth";

const push = vi.fn();

vi.mock("@/app/actions/auth", () => ({
  signUpAction: vi.fn().mockResolvedValue({ error: null }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("SignupPage", () => {
  it("submits a signup request", async () => {
    const signUpAction = vi.mocked(authActions.signUpAction);
    render(<SignupPage />);

    await userEvent.type(screen.getByLabelText("Full Name"), "Ada Lovelace");
    await userEvent.type(screen.getByLabelText("Email"), "ada@example.com");
    await userEvent.type(screen.getByLabelText("Password"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(signUpAction).toHaveBeenCalledTimes(1);
    });

    expect(signUpAction).toHaveBeenCalledWith({
      email: "ada@example.com",
      password: "password123",
      fullName: "Ada Lovelace",
    });
    expect(push).toHaveBeenCalledWith("/login");
  });
});
