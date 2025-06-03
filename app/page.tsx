import Link from "next/link";
import { ChevronRight, BookOpen, Trophy, User, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Logo } from "@/components/logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Logo />
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" asChild>
              <Link href="/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-background to-background/90">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Learn anything, <span className="text-indigo-600">anywhere</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-md">
                Expand your skills with our expert-led courses. Learn at your own pace and achieve your goals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" asChild>
                  <Link href="/register">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/courses">Explore Courses</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                <img
                  src="https://images.pexels.com/photos/5428003/pexels-photo-5428003.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Student learning online"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Why Choose CourseIT?</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Our platform is designed to provide you with the best learning experience possible.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
                title: "Extensive Course Library",
                description:
                  "Access a wide range of courses covering technology, business, and more.",
              },
              {
                icon: <Trophy className="h-8 w-8 text-indigo-600" />,
                title: "Achievement Tracking",
                description:
                  "Monitor your progress and earn certificates as you complete courses.",
              },
              {
                icon: <User className="h-8 w-8 text-indigo-600" />,
                title: "Expert Instructors",
                description:
                  "Learn from industry professionals with real-world experience.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-card p-6 rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start learning?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-indigo-100">
            Join thousands of students already learning on our platform.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo />
              <p className="text-sm text-muted-foreground mt-2">
                Learning made simple. © 2025 CourseIT.
              </p>
            </div>
            <div className="flex gap-8">
              <Link href="#" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                Help
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}