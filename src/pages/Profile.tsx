import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, MapPin, BookOpen, Trophy, Flame, Edit } from "lucide-react";

const achievements = [
  { title: "Fast Learner", desc: "Complete 10 lessons in one day", earned: true },
  { title: "Streak Master", desc: "Maintain a 7-day streak", earned: true },
  { title: "Quiz Champion", desc: "Score 100% on 5 quizzes", earned: true },
  { title: "Social Butterfly", desc: "Attend 10 live sessions", earned: false },
  { title: "Completionist", desc: "Finish an entire course", earned: false },
];

const Profile = () => (
  <DashboardLayout title="Profile">
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Profile Header */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="hero-gradient text-primary-foreground text-2xl font-bold">JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">John Doe</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> john@example.com</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> San Francisco, CA</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary" className="bg-accent text-accent-foreground gap-1"><BookOpen className="w-3 h-3" /> 8 Courses</Badge>
                <Badge variant="secondary" className="bg-accent text-accent-foreground gap-1"><Trophy className="w-3 h-3" /> 3 Certificates</Badge>
                <Badge variant="secondary" className="bg-accent text-accent-foreground gap-1"><Flame className="w-3 h-3" /> 15 Day Streak</Badge>
              </div>
            </div>
            <Button variant="outline" className="gap-2"><Edit className="w-4 h-4" /> Edit Profile</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input value="John" className="mt-1.5" readOnly /></div>
              <div><Label>Last Name</Label><Input value="Doe" className="mt-1.5" readOnly /></div>
            </div>
            <div><Label>Email</Label><Input value="john@example.com" className="mt-1.5" readOnly /></div>
            <div><Label>Bio</Label><Input value="Passionate learner exploring CS and AI" className="mt-1.5" readOnly /></div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Achievements</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((a) => (
              <div key={a.title} className={`flex items-center gap-3 p-3 rounded-lg ${a.earned ? "bg-accent" : "bg-muted/50 opacity-60"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${a.earned ? "hero-gradient" : "bg-muted"}`}>
                  <Trophy className={`w-4 h-4 ${a.earned ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                {a.earned && <Badge className="ml-auto hero-gradient border-0 text-[10px]">Earned</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
);

export default Profile;
