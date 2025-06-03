import { coursesApi } from "@/lib/api";

// Generate static parameters for all courses
export async function generateStaticParams() {
  try {
    // Fetch all courses
    const coursesResponse = await coursesApi.getAllCourses();
    const courses = coursesResponse.data?.data || [];
    
    // Return an array of params objects, each containing a course id
    return courses.map(course => ({
      id: course.id
    }));
  } catch (error) {
    console.error("Error generating static params for courses:", error);
    return [];
  }
}

// Import and use the client component
import CoursePageClient from "./client";

export default function CoursePage() {
  return <CoursePageClient />;
}
