"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CourseCard } from "@/components/course-card";
import { coursesApi, enrollmentsApi } from "@/lib/api";
import { Course, Enrollment } from "@/lib/types";
import { useAuth } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user enrollments
        const enrollmentsResponse = await enrollmentsApi.getMyEnrollments();

        if (enrollmentsResponse.data && enrollmentsResponse.data.data) {
          const userEnrollments = enrollmentsResponse.data.data;
          setEnrollments(userEnrollments);

          // Fetch details of enrolled courses
          const enrolledCoursesData = await Promise.all(
            userEnrollments.map((enrollment) =>
              coursesApi.getCourseById(enrollment.courseId)
            )
          );

          const courses = enrolledCoursesData
            .filter((response) => response.data)
            .map((response) => response.data!.data);

          setEnrolledCourses(courses);
        }
      } catch (error) {
        console.error("Failed to fetch enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your courses...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
          <p className="text-muted-foreground mt-1">
            Continue learning where you left off.
          </p>
        </header>

        {enrolledCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => {
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
              You're not enrolled in any courses yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Browse our course catalog and start your learning journey today!
            </p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/courses">Explore Courses</Link>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
