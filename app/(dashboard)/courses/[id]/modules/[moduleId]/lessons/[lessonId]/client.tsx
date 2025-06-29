"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Loader2,
  PlayCircle,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { coursesApi, modulesApi, lessonsApi, progressApi } from "@/lib/api";
import { Course, Module, Lesson } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function LessonPageClient() {
  const { id, moduleId, lessonId } = useParams<{
    id: string;
    moduleId: string;
    lessonId: string;
  }>();
  const router = useRouter();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [allLessons, setAllLessons] = useState<{ [key: string]: Lesson[] }>({});
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const courseResponse = await coursesApi.getCourseById(id);
        if (courseResponse.data) {
          setCourse(courseResponse.data);
        }

        const moduleResponse = await modulesApi.getModulesByCourse(id);
        const modules = Array.isArray(moduleResponse.data?.data)
          ? moduleResponse.data.data
          : Array.isArray(moduleResponse.data)
          ? moduleResponse.data
          : [];
        setAllModules(modules);

        const currentModule = modules.find((m) => m.id === moduleId);
        setModule(currentModule || null);

        const lessonData: { [key: string]: Lesson[] } = {};
        await Promise.all(
          modules.map(async (module) => {
            const lessonsResponse = await lessonsApi.getLessonsByModule(
              module.id
            );
            lessonData[module.id] = Array.isArray(lessonsResponse.data?.data)
              ? lessonsResponse.data.data
              : Array.isArray(lessonsResponse.data)
              ? lessonsResponse.data
              : [];
          })
        );
        setAllLessons(lessonData);

        if (currentModule) {
          const currentLessonResponse = await lessonsApi.getLessonsByModule(
            moduleId
          );
          const lessons = Array.isArray(currentLessonResponse.data?.data)
            ? currentLessonResponse.data.data
            : Array.isArray(currentLessonResponse.data)
            ? currentLessonResponse.data
            : [];
          const currentLesson = lessons.find((l) => l.id === lessonId);
          setLesson(currentLesson || null);
        }
      } catch (error) {
        console.error("Failed to fetch lesson data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load lesson. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, moduleId, lessonId, toast]);

  useEffect(() => {
    if (!lesson) return;
    let cancelled = false;
    const fetchProgress = async () => {
      try {
        const progressResponse = await progressApi.getLessonProgress(lesson.id);
        if (!cancelled && progressResponse.data) {
          setCompleted((progressResponse.data as any)?.status === "COMPLETED");
        }
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setCompleted(false);
        }
      }
    };
    fetchProgress();
    return () => {
      cancelled = true;
    };
  }, [lesson]);

  const markAsComplete = async () => {
    setMarkingComplete(true);
    try {
      await progressApi.markLessonAsCompleted(lessonId);
      try {
        const progressResponse = await progressApi.getLessonProgress(lessonId);
        setCompleted((progressResponse.data as any)?.status === "COMPLETED");
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setCompleted(false);
        }
      }
      toast({
        title: "Progress Updated",
        description: "Lesson marked as completed.",
      });
    } catch (error) {
      console.error("Failed to mark lesson as complete:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update progress.",
      });
    } finally {
      setMarkingComplete(false);
    }
  };

  const navigateToLesson = (moduleId: string, lessonId: string) => {
    router.push(`/courses/${id}/modules/${moduleId}/lessons/${lessonId}`);
  };

  const findAdjacentLessons = () => {
    let prevLesson: { moduleId: string; lessonId: string } | null = null;
    let nextLesson: { moduleId: string; lessonId: string } | null = null;

    const orderedModules = [...allModules].sort((a, b) => a.order - b.order);

    let found = false;
    for (let i = 0; i < orderedModules.length; i++) {
      const currentModuleId = orderedModules[i].id;
      const moduleLessons = allLessons[currentModuleId] || [];
      const orderedLessons = [...moduleLessons].sort(
        (a, b) => a.order - b.order
      );

      for (let j = 0; j < orderedLessons.length; j++) {
        const currentLesson = orderedLessons[j];

        if (found) {
          nextLesson = {
            moduleId: currentModuleId,
            lessonId: currentLesson.id,
          };
          return { prevLesson, nextLesson };
        }

        if (currentModuleId === moduleId && currentLesson.id === lessonId) {
          found = true;
        } else {
          prevLesson = {
            moduleId: currentModuleId,
            lessonId: currentLesson.id,
          };
        }
      }
    }

    return { prevLesson, nextLesson };
  };

  const { prevLesson, nextLesson } = findAdjacentLessons();

  if (loading) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson || !module || !course) {
    return (
      <div className="p-6 md:p-8">
        <div className="p-8 text-center bg-muted rounded-lg">
          <h3 className="text-xl font-medium mb-2">Lesson Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The lesson you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button asChild>
            <a href={`/courses/${id}`}>Back to Course</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-card py-4 px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              asChild
            >
              <a href={`/courses/${id}`}>
                <ChevronLeft className="h-4 w-4" />
                Back to Course
              </a>
            </Button>

            <div className="flex items-center gap-2">
              {completed ? (
                <span className="flex items-center text-xs font-medium text-emerald-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Completed
                </span>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAsComplete}
                  disabled={markingComplete}
                  className="text-xs"
                >
                  {markingComplete ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Mark Complete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 md:p-8">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
          <div className="flex items-center text-sm text-muted-foreground mb-6">
            <span>{course.title}</span>
            <span className="mx-2">•</span>
            <span>{module.title}</span>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
            {lesson.videoUrl && (
              <video
                controls
                className="w-full max-w-xl h-auto rounded mb-4 mx-auto"
                src={`${
                  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
                }${lesson.videoUrl}`}
              />
            )}
            {lesson.content ? (
              <div className="mb-6">
                <div className="break-words whitespace-pre-line max-w-2xl">
                  {lesson.content}
                </div>
              </div>
            ) : (
              <div className="p-8 bg-muted rounded-lg flex flex-col items-center justify-center">
                <PlayCircle className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Lesson Content</h3>
                <p className="text-muted-foreground text-center mt-2">
                  This is where the lesson content would be displayed.
                </p>
              </div>
            )}
          </div>

          <Separator className="my-8" />

          <div className="flex flex-wrap justify-between gap-4">
            {prevLesson ? (
              <Button
                variant="outline"
                className="flex items-center"
                onClick={() =>
                  navigateToLesson(prevLesson.moduleId, prevLesson.lessonId)
                }
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous Lesson
              </Button>
            ) : (
              <div></div>
            )}

            {nextLesson ? (
              <Button
                className="flex items-center bg-indigo-600 hover:bg-indigo-700"
                onClick={() =>
                  navigateToLesson(nextLesson.moduleId, nextLesson.lessonId)
                }
              >
                Next Lesson
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="flex items-center bg-emerald-600 hover:bg-emerald-700"
                asChild
              >
                <a href={`/courses/${id}`}>
                  Complete Course
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
