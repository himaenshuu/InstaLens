import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./theme-toggle";
import {
  Search,
  BarChart3,
  Users,
  TrendingUp,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Star,
  Zap,
  Shield,
  Globe,
} from "lucide-react";
import {
  ContactFormData,
  submitContactForm,
  createEmptyContactForm,
} from "../services/contactService";
import { FeedbackForm } from "./FeedbackForm";
import { TestimonialCarousel } from "./TestimonialCarousel";
import { BackToTop } from "./BackToTop";
import { useTypingEffect } from "../hooks/useTypingEffect";

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [contactForm, setContactForm] = useState<ContactFormData>(
    createEmptyContactForm()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Typing effect for hero section
  const typedText = useTypingEffect("Unlock Influencer Insights", 80, 300);

  const handleContactFormChange = (
    field: keyof ContactFormData,
    value: string
  ) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const scrollToFeedback = () => {
    const feedbackSection = document.getElementById("feedback");
    feedbackSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const success = await submitContactForm(contactForm);

    if (success) {
      // Reset form after successful submission
      setContactForm(createEmptyContactForm());
    }

    setIsSubmitting(false);
  };
  const features = [
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-600" />,
      title: "Real-time Instagram Scraping",
      description:
        "Instantly scrape any public Instagram profile for live data including posts, reels, follower counts, and engagement metrics.",
    },
    {
      icon: <Users className="h-8 w-8 text-green-600" />,
      title: "Audience Demographics",
      description:
        "Understand your audience with detailed demographic breakdowns including age, gender, and geographic distribution.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      title: "Trend Analysis",
      description:
        "Track content performance trends and identify what types of posts generate the most engagement over time.",
    },
    {
      icon: <Instagram className="h-8 w-8 text-pink-600" />,
      title: "Fresh Data Every Search",
      description:
        "No stale data - every search triggers a new scrape to ensure you get the most current profile information and content.",
    },
  ];

  const services = [
    {
      title: "Influencer Analytics",
      description:
        "Comprehensive analysis of influencer profiles with real-time data",
      price: "Free",
      features: [
        "Live engagement metrics",
        "Audience demographics",
        "Content analysis",
        "Performance tracking",
      ],
    },
    {
      title: "Brand Partnerships",
      description:
        "Connect brands with the right influencers for maximum impact",
      price: "Contact Us",
      features: [
        "Influencer matching",
        "Campaign management",
        "ROI tracking",
        "Custom reports",
      ],
    },
    {
      title: "Enterprise Solutions",
      description: "Advanced analytics and insights for large-scale operations",
      price: "Custom",
      features: [
        "API access",
        "Custom dashboards",
        "White-label solutions",
        "Dedicated support",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-blue-950/30 dark:to-indigo-950/20 relative overflow-hidden scroll-smooth">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-40 left-1/3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-1100"></div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-white/20 bg-white/10 dark:bg-black/10 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                InstaLens
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-muted-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105"
              >
                Features
              </a>
              <a
                href="#services"
                className="text-muted-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105"
              >
                Services
              </a>
              <a
                href="#about"
                className="text-muted-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105"
              >
                About
              </a>
              <a
                href="#testimonials"
                className="text-muted-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105"
              >
                Testimonials
              </a>
              <a
                href="#contact"
                className="text-muted-foreground/80 hover:text-foreground transition-all duration-300 hover:scale-105"
              >
                Contact
              </a>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                onClick={onLogin}
                variant="outline"
                className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20 text-purple-700 dark:text-purple-300 backdrop-blur-sm shadow-lg shadow-purple-500/10 animate-fade-in">
              <Zap className="h-3 w-3 mr-1 animate-pulse" />
              Real-time Instagram Scraping • Powered by Apify
            </Badge>

            <h1 className="text-4xl md:text-7xl font-bold mb-6 min-h-[120px] md:min-h-[180px]">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 animate-gradient bg-clip-text text-transparent">
                {typedText}
                <span className="typing-cursor">|</span>
              </span>
            </h1>

            <p className="text-xl text-muted-foreground/80 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Get instant access to Instagram profile data through real-time
              scraping. Analyze engagement metrics, audience demographics, and
              content performance with fresh data every time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
              <Button
                onClick={onLogin}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
              >
                <Search className="h-5 w-5 mr-2" />
                Start Analyzing Now
              </Button>
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 text-lg px-8 py-6"
                onClick={() => {
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="pt-12 pb-20 px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto">
              Everything you need to analyze and understand influencer
              performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border border-white/20 shadow-2xl shadow-purple-500/10 bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-3xl transition-all duration-500 hover:shadow-purple-500/30 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 group relative overflow-hidden"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                {/* Glow effect that follows cursor */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 animate-gradient"></div>
                </div>

                <CardHeader className="text-center relative z-10">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-purple-500/10 group-hover:shadow-purple-500/30">
                    <div className="group-hover:animate-pulse">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <p className="text-muted-foreground/80 text-center leading-relaxed group-hover:text-muted-foreground transition-colors duration-300">
                    {feature.description}
                  </p>
                </CardContent>

                {/* Border glow on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-border animate-gradient"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        className="py-20 px-4 sm:px-6 lg:px-8 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Our Services
            </h2>
            <p className="text-xl text-muted-foreground/80 max-w-2xl mx-auto">
              Choose the perfect plan for your influencer analysis needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card
                key={index}
                className={`border border-white/20 shadow-2xl bg-white/10 dark:bg-black/10 backdrop-blur-xl rounded-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 group ${
                  index === 1
                    ? "shadow-purple-500/20 ring-2 ring-purple-500/30 hover:shadow-purple-500/30"
                    : "shadow-purple-500/10 hover:shadow-purple-500/20"
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-4">
                    <CardTitle className="text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {service.title}
                    </CardTitle>
                    <Badge
                      className={`${
                        index === 1
                          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                          : "bg-white/20 border-white/30 backdrop-blur-sm"
                      }`}
                    >
                      {service.price}
                    </Badge>
                  </div>
                  <CardDescription className="text-muted-foreground/80">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <Star className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground/80">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-6 transition-all duration-300 hover:scale-105 ${
                      index === 1
                        ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-500/25"
                        : "bg-white/20 border-white/30 backdrop-blur-sm hover:bg-white/30"
                    }`}
                  >
                    {index === 0 ? "Get Started" : "Contact Sales"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            About InstaLens
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              InstaLens is a cutting-edge platform that provides real-time
              Instagram analytics and influencer insights. Built with the latest
              web technologies and powered by Apify's robust data scraping
              capabilities, we deliver accurate, up-to-date information about
              influencer performance and audience engagement.
            </p>
            <p>
              Our mission is to democratize access to influencer analytics,
              making it easy for brands, agencies, and content creators to make
              data-driven decisions. Whether you're looking to partner with
              influencers, track your own performance, or understand market
              trends, InstaLens provides the tools you need.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Secure & Reliable</h3>
                <p className="text-sm">
                  Enterprise-grade security with 99.9% uptime guarantee
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Real-time Data</h3>
                <p className="text-sm">
                  Live updates and instant analytics powered by Apify
                </p>
              </div>
              <div className="text-center">
                <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Global Reach</h3>
                <p className="text-sm">
                  Analyze influencers from anywhere in the world
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50/50 to-blue-50/50 dark:from-purple-950/10 dark:to-blue-950/10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied users who trust InstaLens for their
              influencer analytics
            </p>
          </div>

          <TestimonialCarousel onWriteReview={scrollToFeedback} />
        </div>
      </section>

      {/* Feedback Section */}
      <section id="feedback" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              We Value Your Feedback
            </h2>
            <p className="text-xl text-muted-foreground">
              Help us improve InstaLens by sharing your experience
            </p>
          </div>

          <FeedbackForm />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Email Us</h3>
                  <p className="text-muted-foreground">
                    himanshuraj223422@gmail.com
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Call Us</h3>
                  <p className="text-muted-foreground">+91 8709947443</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Visit Us</h3>
                  <p className="text-muted-foreground">
                    IIIT Nagpur, Butibori
                    <br />
                    Nagpur, Maharashtra 441108
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>
                  We'll get back to you within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="First Name"
                      value={contactForm.firstName}
                      onChange={(e) =>
                        handleContactFormChange("firstName", e.target.value)
                      }
                      required
                    />
                    <Input
                      placeholder="Last Name"
                      value={contactForm.lastName}
                      onChange={(e) =>
                        handleContactFormChange("lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <Input
                    placeholder="Email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) =>
                      handleContactFormChange("email", e.target.value)
                    }
                    required
                  />
                  <Input
                    placeholder="Subject"
                    value={contactForm.subject}
                    onChange={(e) =>
                      handleContactFormChange("subject", e.target.value)
                    }
                    required
                  />
                  <textarea
                    className="w-full p-3 border rounded-md min-h-[120px] bg-background"
                    placeholder="Your message..."
                    value={contactForm.message}
                    onChange={(e) =>
                      handleContactFormChange("message", e.target.value)
                    }
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">InstaLens</span>
          </div>
          <p className="text-sm">
            © 2025 InstaLens. All rights reserved. Data powered by Apify
            technology.
          </p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  );
}
