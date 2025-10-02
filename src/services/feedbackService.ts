import { toast } from "sonner";

export interface FeedbackFormData {
  name: string;
  email: string;
  rating: number;
  feedback: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  feedback: string;
  avatar: string;
  date: string;
}

/**
 * Validates email format using regex
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that all required feedback form fields are filled
 */
export const validateFeedbackForm = (formData: FeedbackFormData): boolean => {
  const { name, email, rating, feedback } = formData;

  if (!name || !email || !feedback) {
    toast.error("Please fill in all fields");
    return false;
  }

  if (rating < 1 || rating > 5) {
    toast.error("Please select a rating between 1 and 5 stars");
    return false;
  }

  if (!validateEmail(email)) {
    toast.error("Please enter a valid email address");
    return false;
  }

  if (feedback.length < 10) {
    toast.error(
      "Please provide more detailed feedback (at least 10 characters)"
    );
    return false;
  }

  return true;
};

/**
 * Creates a mailto link with formatted feedback data
 */
export const createFeedbackMailtoLink = (
  formData: FeedbackFormData
): string => {
  const { name, email, rating, feedback } = formData;

  const stars = "⭐".repeat(rating);
  const emailBody = `New Feedback Received!

Name: ${name}
Email: ${email}
Rating: ${stars} (${rating}/5)

Feedback:
${feedback}`;

  const mailtoLink = `mailto:himanshuraj223422@gmail.com?subject=${encodeURIComponent(
    `InstaLens Feedback - ${rating} Stars from ${name}`
  )}&body=${encodeURIComponent(emailBody)}`;

  return mailtoLink;
};

/**
 * Handles feedback form submission
 */
export const submitFeedback = async (
  formData: FeedbackFormData
): Promise<boolean> => {
  try {
    // Validate form data
    if (!validateFeedbackForm(formData)) {
      return false;
    }

    // Create and open mailto link
    const mailtoLink = createFeedbackMailtoLink(formData);
    window.location.href = mailtoLink;

    // Show success message
    toast.success("Thank you for your feedback!", {
      description: "Your email client will open to send your feedback",
    });

    return true;
  } catch (error) {
    console.error("Feedback submission error:", error);
    toast.error("Failed to submit feedback", {
      description: "Please try again or email us directly",
    });
    return false;
  }
};

/**
 * Creates an empty feedback form object
 */
export const createEmptyFeedbackForm = (): FeedbackFormData => {
  return {
    name: "",
    email: "",
    rating: 0,
    feedback: "",
  };
};

/**
 * Mock testimonials data with mixed Indian and US names
 */
export const mockTestimonials: Testimonial[] = [
  {
    id: "1",
    name: "Priya Sharma",
    location: "Mumbai, India",
    rating: 5,
    feedback:
      "InstaLens transformed how I analyze influencer partnerships. The real-time scraping feature is a game-changer for my marketing campaigns!",
    avatar:
      "https://ui-avatars.com/api/?name=Priya+Sharma&background=6366f1&color=fff",
    date: "2 days ago",
  },
  {
    id: "2",
    name: "Michael Chen",
    location: "San Francisco, USA",
    rating: 5,
    feedback:
      "Best influencer analytics tool I've used. The engagement metrics are incredibly detailed and help me make data-driven decisions.",
    avatar:
      "https://ui-avatars.com/api/?name=Michael+Chen&background=8b5cf6&color=fff",
    date: "5 days ago",
  },
  {
    id: "3",
    name: "Rahul Patel",
    location: "Bangalore, India",
    rating: 4,
    feedback:
      "Great tool for tracking Instagram profiles. The fresh data on every search ensures I always have the latest insights. Highly recommend!",
    avatar:
      "https://ui-avatars.com/api/?name=Rahul+Patel&background=ec4899&color=fff",
    date: "1 week ago",
  },
  {
    id: "4",
    name: "Sarah Johnson",
    location: "New York, USA",
    rating: 5,
    feedback:
      "InstaLens saved me hours of manual research. The audience demographics and trend analysis features are exactly what I needed.",
    avatar:
      "https://ui-avatars.com/api/?name=Sarah+Johnson&background=3b82f6&color=fff",
    date: "3 days ago",
  },
  {
    id: "5",
    name: "Ananya Iyer",
    location: "Chennai, India",
    rating: 5,
    feedback:
      "As a social media manager, this tool is invaluable. The comprehensive analytics help me identify the right influencers for brand collaborations.",
    avatar:
      "https://ui-avatars.com/api/?name=Ananya+Iyer&background=10b981&color=fff",
    date: "4 days ago",
  },
  {
    id: "6",
    name: "David Miller",
    location: "Los Angeles, USA",
    rating: 4,
    feedback:
      "Impressive platform with accurate data. The real-time scraping ensures I'm always working with current information. Love it!",
    avatar:
      "https://ui-avatars.com/api/?name=David+Miller&background=f59e0b&color=fff",
    date: "6 days ago",
  },
  {
    id: "7",
    name: "Sneha Reddy",
    location: "Hyderabad, India",
    rating: 5,
    feedback:
      "This tool has become essential for my influencer marketing agency. The insights are detailed and the interface is very user-friendly.",
    avatar:
      "https://ui-avatars.com/api/?name=Sneha+Reddy&background=ef4444&color=fff",
    date: "1 week ago",
  },
  {
    id: "8",
    name: "Emily Davis",
    location: "Austin, USA",
    rating: 5,
    feedback:
      "InstaLens provides everything I need to evaluate influencer performance. The engagement rate calculations are spot-on!",
    avatar:
      "https://ui-avatars.com/api/?name=Emily+Davis&background=a855f7&color=fff",
    date: "2 weeks ago",
  },
];

/**
 * Get random testimonials for floating display
 */
export const getRandomTestimonials = (count: number = 3): Testimonial[] => {
  const shuffled = [...mockTestimonials].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
