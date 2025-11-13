import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Testimonial,
  getRandomTestimonials,
} from "../services/feedbackService";

export function FloatingTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Load initial testimonials
    setTestimonials(getRandomTestimonials(6));

    // Rotate testimonials every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 6);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (testimonials.length === 0) return null;

  // Display 3 testimonials at a time with rotation
  const visibleTestimonials = [
    testimonials[currentIndex % testimonials.length],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length],
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {visibleTestimonials.map((testimonial, index) => (
        <Card
          key={`${testimonial.id}-${currentIndex}-${index}`}
          className="p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 animate-fade-in"
          style={{
            animationDelay: `${index * 0.2}s`,
          }}
        >
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-12 w-12 border-2 border-purple-200">
              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
              <AvatarFallback>
                {testimonial.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{testimonial.name}</h4>
              <p className="text-xs text-muted-foreground">
                {testimonial.location}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < testimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
            <Quote className="h-6 w-6 text-purple-400/30" />
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            "{testimonial.feedback}"
          </p>

          <p className="text-xs text-muted-foreground/60">{testimonial.date}</p>
        </Card>
      ))}
    </div>
  );
}
