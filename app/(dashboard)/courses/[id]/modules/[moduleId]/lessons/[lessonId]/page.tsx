import { coursesApi, modulesApi, lessonsApi } from "@/lib/api";
import { Course, Module, Lesson } from "@/lib/types";
import LessonPageClient from "./client";

// Server component for static params generation
export async function generateStaticParams() {
  try {
    // Fetch all courses
    const coursesResponse = await coursesApi.getAllCourses();
    const courses = coursesResponse.data?.data || [];
    
    // For each course, fetch its modules
    const params = [];
    
    for (const course of courses) {
      const modulesResponse = await modulesApi.getModulesByCourse(course.id);
      const modules = modulesResponse.data?.data || [];
      
      // For each module, fetch its lessons
      for (const module of modules) {
        const lessonsResponse = await lessonsApi.getLessonsByModule(module.id);
        const lessons = lessonsResponse.data?.data || [];
        
        // Generate params for each lesson
        for (const lesson of lessons) {
          params.push({
            id: course.id.toString(),
            moduleId: module.id.toString(),
            lessonId: lesson.id.toString()
          });
        }
      }
    }
    
    return params;
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Default export that renders the client component
export default function LessonPage() {
  return <LessonPageClient />;
}
