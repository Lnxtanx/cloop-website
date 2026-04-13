import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Star, Send, CheckCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://api.cloopapp.com";

export default function Feedback() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [category, setCategory] = useState("general");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getUserId = (): number | null => {
    try {
      const token = localStorage.getItem("cloop_token");
      if (!token) return null;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id || payload.userId || payload.id || null;
    } catch {
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating || !feedback.trim()) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("cloop_token");
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: getUserId(),
          rating,
          feedback: feedback.trim(),
          category,
        }),
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <DashboardLayout title="Feedback">
        <div className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">Your feedback helps us improve Cloop.</p>
            <Button onClick={() => navigate("/dashboard")} className="hero-gradient border-0">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Feedback">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-purple-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">We'd love your feedback!</h2>
          <p className="text-gray-600 mb-6">Help us make Cloop better for everyone.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">How was your experience?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-purple-300 bg-purple-50 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
              >
                <option value="general">💬 General Feedback</option>
                <option value="feature">✨ Feature Request</option>
                <option value="bug">🐛 Bug Report</option>
                <option value="improvement">🔧 Improvement Suggestion</option>
              </select>
            </div>

            {/* Feedback Text */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Your Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us what you think..."
                rows={5}
                className="w-full px-4 py-2.5 rounded-lg border border-purple-300 bg-purple-50 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !rating || !feedback.trim()}
              className="w-full hero-gradient border-0 gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
