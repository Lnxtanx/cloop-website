import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, Flame, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const statsCards = [
  { title: "Courses Enrolled", value: "8", icon: BookOpen, change: "+2 this month" },
  { title: "Hours Learned", value: "124", icon: Clock, change: "+12 this week" },
  { title: "Certificates", value: "3", icon: Trophy, change: "1 pending" },
  { title: "Day Streak", value: "15", icon: Flame, change: "Personal best!" },
];

const courses = [
  { title: "Introduction to Python", progress: 75, lessons: 24, completed: 18, category: "Programming" },
  { title: "Data Structures & Algorithms", progress: 45, lessons: 30, completed: 13, category: "Computer Science" },
  { title: "Machine Learning Basics", progress: 20, lessons: 18, completed: 4, category: "AI / ML" },
  { title: "Web Development Bootcamp", progress: 90, lessons: 40, completed: 36, category: "Web Dev" },
];

const upcoming = [
  { title: "Python: Advanced Functions", time: "Today, 3:00 PM", instructor: "Dr. Smith" },
  { title: "DSA: Graph Algorithms", time: "Tomorrow, 10:00 AM", instructor: "Prof. Lee" },
  { title: "ML: Neural Networks Intro", time: "Wed, 2:00 PM", instructor: "Dr. Patel" },
];

const Dashboard = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl font-bold">Welcome back, John! 👋</h2>
          <p className="text-muted-foreground">Continue your learning journey. You're on a 15-day streak!</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((s) => (
            <Card key={s.title} className="border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{s.title}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                    <p className="text-xs text-primary mt-1">{s.change}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Courses */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Continue Learning</h3>
              <Link to="/dashboard/chapters">
                <Button variant="ghost" size="sm" className="text-primary gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {courses.map((c) => (
                <Card key={c.title} className="border-border hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <span className="text-xs font-medium text-primary bg-accent rounded-full px-2.5 py-0.5">{c.category}</span>
                    <h4 className="font-semibold mt-3 mb-1">{c.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3">{c.completed} / {c.lessons} lessons</p>
                    <Progress value={c.progress} className="h-2" />
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs font-medium text-muted-foreground">{c.progress}% complete</span>
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1">
                        <Play className="w-3 h-3" /> Resume
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Upcoming Sessions</h3>
              <Link to="/dashboard/sessions">
                <Button variant="ghost" size="sm" className="text-primary gap-1">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {upcoming.map((u) => (
                <Card key={u.title} className="border-border">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm">{u.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{u.instructor}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-primary font-medium">{u.time}</span>
                      <Button size="sm" variant="outline" className="h-7 text-xs">Join</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
