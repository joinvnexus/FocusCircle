'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  created_at: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTask, setNewTask] = useState<{
    title: string
    description: string
    priority: Task['priority']
  }>({ title: '', description: '', priority: 'medium' })

  useEffect(() => {
    setTasks([
      { id: '1', title: 'Complete project proposal', description: 'Write Q4 proposal', status: 'in_progress', priority: 'high', due_date: new Date().toISOString(), created_at: new Date().toISOString() },
      { id: '2', title: 'Review pull requests', status: 'todo', priority: 'medium', due_date: new Date(Date.now() + 86400000).toISOString(), created_at: new Date().toISOString() },
      { id: '3', title: 'Update documentation', status: 'todo', priority: 'low', created_at: new Date().toISOString() },
      { id: '4', title: 'Send weekly report', status: 'completed', priority: 'medium', created_at: new Date().toISOString() },
    ])
  }, [])

  const handleCreateTask = () => {
    const task: Task = { id: Date.now().toString(), ...newTask, status: 'todo', created_at: new Date().toISOString() }
    setTasks([...tasks, task])
    setIsCreateOpen(false)
    setNewTask({ title: '', description: '', priority: 'medium' })
  }

  const handleDeleteTask = (id: string) => setTasks(tasks.filter(t => t.id !== id))
  const handleStatusChange = (id: string, status: Task['status']) => setTasks(tasks.map(t => t.id === id ? { ...t, status } : t))

  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress')
  const completedTasks = tasks.filter(t => t.status === 'completed')

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>
      case 'medium': return <Badge variant="secondary">Medium</Badge>
      case 'low': return <Badge variant="outline">Low</Badge>
      default: return <Badge>{priority}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">Manage and track your tasks</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Task</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><label className="text-sm font-medium">Title</label><Input value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} placeholder="Task title" /></div>
              <div><label className="text-sm font-medium">Description</label><Input value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} placeholder="Description" /></div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={newTask.priority}
                  onValueChange={(v) =>
                    setNewTask({ ...newTask, priority: v as Task['priority'] })
                  }
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTask} className="w-full">Create Task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>To Do</span>
              <Badge variant="secondary">{todoTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {todoTasks.map(task => (
              <div key={task.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
                <div className="flex items-center justify-between">
                  {getPriorityBadge(task.priority)}
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v as Task['status'])}>
                    <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-blue-50 dark:bg-blue-950/20">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>In Progress</span>
              <Badge variant="secondary">{inProgressTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {inProgressTasks.map(task => (
              <div key={task.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
                <div className="flex items-center justify-between">
                  {getPriorityBadge(task.priority)}
                  <Select value={task.status} onValueChange={(v) => handleStatusChange(task.id, v as Task['status'])}>
                    <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-50 dark:bg-green-950/20">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Completed</span>
              <Badge variant="secondary">{completedTasks.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {completedTasks.map(task => (
              <div key={task.id} className="p-3 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-sm line-through">{task.title}</h4>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteTask(task.id)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

