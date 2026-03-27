import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock, CheckCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

const chapters = [
  { id: 1, title: "Getting Started with Python", desc: "Variables, data types, and basic operations", lessons: 6, completed: 6, status: "completed" as const },
  { id: 2, title: "Control Flow & Loops", desc: "If/else statements, for loops, while loops", lessons: 8, completed: 8, status: "completed" as const },
  { id: 3, title: "Functions & Modules", desc: "Defining functions, importing modules, scope", lessons: 7, completed: 4, status: "in-progress" as const },
  { id: 4, title: "Data Structures", desc: "Lists, tuples, dictionaries, and sets", lessons: 10, completed: 0, status: "locked" as const },
  { id: 5, title: "Object-Oriented Programming", desc: "Classes, objects, inheritance, polymorphism", lessons: 9, completed: 0, status: "locked" as const },
  { id: 6, title: "File Handling & Exceptions", desc: "Reading/writing files, try/except blocks", lessons: 6, completed: 0, status: "locked" as const },
  { id: 7, title: "Working with APIs", desc: "HTTP requests, JSON parsing, REST APIs", lessons: 5, completed: 0, status: "locked" as const },
  { id: 8, title: "Final Project", desc: "Build a complete Python application", lessons: 4, completed: 0, status: "locked" as const },
];

const statusConfig = {
  completed: { label: "Completed", icon: CheckCircle, color: "bg-success/10 text-success" },
  "in-progress": { label: "In Progress", icon: Play, color: "bg-primary/10 text-primary" },
  locked: { label: "Locked", icon: Lock, color: "bg-muted text-muted-foreground" },
};

const Chapters = () => (
  <DashboardLayout title="Chapters">
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Introduction to Python
        </h2>
        <p className="text-muted-foreground mt-1">24 lessons · 8 chapters · Beginner level</p>
        <Progress value={58} className="h-2 mt-4 max-w-sm" />
        <p className="text-sm text-muted-foreground mt-1">58% complete · 14 of 24 lessons done</p>
      </div>

      <div className="space-y-3">
        {chapters.map((ch, i) => {
          const cfg = statusConfig[ch.status];
          const progress = ch.lessons > 0 ? (ch.completed / ch.lessons) * 100 : 0;
          return (
            <Card key={ch.id} className={`border-border transition-shadow ${ch.status !== "locked" ? "hover:shadow-md cursor-pointer" : "opacity-70"}`}>
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${ch.status === "in-progress" ? "hero-gradient" : ch.status === "completed" ? "bg-success/10" : "bg-muted"}`}>
                  <span className={`text-sm font-bold ${ch.status === "in-progress" ? "text-primary-foreground" : ch.status === "completed" ? "text-success" : "text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm">{ch.title}</h4>
                    <Badge variant="secondary" className={`text-[10px] ${cfg.color}`}>{cfg.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{ch.desc}</p>
                  {ch.status !== "locked" && (
                    <div className="flex items-center gap-3 mt-2">
                      <Progress value={progress} className="h-1.5 flex-1 max-w-[200px]" />
                      <span className="text-xs text-muted-foreground">{ch.completed}/{ch.lessons}</span>
                    </div>
                  )}
                </div>
                {ch.status === "in-progress" && (
                  <Button size="sm" className="hero-gradient border-0 shrink-0">Continue</Button>
                )}
                {ch.status === "completed" && (
                  <Button size="sm" variant="outline" className="shrink-0">Review</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  </DashboardLayout>
);

export default Chapters;
