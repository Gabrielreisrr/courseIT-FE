"use client";

import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";

import { CourseCard } from "@/components/course-card";
import { coursesApi, enrollmentsApi, modulesApi, lessonsApi } from "@/lib/api";
import { Course, Enrollment } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const coursesRes = await coursesApi.getAllCourses();
      const enrollmentsRes = await enrollmentsApi.getMyEnrollments();

      if (!coursesRes.data) {
        setCourses([]);
        setLoading(false);
        return;
      }

      const coursesData = Array.isArray(coursesRes.data.data)
        ? coursesRes.data.data
        : Array.isArray(coursesRes.data)
        ? coursesRes.data
        : [];

      const coursesWithModules = await Promise.all(
        coursesData.map(async (course) => {
          const modulesRes = await modulesApi.getModulesByCourse(course.id);
          const modules = Array.isArray(modulesRes.data?.data)
            ? modulesRes.data.data
            : Array.isArray(modulesRes.data)
            ? modulesRes.data
            : [];
          const modulesWithLessons = await Promise.all(
            modules.map(async (module) => {
              const lessonsRes = await lessonsApi.getLessonsByModule(module.id);
              const lessons = Array.isArray(lessonsRes.data?.data)
                ? lessonsRes.data.data
                : Array.isArray(lessonsRes.data)
                ? lessonsRes.data
                : [];
              return {
                ...module,
                lessons: lessons,
              };
            })
          );
          return {
            ...course,
            modules: modulesWithLessons,
          };
        })
      );
      setCourses(coursesWithModules);

      if (enrollmentsRes.data) {
        const enrollmentsData = Array.isArray(enrollmentsRes.data.data)
          ? enrollmentsRes.data.data
          : Array.isArray(enrollmentsRes.data)
          ? enrollmentsRes.data
          : [];
        setEnrollments(enrollmentsData);
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    );

    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Courses</h1>
        <p className="text-muted-foreground mt-1">
          Browse our collection of courses to start your learning journey.
        </p>
      </header>

      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const enrollment = enrollments.find(
              (e) => e.courseId === course.id
            );

            let progressValue = 0;
            if (enrollment?.progress) {
              if (typeof enrollment.progress === "number") {
                progressValue = enrollment.progress;
              } else if (
                typeof enrollment.progress === "object" &&
                enrollment.progress &&
                "progressPercentage" in enrollment.progress
              ) {
                progressValue = (enrollment.progress as any).progressPercentage;
              }
            }

            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={progressValue}
              />
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try a different search term or check back later for new courses."
              : "We don't have any courses available at the moment. Please check back later."}
          </p>
        </div>
      )}
    </div>
  );
}
