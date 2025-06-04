import { coursesApi, modulesApi, lessonsApi } from "@/lib/api";
import { Course, Module, Lesson } from "@/lib/types";
import LessonPageClient from "./client";

export async function generateStaticParams() {
  try {
    const coursesResponse = await coursesApi.getAllCourses();
    const courses = coursesResponse.data?.data || [];

    const params = [];

    for (const course of courses) {
      const modulesResponse = await modulesApi.getModulesByCourse(course.id);
      const modules = modulesResponse.data?.data || [];

      for (const module of modules) {
        const lessonsResponse = await lessonsApi.getLessonsByModule(module.id);
        const lessons = lessonsResponse.data?.data || [];

        for (const lesson of lessons) {
          params.push({
            id: course.id.toString(),
            moduleId: module.id.toString(),
            lessonId: lesson.id.toString(),
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

export default function LessonPage() {
  return <LessonPageClient />;
}
