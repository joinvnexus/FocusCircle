'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Target, Plus, Calendar, Users } from 'lucide-react'

interface Goal {
  id: string
  title: string
  description: string
  progress: number
  deadline?: string
  circle_name: string
  circle_id: string
  task_count: number
  completed_tasks: number
  created_at: string
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', circle_id: '' })

  useEffect(() => {
    setGoals([
      { id: '1', title: 'Q4 Product Launch', description: 'Launch new product features for Q4', progress: 75, deadline: '2024-12-31', circle_name: 'Product Team', circle_id: '1', task_count: 12, completed_tasks: 9, created_at: new Date().toISOString() },
      { id: '2', title: 'Design System v2', description: 'Complete redesign of component library', progress: 45, deadline: '2024-11-30', circle_name: 'Design Squad', circle_id: '2', task_count: 8, completed_tasks: 4, created_at: new Date().toISOString() },
      { id: '3', title: 'User Research', description: 'Complete user interviews and analysis', progress: 90, circle_name: 'Product Team', circle_id: '1', task_count: 5, completed_tasks: 4, created_at: new Date().toISOString() },
      { id: '4', title: 'Marketing Campaign', description: 'Q4 marketing campaign execution', progress: 30, deadline: '2024-12-15', circle_name: 'Marketing', circle_id: '3', task_count: 10, completed_tasks: 3, created_at: new Date().toISOString() },
    ])
  }, [])

  const handleCreateGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      ...newGoal,
      progress: 0,
      circle_name: 'Product Team',
      task_count: 0,
      completed_tasks: 0,
      created_at: new Date().toISOString()
    }
    setGoals([...goals, goal])
    setIsCreateOpen(false)
    setNewGoal({ title: '', description: '', circle_id: '' })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    if (progress >= 25) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">Track progress on shared goals</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create New Goal</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><label className="text-sm font-medium">Goal Title</label><Input value={newGoal.title} onChange={(e) => setNewGoal({...newGoal, title: e.target.value})} placeholder="Enter goal title" /></div>
              <div><label className="text-sm font-medium">Description</label><Input value={newGoal.description} onChange={(e) => setNewGoal({...newGoal, description: e.target.value})} placeholder="Goal description" /></div>
              <Button onClick={handleCreateGoal} className="w-full">Create Goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Total Goals</p><p className="text-2xl font-bold">{goals.length}</p></div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold">{goals.filter(g => g.progress > 0 && g.progress < 100).length}</p></div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Completed</p><p className="text-2xl font-bold">{goals.filter(g => g.progress === 100).length}</p></div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-muted-foreground">Avg Progress</p><p className="text-2xl font-bold">{Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / goals.length)}%</p></div>
              <Progress value={60} className="h-8 w-8" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => (
          <Card key={goal.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div><CardTitle className="text-lg">{goal.title}</CardTitle><CardDescription className="mt-1">{goal.description}</CardDescription></div>
                <Badge variant={goal.progress === 100 ? 'default' : 'secondary'}>{goal.progress === 100 ? 'Complete' : `${goal.progress}%`}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={goal.progress} className={getProgressColor(goal.progress)} />
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground"><Users className="h-4 w-4 mr-1" />{goal.circle_name}</div>
                  {goal.deadline && <div className="flex items-center text-muted-foreground"><Calendar className="h-4 w-4 mr-1" />{new Date(goal.deadline).toLocaleDateString()}</div>}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{goal.completed_tasks}/{goal.task_count} tasks completed</span>
                </div>
                <Button variant="outline" className="w-full" asChild><a href={`/circles/${goal.circle_id}`}>View Details</a></Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {goals.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">Create your first goal to start tracking progress</p>
              <Button onClick={() => setIsCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Create Goal</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

