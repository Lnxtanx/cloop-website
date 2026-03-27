import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Calendar, Clock, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const upcomingSessions = [
  { id: 1, title: "Python: Advanced Functions", instructor: "Dr. Sarah Smith", date: "Today", time: "3:00 PM - 4:00 PM", attendees: 45, status: "live" as const },
  { id: 2, title: "DSA: Graph Algorithms", instructor: "Prof. James Lee", date: "Tomorrow", time: "10:00 AM - 11:30 AM", attendees: 32, status: "upcoming" as const },
  { id: 3, title: "ML: Neural Networks Intro", instructor: "Dr. Anita Patel", date: "Wed, Mar 29", time: "2:00 PM - 3:30 PM", attendees: 58, status: "upcoming" as const },
  { id: 4, title: "Web Dev: React Hooks Deep Dive", instructor: "Mark Anderson", date: "Thu, Mar 30", time: "11:00 AM - 12:00 PM", attendees: 28, status: "upcoming" as const },
];

const pastSessions = [
  { id: 5, title: "Python: Basics Recap", instructor: "Dr. Sarah Smith", date: "Mar 24", time: "3:00 PM", attendees: 52, duration: "1h 05m" },
  { id: 6, title: "DSA: Sorting Algorithms", instructor: "Prof. James Lee", date: "Mar 23", time: "10:00 AM", attendees: 41, duration: "1h 28m" },
  { id: 7, title: "ML: Intro to Regression", instructor: "Dr. Anita Patel", date: "Mar 22", time: "2:00 PM", attendees: 63, duration: "1h 30m" },
];

const Sessions = () => (
  <DashboardLayout title="Sessions">
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Video className="w-6 h-6 text-primary" /> Live Sessions
        </h2>
        <p className="text-muted-foreground mt-1">Join live classes and watch recordings</p>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past Recordings</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-3">
          {upcomingSessions.map((s) => (
            <Card key={s.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${s.status === "live" ? "hero-gradient" : "bg-accent"}`}>
                  <Video className={`w-6 h-6 ${s.status === "live" ? "text-primary-foreground" : "text-accent-foreground"}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{s.title}</h4>
                    {s.status === "live" && <Badge className="hero-gradient border-0 text-[10px]">LIVE NOW</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{s.instructor}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{s.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{s.time}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{s.attendees} enrolled</span>
                  </div>
                </div>
                <Button size="sm" className={s.status === "live" ? "hero-gradient border-0" : ""} variant={s.status === "live" ? "default" : "outline"}>
                  {s.status === "live" ? "Join Now" : "Remind Me"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-3">
          {pastSessions.map((s) => (
            <Card key={s.id} className="border-border">
              <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{s.title}</h4>
                  <p className="text-sm text-muted-foreground">{s.instructor}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{s.date} at {s.time}</span>
                    <span>{s.duration}</span>
                    <span>{s.attendees} attended</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">Watch Recording</Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  </DashboardLayout>
);

export default Sessions;
