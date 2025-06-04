import { coursesApi } from "@/lib/api";

export async function generateStaticParams() {
  try {
    const coursesResponse = await coursesApi.getAllCourses();
    const courses = coursesResponse.data?.data || [];

    return courses.map((course) => ({
      id: course.id,
    }));
  } catch (error) {
    console.error("Error generating static params for courses:", error);
    return [];
  }
}

import CoursePageClient from "./client";

export default function CoursePage() {
  return <CoursePageClient />;
}
