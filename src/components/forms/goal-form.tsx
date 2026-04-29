"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { createGoalAction, updateGoalProgressAction } from "@/app/actions/goals";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { goalSchema } from "@/lib/validators";

type GoalFormValues = z.input<typeof goalSchema>;

export function GoalForm({
  circles,
  onSuccess,
}: {
  circles: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      description: "",
      circleId: circles[0]?.id ?? "",
      deadline: "",
      progress: 0,
      completionStatus: false,
    },
  });
  const circleId = useWatch({ control: form.control, name: "circleId" });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => {
            startTransition(async () => {
              const result = await createGoalAction(values);
              if (result.error) {
                toast.error(result.error);
                return;
              }
              toast.success("Goal created");
              form.reset({ title: "", description: "", circleId: circles[0]?.id ?? "", deadline: "", progress: 0, completionStatus: false });
              onSuccess?.();
            });
          })}
        >
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} placeholder="Ship the March milestone" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...form.register("description")} placeholder="Define the goal, expected outcomes, and owner context." />
          </div>
          <div className="space-y-2">
            <Label>Circle</Label>
            <Select value={circleId} onValueChange={(value) => form.setValue("circleId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select circle" />
              </SelectTrigger>
              <SelectContent>
                {circles.map((circle) => (
                  <SelectItem key={circle.id} value={circle.id}>{circle.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline</Label>
            <Input id="deadline" type="date" {...form.register("deadline")} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Create goal"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function GoalProgressInput({ goalId, progress }: { goalId: string; progress: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        max={100}
        defaultValue={progress}
        className="w-24"
        onBlur={(event) => {
          const next = Number(event.target.value);
          startTransition(async () => {
            const result = await updateGoalProgressAction(goalId, next);
            if (result.error) {
              toast.error(result.error);
              event.target.value = String(progress);
              return;
            }
            toast.success("Goal progress updated");
          });
        }}
      />
      <span className="text-xs text-muted-foreground">{isPending ? "Saving..." : "Percent"}</span>
    </div>
  );
}
