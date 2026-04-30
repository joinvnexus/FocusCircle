"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Check, CheckCheck, Filter, Bell, Trash2, AlertCircle, MessageSquare, Calendar, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn, formatRelativeTime } from "@/lib/utils";
import { markNotificationsReadAction, deleteNotificationsAction } from "@/app/actions/notifications";
import { useTransition } from "react";

export type NotificationType =
  | "task_assigned"
  | "task_completed"
  | "task_overdue"
  | "mention"
  | "comment"
  | "deadline_alert"
  | "goal_update"
  | "circle_invite"
  | "system";

const NOTIFICATION_TYPES: Record<NotificationType, { label: string; icon: React.ElementType; color: string }> = {
  task_assigned: { label: "Task Assigned", icon: AlertCircle, color: "bg-blue-500" },
  task_completed: { label: "Task Completed", icon: Check, color: "bg-green-500" },
  task_overdue: { label: "Task Overdue", icon: AlertCircle, color: "bg-red-500" },
  mention: { label: "Mention", icon: MessageSquare, color: "bg-purple-500" },
  comment: { label: "Comment", icon: MessageSquare, color: "bg-indigo-500" },
  deadline_alert: { label: "Deadline Alert", icon: Calendar, color: "bg-amber-500" },
  goal_update: { label: "Goal Update", icon: Bell, color: "bg-cyan-500" },
  circle_invite: { label: "Circle Invite", icon: Bell, color: "bg-pink-500" },
  system: { label: "System", icon: Bell, color: "bg-gray-500" },
};

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type?: NotificationType | null;
  data: Record<string, unknown> | null;
}

interface NotificationCenterProps {
  initialNotifications: Notification[];
  onOpenChange?: (open: boolean) => void;
}

export function NotificationCenter({ initialNotifications, onOpenChange }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("all");
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [, startTransition] = useTransition();

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);
  const selectedCount = selectedIds.size;

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const matchesType = filterType === "all" || notif.type === filterType;
      const matchesRead =
        filterRead === "all" ||
        (filterRead === "unread" && !notif.is_read) ||
        (filterRead === "read" && notif.is_read);
      return matchesType && matchesRead;
    });
  }, [notifications, filterType, filterRead]);

  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    filteredNotifications.forEach((notif) => {
      const date = new Date(notif.created_at).toLocaleDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(notif);
    });
    return groups;
  }, [filteredNotifications]);

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    startTransition(async () => {
      const result = await markNotificationsReadAction(unreadIds);
      if (result.error) {
        toast.error(result.error);
      } else {
        setNotifications((prev) => prev.map((n) => (unreadIds.includes(n.id) ? { ...n, is_read: true } : n)));
        toast.success(`Marked ${unreadIds.length} notifications as read`);
      }
    });
  };

  const handleMarkSelectedRead = async () => {
    const selectedArray = Array.from(selectedIds);
    if (selectedArray.length === 0) return;

    startTransition(async () => {
      const result = await markNotificationsReadAction(selectedArray);
      if (result.error) {
        toast.error(result.error);
      } else {
        setNotifications((prev) => prev.map((n) => (selectedArray.includes(n.id) ? { ...n, is_read: true } : n)));
        setSelectedIds(new Set());
        toast.success(`Marked ${selectedArray.length} notifications as read`);
      }
    });
  };

  const handleDeleteSelected = async () => {
    const selectedArray = Array.from(selectedIds);
    if (selectedArray.length === 0) return;

    startTransition(async () => {
      const result = await deleteNotificationsAction(selectedArray);
      if (result.error) {
        toast.error(result.error);
      } else {
        setNotifications((prev) => prev.filter((n) => !selectedArray.includes(n.id)));
        setSelectedIds(new Set());
        toast.success(`Deleted ${selectedArray.length} notifications`);
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedCount === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n) => n.id)));
    }
  };

  const getTypeIcon = (type?: string | null) => {
    const key = (type || "system") as NotificationType;
    return NOTIFICATION_TYPES[key] || NOTIFICATION_TYPES.system;
  };

  useEffect(() => {
    onOpenChange?.(isPopoverOpen);
  }, [isPopoverOpen, onOpenChange]);

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[480px] p-0 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            <p className="text-xs text-muted-foreground">{unreadCount} unread</p>
          </div>
          <div className="flex items-center gap-2">
            {selectedCount > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={handleMarkSelectedRead} className="text-xs h-8">
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Mark read
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDeleteSelected} className="text-xs h-8 text-destructive hover:text-destructive">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
                <Separator orientation="vertical" className="h-6" />
              </>
            )}
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} disabled={unreadCount === 0} className="text-xs h-8">
              Mark all read
            </Button>
          </div>
        </div>

        <div className="border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Checkbox id="select-all" checked={selectedCount === filteredNotifications.length && filteredNotifications.length > 0} onCheckedChange={toggleSelectAll} />
            <label htmlFor="select-all" className="text-xs text-muted-foreground cursor-pointer">
              Select all {filteredNotifications.length}
            </label>
            <Separator orientation="vertical" className="h-4 mx-2" />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] h-7 text-xs">
                <Filter className="h-3 w-3 mr-1" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(NOTIFICATION_TYPES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRead} onValueChange={setFilterRead}>
              <SelectTrigger className="w-[120px] h-7 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[500px]">
          {Object.entries(groupedNotifications).length > 0 ? (
            <div className="py-2">
              {Object.entries(groupedNotifications).map(([date, items]) => (
                <div key={date} className="mb-2">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/50">{date}</div>
                  <div className="space-y-1 p-2">
                    {items.map((notif) => {
                      const typeInfo = getTypeIcon(notif.type || undefined);
                      const Icon = typeInfo.icon;
                      const isSelected = selectedIds.has(notif.id);
                      return (
                        <div
                          key={notif.id}
                          className={cn(
                            "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                            isSelected && "bg-accent",
                            !isSelected && "hover:bg-accent/50"
                          )}
                          onClick={() => {
                            const newSelected = new Set(selectedIds);
                            if (newSelected.has(notif.id)) {
                              newSelected.delete(notif.id);
                            } else {
                              newSelected.add(notif.id);
                            }
                            setSelectedIds(newSelected);
                          }}
                        >
                          <Checkbox checked={isSelected} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <div className={cn("p-1 rounded", typeInfo.color.replace("500", "100"))}>
                                  <Icon className={cn("h-3 w-3", typeInfo.color.replace("100", "500"))} />
                                </div>
                                <div className="font-medium text-sm truncate">{notif.title}</div>
                                {!notif.is_read && <Badge variant="secondary" className="h-4 text-[10px]">
                                  NEW
                                </Badge>}
                              </div>
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {formatRelativeTime(notif.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                            {notif.data && typeof notif.data === "object" && "task_title" in notif.data && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {String((notif.data as Record<string, unknown>).task_title)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <BellOff className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground text-center">No notifications</p>
              <p className="text-xs text-muted-foreground mt-1">You are all caught up!</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

