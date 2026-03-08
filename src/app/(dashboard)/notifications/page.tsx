'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Check, CheckCheck, UserPlus, MessageSquare, Calendar, Target, Trash2 } from 'lucide-react'

interface Notification {
  id: string
  type: 'task_assigned' | 'circle_invite' | 'comment' | 'deadline' | 'goal_update'
  title: string
  message: string
  is_read: boolean
  created_at: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    setNotifications([
      { id: '1', type: 'task_assigned', title: 'New Task Assigned', message: 'You have been assigned to "Complete project proposal"', is_read: false, created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: '2', type: 'circle_invite', title: 'Circle Invite', message: 'John Doe invited you to join "Product Team"', is_read: false, created_at: new Date(Date.now() - 7200000).toISOString() },
      { id: '3', type: 'comment', title: 'New Comment', message: 'Sarah commented on your task "Review PRs"', is_read: true, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: '4', type: 'deadline', title: 'Deadline Approaching', message: 'Task "Send weekly report" is due tomorrow', is_read: true, created_at: new Date(Date.now() - 172800000).toISOString() },
      { id: '5', type: 'goal_update', title: 'Goal Progress', message: 'Q4 Product Launch is now 75% complete', is_read: true, created_at: new Date(Date.now() - 259200000).toISOString() },
    ])
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <Bell className="h-4 w-4 text-blue-500" />
      case 'circle_invite': return <UserPlus className="h-4 w-4 text-green-500" />
      case 'comment': return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'deadline': return <Calendar className="h-4 w-4 text-red-500" />
      case 'goal_update': return <Target className="h-4 w-4 text-orange-500" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const formatTime = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return then.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your activity</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {notifications.map(notification => (
          <Card key={notification.id} className={notification.is_read ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.is_read && <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{formatTime(notification.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!notification.is_read && (
                    <Button variant="ghost" size="icon" onClick={() => markAsRead(notification.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => deleteNotification(notification.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {notifications.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

