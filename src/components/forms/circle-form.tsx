"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createCircleAction, joinCircleAction } from "@/app/actions/circles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { circleSchema } from "@/lib/validators";

const joinSchema = z.object({
  inviteCode: z.string().min(6, "Invite code is required"),
});

export function CircleCreationCard({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof circleSchema>>({
    resolver: zodResolver(circleSchema),
    defaultValues: { name: "", description: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Circle</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await createCircleAction(values);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Circle created");
              form.reset();
              onSuccess?.();
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Growth pod" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Weekly accountability for design, product, or study." />
          </div>
          <Button type="submit" disabled={isPending}>{isPending ? "Creating..." : "Create circle"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function CircleJoinCard({ onSuccess }: { onSuccess?: () => void }) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: { inviteCode: "" },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Join with Invite Code</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await joinCircleAction(values.inviteCode);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Joined circle");
              form.reset();
              onSuccess?.();
            });
          })}
        >
          <div className="space-y-2">
            <Label htmlFor="inviteCode">Invite code</Label>
            <Input id="inviteCode" {...form.register("inviteCode")} placeholder="AB12CD34" />
          </div>
          <Button type="submit" variant="outline" disabled={isPending}>{isPending ? "Joining..." : "Join circle"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
