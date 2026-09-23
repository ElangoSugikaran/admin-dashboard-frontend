import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FolderKanban, 
  MessageSquare, 
  Eye, 
  Award 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const stats = [
  {
    title: 'Total Projects',
    value: '12',
    icon: FolderKanban,
    description: '+2 from last month',
  },
  {
    title: 'Unread Messages',
    value: '4',
    icon: MessageSquare,
    description: '2 new today',
  },
  {
    title: 'Profile Views',
    value: '1,234',
    icon: Eye,
    description: '+15% from last month',
  },
  {
    title: 'Certifications',
    value: '5',
    icon: Award,
    description: '1 expiring soon',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's a quick summary of your portfolio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Recent changes across your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {/* Mock Activity List */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-background">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  </span>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Updated project "E-commerce Platform"
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Added new screenshots and updated tech stack
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm text-muted-foreground">
                    Just now
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to do
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button render={<Link to="/projects" />} className="w-full justify-start" variant="outline">
              <FolderKanban className="mr-2 h-4 w-4" />
              Add New Project
            </Button>
            <Button render={<Link to="/messages" />} className="w-full justify-start" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Check Messages
            </Button>
            <Button render={<Link to="/settings" />} className="w-full justify-start" variant="outline">
              <Award className="mr-2 h-4 w-4" />
              Update Resume
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
