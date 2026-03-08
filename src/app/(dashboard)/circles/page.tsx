'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Users, Plus, Copy, Check, UserPlus } from 'lucide-react'

interface Circle {
  id: string
  name: string
  description: string
  member_count: number
  role: 'owner' | 'admin' | 'member'
  invite_code: string
  created_at: string
}

export default function CirclesPage() {
  const [circles, setCircles] = useState<Circle[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newCircle, setNewCircle] = useState({ name: '', description: '' })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    setCircles([
      {
        id: '1',
        name: 'Product Team',
        description: 'Product development team',
        member_count: 5,
        role: 'owner',
        invite_code: 'ABC12345',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Design Squad',
        description: 'UI/UX designers',
        member_count: 3,
        role: 'admin',
        invite_code: 'DEF67890',
        created_at: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Marketing',
        description: 'Marketing team',
        member_count: 4,
        role: 'member',
        invite_code: 'GHI11111',
        created_at: new Date().toISOString(),
      },
    ])
  }, [])

  const handleCreateCircle = () => {
    if (!newCircle.name.trim()) {
      return
    }

    const circle: Circle = {
      id: Date.now().toString(),
      name: newCircle.name.trim(),
      description: newCircle.description.trim(),
      member_count: 1,
      role: 'owner',
      invite_code: Math.random().toString(36).substring(2, 10).toUpperCase(),
      created_at: new Date().toISOString(),
    }

    setCircles((prev) => [...prev, circle])
    setIsCreateOpen(false)
    setNewCircle({ name: '', description: '' })
  }

  const copyInviteCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      setCopiedCode(null)
    }
  }

  const getRoleBadge = (role: Circle['role']) => {
    switch (role) {
      case 'owner':
        return <Badge variant="default">Owner</Badge>
      case 'admin':
        return <Badge variant="secondary">Admin</Badge>
      case 'member':
        return <Badge variant="outline">Member</Badge>
      default:
        return <Badge>{role}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Circles</h1>
          <p className="text-muted-foreground">
            Manage your focus circles and collaborations
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Circle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Circle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Circle Name</label>
                <Input
                  value={newCircle.name}
                  onChange={(e) =>
                    setNewCircle({ ...newCircle, name: e.target.value })
                  }
                  placeholder="Enter circle name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={newCircle.description}
                  onChange={(e) =>
                    setNewCircle({ ...newCircle, description: e.target.value })
                  }
                  placeholder="Circle description"
                />
              </div>
              <Button onClick={handleCreateCircle} className="w-full">
                Create Circle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {circles.map((circle) => (
          <Card key={circle.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{circle.name}</CardTitle>
                  <CardDescription>{circle.description}</CardDescription>
                </div>
                {getRoleBadge(circle.role)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {circle.member_count} members
                </div>

                <div className="flex items-center space-x-2">
                  <Input value={circle.invite_code} readOnly className="text-xs font-mono" />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyInviteCode(circle.invite_code)}
                  >
                    {copiedCode === circle.invite_code ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={`/circles/${circle.id}`}>View</a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {circles.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No circles yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first circle to start collaborating
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Circle
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
