import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  FeedbackFormData,
  submitFeedback,
  createEmptyFeedbackForm,
} from "../services/feedbackService";

export function FeedbackForm() {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>(
    createEmptyFeedbackForm()
  );
  const [hoveredStar, setHoveredStar] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormChange = (
    field: keyof FeedbackFormData,
    value: string | number
  ) => {
    setFeedbackForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleStarClick = (rating: number) => {
    handleFormChange("rating", rating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await submitFeedback(feedbackForm);

    if (success) {
      // Reset form after successful submission
      setFeedbackForm(createEmptyFeedbackForm());
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Share Your Feedback
        </CardTitle>
        <CardDescription>
          Help us improve by sharing your experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input
                placeholder="Your name"
                value={feedbackForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <Input
                placeholder="your.email@example.com"
                type="email"
                value={feedbackForm.email}
                onChange={(e) => handleFormChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Rating * ({feedbackForm.rating || 0}/5)
            </label>
            <div className="flex gap-2 justify-center md:justify-start">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoveredStar || feedbackForm.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Your Feedback *
            </label>
            <textarea
              className="w-full p-3 border rounded-md min-h-[120px] bg-background resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Tell us about your experience with InstaLens..."
              value={feedbackForm.feedback}
              onChange={(e) => handleFormChange("feedback", e.target.value)}
              required
              minLength={10}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Minimum 10 characters ({feedbackForm.feedback.length}/10)
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
