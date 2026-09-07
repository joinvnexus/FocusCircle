"use client";

import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface WeeklyDayData {
  day: string;
  completed: number;
  tasks?: { id: string; title: string }[];
}

export function WeeklyTasksChart({ data }: { data: WeeklyDayData[] }) {
  const [selectedDay, setSelectedDay] = useState<WeeklyDayData | null>(null);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() =>
            downloadCsv(
              "weekly-productivity.csv",
              [["Day", "Completed"], ...data.map((item) => [item.day, item.completed])],
            )
          }
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar
              dataKey="completed"
              radius={[10, 10, 0, 0]}
              fill="var(--chart-1)"
              className="cursor-pointer"
              onClick={(entry: { payload?: WeeklyDayData }) => {
                const day = entry?.payload;
                if (day && day.completed > 0) {
                  setSelectedDay(day);
                }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-center text-xs text-muted-foreground">Click a bar to see which tasks were completed that day.</p>

      <Dialog open={selectedDay !== null} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDay?.day} — {selectedDay?.completed} completed</DialogTitle>
          </DialogHeader>
          <ul className="space-y-2">
            {selectedDay?.tasks?.length ? (
              selectedDay.tasks.map((task) => (
                <li key={task.id} className="rounded-lg border px-3 py-2 text-sm">
                  {task.title}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted-foreground">No task details available for this day.</li>
            )}
          </ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function GoalProgressChart({ data }: { data: { name: string; progress: number }[] }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() =>
            downloadCsv("goal-progress.csv", [["Goal", "Progress %"], ...data.map((item) => [item.name, item.progress])])
          }
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="progress" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.18} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function TaskPriorityChart({ data }: { data: { priority: string; count: number }[] }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={() =>
            downloadCsv("task-priority-mix.csv", [["Priority", "Count"], ...data.map((item) => [item.priority, item.count])])
          }
        >
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.25} />
            <XAxis
              dataKey="priority"
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => String(value).replace("_", " ")}
            />
            <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="var(--chart-3)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
