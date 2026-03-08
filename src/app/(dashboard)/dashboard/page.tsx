'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  formatRelativeTime,
  getPriorityColor,
  getStatusColor,
} from '@/lib/utils'
import {
  CheckSquare,
  Users,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date?: string
}

interface Circle {
  id: string
  name: string
}

interface Activity {
  id: string
  type: string
  description: string
  created_at: string
}

export default function DashboardPage() {
  const { appUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [circles, setCircles] = useState<Circle[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState({
    completedThisWeek: 0,
    totalTasks: 0,
    pendingTasks: 0,
    activeCircles: 0,
  })

  useEffect(() => {
    setTasks([
      {
        id: '1',
        title: 'Complete project proposal',
        status: 'in_progress',
        priority: 'high',
        due_date: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Review pull requests',
        status: 'todo',
        priority: 'medium',
        due_date: new Date(Date.now() + 86400000).toISOString(),
      },
      {
        id: '3',
        title: 'Update documentation',
        status: 'todo',
        priority: 'low',
      },
    ])

    setCircles([
      { id: '1', name: 'Product Team' },
      { id: '2', name: 'Design Squad' },
    ])

    setActivities([
      {
        id: '1',
        type: 'task_completed',
        description: 'John completed "Setup development environment"',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: '2',
        type: 'member_joined',
        description: 'Sarah joined Product Team',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: '3',
        type: 'goal_created',
        description: 'New goal: Q4 Launch',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ])

    setStats({
      completedThisWeek: 12,
      totalTasks: 24,
      pendingTasks: 15,
      activeCircles: 2,
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {appUser?.full_name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your tasks today.
          </p>
        </div>
        <Link href="/tasks">
          <Button>
            <CheckSquare className="mr-2 h-4 w-4" />
            View All Tasks
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Completed This Week"
          value={stats.completedThisWeek}
          icon={<CheckSquare className="h-5 w-5 text-green-500" />}
          trend="+3 from last week"
        />
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          icon={<CheckSquare className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title="Active Circles"
          value={stats.activeCircles}
          icon={<Users className="h-5 w-5 text-purple-500" />}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s Tasks</CardTitle>
            <Link
              href="/tasks"
              className="text-sm text-primary hover:underline flex items-center"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No tasks for today
                </p>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          task.status === 'completed'
                            ? 'bg-green-500'
                            : task.status === 'in_progress'
                              ? 'bg-blue-500'
                              : 'bg-gray-300'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{task.title}</p>
                        {task.due_date && (
                          <p className="text-xs text-muted-foreground">
                            Due {formatRelativeTime(task.due_date)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Link href="/circles" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {activity.type === 'task_completed'
                        ? 'OK'
                        : activity.type === 'member_joined'
                          ? '+'
                          : '*'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Your Circles</CardTitle>
            <Link href="/circles">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {circles.length === 0 ? (
                <div className="text-center py-6">
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No circles yet
                  </p>
                  <Link href="/circles">
                    <Button size="sm">Create Circle</Button>
                  </Link>
                </div>
              ) : (
                circles.map((circle) => (
                  <div
                    key={circle.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{circle.name}</p>
                        <p className="text-xs text-muted-foreground">Active now</p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Goals Progress</CardTitle>
            <Link href="/goals">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <GoalProgress title="Q4 Product Launch" progress={75} />
              <GoalProgress title="Design System v2" progress={45} />
              <GoalProgress title="User Research" progress={90} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  trend,
}: {
  title: string
  value: number
  icon: React.ReactNode
  trend?: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend && (
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {trend}
              </p>
            )}
          </div>
          <div className="p-3 bg-muted rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function GoalProgress({ title, progress }: { title: string; progress: number }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{progress}%</p>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
