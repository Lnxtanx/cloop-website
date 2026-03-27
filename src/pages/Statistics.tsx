import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const weeklyData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 1.8 },
  { day: "Wed", hours: 3.2 },
  { day: "Thu", hours: 2.0 },
  { day: "Fri", hours: 4.1 },
  { day: "Sat", hours: 1.5 },
  { day: "Sun", hours: 2.8 },
];

const monthlyProgress = [
  { week: "W1", score: 65 },
  { week: "W2", score: 72 },
  { week: "W3", score: 78 },
  { week: "W4", score: 85 },
];

const subjectDistribution = [
  { name: "Python", value: 40, color: "hsl(174, 58%, 42%)" },
  { name: "DSA", value: 25, color: "hsl(200, 60%, 50%)" },
  { name: "ML", value: 20, color: "hsl(38, 92%, 50%)" },
  { name: "Web Dev", value: 15, color: "hsl(152, 60%, 45%)" },
];

const summaryCards = [
  { title: "Total Hours", value: "124h", icon: Clock, sub: "17.9h this week" },
  { title: "Avg Score", value: "85%", icon: Target, sub: "+7% from last month" },
  { title: "Lessons Done", value: "156", icon: BarChart3, sub: "12 this week" },
  { title: "Improvement", value: "+23%", icon: TrendingUp, sub: "vs. last month" },
];

const Statistics = () => (
  <DashboardLayout title="Statistics">
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" /> Your Statistics
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((s) => (
          <Card key={s.title} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-primary mt-1">{s.sub}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                  <s.icon className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Weekly Study Hours</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 92%)" />
                <XAxis dataKey="day" fontSize={12} stroke="hsl(210, 10%, 55%)" />
                <YAxis fontSize={12} stroke="hsl(210, 10%, 55%)" />
                <Tooltip />
                <Bar dataKey="hours" fill="hsl(174, 58%, 42%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Monthly Progress Score</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 15%, 92%)" />
                <XAxis dataKey="week" fontSize={12} stroke="hsl(210, 10%, 55%)" />
                <YAxis fontSize={12} stroke="hsl(210, 10%, 55%)" />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="hsl(174, 58%, 42%)" strokeWidth={3} dot={{ r: 5, fill: "hsl(174, 58%, 42%)" }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <CardHeader><CardTitle className="text-base">Time by Subject</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-8">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie data={subjectDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                {subjectDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3">
            {subjectDistribution.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-sm text-muted-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  </DashboardLayout>
);

export default Statistics;
