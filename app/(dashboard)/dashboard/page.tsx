"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  Loader2,
  Users,
  BookOpen,
  LayoutDashboard,
  FileText,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CourseCard } from "@/components/course-card";
import { coursesApi, enrollmentsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Course, Enrollment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all courses
        const coursesResponse = await coursesApi.getAllCourses();

        // Fetch user enrollments if user is a student
        const enrollmentsResponse =
          user?.role === "STUDENT"
            ? await enrollmentsApi.getMyEnrollments()
            : { data: { data: [] } };

        if (coursesResponse.data) {
          setCourses(coursesResponse.data.data || []);
        }

        if (enrollmentsResponse.data) {
          setEnrollments(enrollmentsResponse.data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Filter enrolled courses for students
  const enrolledCourses = courses.filter((course) =>
    enrollments.some((enrollment) => enrollment.courseId === course.id)
  );

  // For admin, show different dashboard
  const isAdmin = user?.role === "ADMIN";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            Hello, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin
              ? "Manage your platform and content."
              : "Here's an overview of your learning journey."}
          </p>
        </header>

        {isAdmin ? (
          <AdminDashboard courses={courses} />
        ) : (
          <StudentDashboard
            courses={courses}
            enrolledCourses={enrolledCourses}
            enrollments={enrollments}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

interface StudentDashboardProps {
  courses: Course[];
  enrolledCourses: Course[];
  enrollments: Enrollment[];
}

function StudentDashboard({
  courses,
  enrolledCourses,
  enrollments,
}: StudentDashboardProps) {
  return (
    <div className="space-y-10">
      {/* Enrolled Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Your Courses</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses/my" className="flex items-center">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.slice(0, 3).map((course) => {
              // Find enrollment to get progress
              const enrollment = enrollments.find(
                (e) => e.courseId === course.id
              );
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  progress={enrollment?.progress || 0}
                />
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2">
              Youre not enrolled in any courses yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Browse our course catalog and start your learning journey today!
            </p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </div>
        )}
      </section>

      {/* All Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recommended Courses</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses" className="flex items-center">
              View all <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses
            .filter(
              (course) => !enrolledCourses.some((ec) => ec.id === course.id)
            )
            .slice(0, 3)
            .map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
        </div>
      </section>
    </div>
  );
}

interface AdminDashboardProps {
  courses: Course[];
}

function AdminDashboard({ courses }: AdminDashboardProps) {
  return (
    <div className="space-y-10">
      {/* Quick Stats */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card shadow-sm p-6 rounded-lg border">
            <h3 className="text-muted-foreground text-sm font-medium">
              Total Courses
            </h3>
            <p className="text-3xl font-bold mt-2">{courses.length}</p>
          </div>

          <div className="bg-card shadow-sm p-6 rounded-lg border">
            <h3 className="text-muted-foreground text-sm font-medium">
              Total Users
            </h3>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>

          <div className="bg-card shadow-sm p-6 rounded-lg border">
            <h3 className="text-muted-foreground text-sm font-medium">
              Total Enrollments
            </h3>
            <p className="text-3xl font-bold mt-2">--</p>
          </div>
        </div>
      </section>

      {/* Admin Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Manage Users",
              href: "/admin/users",
              icon: <Users className="h-5 w-5" />,
            },
            {
              title: "Manage Courses",
              href: "/admin/courses",
              icon: <BookOpen className="h-5 w-5" />,
            },
            {
              title: "Manage Modules",
              href: "/admin/modules",
              icon: <LayoutDashboard className="h-5 w-5" />,
            },
            {
              title: "Manage Lessons",
              href: "/admin/lessons",
              icon: <FileText className="h-5 w-5" />,
            },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-card shadow-sm p-6 rounded-lg border hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-primary/10 text-primary">
                  {action.icon}
                </div>
                <h3 className="font-medium">{action.title}</h3>
                <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Courses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Recent Courses</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/courses">Manage All Courses</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.slice(0, 3).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}
