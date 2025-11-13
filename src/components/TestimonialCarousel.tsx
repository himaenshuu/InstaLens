import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { mockTestimonials } from "../services/feedbackService";

interface TestimonialCarouselProps {
  onWriteReview?: () => void;
}

export function TestimonialCarousel({
  onWriteReview,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const itemsPerPage = 3;
  const totalPages = Math.ceil(mockTestimonials.length / itemsPerPage);

  const handlePrevious = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev === totalPages - 1 ? 0 : prev + 1));
  };

  const startIndex = currentIndex * itemsPerPage;
  const visibleTestimonials = mockTestimonials.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <div className="relative">
      {/* Carousel Controls */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20 text-green-700 dark:text-green-300">
            <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
            4.9 Average Rating
          </Badge>
          <Badge className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-700 dark:text-blue-300">
            {mockTestimonials.length}+ Reviews
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            className="rounded-full hover:scale-110 transition-transform"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-1 mx-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? "right" : "left");
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-gradient-to-r from-purple-600 to-blue-600"
                    : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNext}
            className="rounded-full hover:scale-110 transition-transform"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {visibleTestimonials.map((testimonial, index) => (
          <Card
            key={`${testimonial.id}-${currentIndex}`}
            className={`p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-purple-200/50 shadow-lg hover:shadow-xl transition-all duration-500 hover:scale-105 relative overflow-hidden group ${
              direction === "right"
                ? "animate-slide-in-right"
                : "animate-slide-in-left"
            }`}
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {/* Verified Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-700 dark:text-green-300">
                ✓ Verified
              </Badge>
            </div>

            {/* User Info */}
            <div className="flex items-start gap-4 mb-4">
              <div className="relative group-hover:scale-110 transition-transform duration-300">
                <Avatar className="h-14 w-14 border-2 border-purple-200 ring-2 ring-purple-100 dark:ring-purple-900">
                  <AvatarImage
                    src={testimonial.avatar}
                    alt={testimonial.name}
                  />
                  <AvatarFallback>
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-base">{testimonial.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {testimonial.location}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 transition-all duration-300 ${
                        i < testimonial.rating
                          ? "fill-yellow-400 text-yellow-400 group-hover:scale-110"
                          : "text-gray-300"
                      }`}
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="relative">
              <div className="absolute -left-2 -top-2 text-purple-400/20 text-6xl font-serif">
                "
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-6 mb-3 relative z-10">
                {testimonial.feedback}
              </p>
            </div>

            {/* Date */}
            <p className="text-xs text-muted-foreground/60 flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {testimonial.date}
            </p>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-blue-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </Card>
        ))}
      </div>

      {/* Write Review CTA */}
      {onWriteReview && (
        <div className="text-center">
          <Button
            onClick={onWriteReview}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105"
          >
            <Star className="h-4 w-4 mr-2" />
            Write Your Review
          </Button>
        </div>
      )}
    </div>
  );
}
