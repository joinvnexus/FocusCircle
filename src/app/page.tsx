import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  Zap, 
  Bell, 
  MessageSquare,
  CheckCircle2,
  ArrowRight
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">FC</span>
            </div>
            <span className="text-xl font-bold">FocusCircle</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Achieve More Together with{" "}
            <span className="text-primary">FocusCircle</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The productivity platform that combines personal task management with seamless team collaboration in private circles.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to boost your productivity and collaboration
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<LayoutDashboard className="h-6 w-6" />}
              title="Personal Dashboard"
              description="View today's tasks, upcoming deadlines, and productivity stats all in one place."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6" />}
              title="Task Management"
              description="Create, organize, and track tasks with priorities, due dates, and completion status."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Focus Circles"
              description="Create private groups for team collaboration with shared tasks and goals."
            />
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Shared Goals"
              description="Set team objectives and track progress with linked tasks and milestones."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Kanban Board"
              description="Visualize work with drag-and-drop columns: Todo, In Progress, Completed."
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6" />}
              title="Smart Notifications"
              description="Stay updated with real-time notifications for assignments, deadlines, and activity."
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              title="Comments & Mentions"
              description="Collaborate on tasks with threaded comments and user mentions."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Activity Feed"
              description="Track all circle activity with a real-time timeline of events."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Analytics"
              description="Visualize productivity with charts showing completion rates and trends."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-muted-foreground">Start free, upgrade when you need more</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For individuals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$0</div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Unlimited personal tasks
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Up to 3 circles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Basic analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    5 members per circle
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full mt-6">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For teams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-4">$9</div>
                <p className="text-sm text-muted-foreground mb-4">per user/month</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Everything in Free
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Unlimited circles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Advanced analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    25 members per circle
                  </li>
                  <li className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                    Priority support
                  </li>
                </ul>
                <Link href="/signup">
                  <Button className="w-full mt-6">Start Free Trial</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">FC</span>
              </div>
              <span className="text-xl font-bold">FocusCircle</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 FocusCircle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card>
      <CardHeader>
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-2">
          {icon}
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
