"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { requestPasswordResetAction, resetPasswordAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary/5 to-transparent px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>Request a reset link or set a new password after opening the email link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Button
              type="button"
              className="w-full"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await requestPasswordResetAction({ email });
                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("Reset link sent");
                });
              }}
            >
              Email reset link
            </Button>
          </div>
          <div className="space-y-3 border-t pt-6">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const result = await resetPasswordAction({ password });
                  if (result.error) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("Password updated");
                });
              }}
            >
              Update password
            </Button>
          </div>
          <div className="text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">Back to login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
