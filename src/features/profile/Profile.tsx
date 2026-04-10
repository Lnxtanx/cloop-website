import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, MapPin, BookOpen, LogOut } from "lucide-react";

interface ProfileSubject {
  subject_id: number;
  subject?: {
    name?: string;
    category?: string;
  };
  completion_percent?: number;
}

interface UserProfile {
  name?: string;
  email?: string;
  location?: string;
  study_goal?: string;
  user_subjects?: ProfileSubject[];
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("cloop_token");
    localStorage.removeItem("cloop_user");
    navigate("/login");
  };

  useEffect(() => {
    const token = localStorage.getItem("cloop_token");
    if (!token) {
      navigate("/login");
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const err = await response.json().catch(() => null);
          throw new Error(err?.error || `Profile fetch failed (${response.status})`);
        }

        const data = await response.json();
        setProfile(data);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to fetch profile data.";
        console.error("Profile fetch error", err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (loading) {
    return (
      <DashboardLayout title="Profile">
        <div className="p-8 text-center">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Profile">
        <div className="p-8 text-center text-red-500">{error}</div>
      </DashboardLayout>
    );
  }

  const name = profile?.name || "John Doe";
  const [firstName, lastName] = name.split(" ");
  const subjects = profile?.user_subjects || [];
  const location = (profile?.location || "").trim() || "Not specified";
  const avatarText = name
    .split(" ")
    .map((w: string) => w.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <DashboardLayout title="Profile">
      <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Profile Header */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="hero-gradient text-primary-foreground text-2xl font-bold">{avatarText || "JD"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{name}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {profile?.email || "N/A"}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {location}</span>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <Badge variant="secondary" className="bg-accent text-accent-foreground gap-1"><BookOpen className="w-3 h-3" /> {subjects.length} Courses</Badge>
              </div>
            </div>
            <Button variant="outline" className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={logout}>
              <LogOut className="w-4 h-4" /> Log Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><input value={firstName || ""} className="mt-1.5 w-full px-3 py-2 border rounded-md bg-gray-50" readOnly /></div>
              <div><Label>Last Name</Label><input value={lastName || ""} className="mt-1.5 w-full px-3 py-2 border rounded-md bg-gray-50" readOnly /></div>
            </div>
            <div><Label>Email</Label><input value={profile?.email || ""} className="mt-1.5 w-full px-3 py-2 border rounded-md bg-gray-50" readOnly /></div>
            <div><Label>Bio</Label><input value={profile?.study_goal || ""} className="mt-1.5 w-full px-3 py-2 border rounded-md bg-gray-50" readOnly /></div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">Enrolled Subjects</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {subjects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No subjects enrolled yet.</p>
            ) : (
              subjects.map((s: ProfileSubject) => (
                <div key={s.subject_id} className="flex items-center justify-between p-2 border border-border rounded-lg">
                  <span>{s.subject?.name || "Unknown Subject"}</span>
                  <span className="text-xs text-muted-foreground">{s.completion_percent ?? 0}% complete</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
);
};

export default Profile;

