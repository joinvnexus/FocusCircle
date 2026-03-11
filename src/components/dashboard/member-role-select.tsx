"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateCircleMemberRoleAction } from "@/app/actions/circles";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CircleRole } from "@/types";

export function MemberRoleSelect({
  circleId,
  memberUserId,
  currentRole,
}: {
  circleId: string;
  memberUserId: string;
  currentRole: CircleRole;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={(value) => {
        startTransition(async () => {
          const result = await updateCircleMemberRoleAction(circleId, memberUserId, value as CircleRole);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Role updated");
        });
      }}
      disabled={isPending}
    >
      <SelectTrigger className="w-28">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="owner">Owner</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="member">Member</SelectItem>
      </SelectContent>
    </Select>
  );
}
