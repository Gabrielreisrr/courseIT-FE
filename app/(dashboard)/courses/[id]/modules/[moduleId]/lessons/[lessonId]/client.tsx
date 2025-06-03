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
  const { id, moduleId, lessonId } = useParams<{ id: string; moduleId: string; lessonId: string }>();
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
        // Fetch course details
        const courseResponse = await coursesApi.getCourseById(id);
        if (courseResponse.data) {
          setCourse(courseResponse.data.data);
        }

        // Fetch current module
        const moduleResponse = await modulesApi.getModulesByCourse(id);
        if (moduleResponse.data) {
          const modules = moduleResponse.data.data || [];
          setAllModules(modules);
          
          const currentModule = modules.find(m => m.id === moduleId);
          setModule(currentModule || null);

          // Fetch all lessons for all modules for navigation
          const lessonData: { [key: string]: Lesson[] } = {};
          await Promise.all(
            modules.map(async (module) => {
              const lessonsResponse = await lessonsApi.getLessonsByModule(module.id);
              if (lessonsResponse.data) {
                lessonData[module.id] = lessonsResponse.data.data || [];
              }
            })
          );
          setAllLessons(lessonData);

          // Get current lesson
          if (currentModule) {
            const currentLessonResponse = await lessonsApi.getLessonsByModule(moduleId);
            if (currentLessonResponse.data) {
              const lessons = currentLessonResponse.data.data || [];
              const currentLesson = lessons.find(l => l.id === lessonId);
              setLesson(currentLesson || null);
            }
          }
        }

        // Check if this lesson is completed
        const progressResponse = await progressApi.getLessonProgress(lessonId);
        if (progressResponse.data) {
          setCompleted(progressResponse.data.data?.completed || false);
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

  const markAsComplete = async () => {
    setMarkingComplete(true);
    try {
      await progressApi.markLessonAsCompleted(lessonId);
      setCompleted(true);
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

  // Find next and previous lessons for navigation
  const findAdjacentLessons = () => {
    let prevLesson: { moduleId: string; lessonId: string } | null = null;
    let nextLesson: { moduleId: string; lessonId: string } | null = null;
    
    // Create a flat list of all lessons in order
    const orderedModules = [...allModules].sort((a, b) => a.order - b.order);
    
    let found = false;
    for (let i = 0; i < orderedModules.length; i++) {
      const currentModuleId = orderedModules[i].id;
      const moduleLessons = allLessons[currentModuleId] || [];
      const orderedLessons = [...moduleLessons].sort((a, b) => a.order - b.order);
      
      for (let j = 0; j < orderedLessons.length; j++) {
        const currentLesson = orderedLessons[j];
        
        if (found) {
          nextLesson = { 
            moduleId: currentModuleId, 
            lessonId: currentLesson.id 
          };
          return { prevLesson, nextLesson };
        }
        
        if (currentModuleId === moduleId && currentLesson.id === lessonId) {
          found = true;
        } else {
          prevLesson = { 
            moduleId: currentModuleId, 
            lessonId: currentLesson.id 
          };
        }
      }
    }
    
    return { prevLesson, nextLesson };
  };

  const { prevLesson, nextLesson } = findAdjacentLessons();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!lesson || !module || !course) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <div className="p-8 text-center bg-muted rounded-lg">
            <h3 className="text-xl font-medium mb-2">Lesson Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The lesson you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <a href={`/courses/${id}`}>Back to Course</a>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen">
        {/* Navigation Header */}
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

        {/* Lesson Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-2">{lesson.title}</h1>
            <div className="flex items-center text-sm text-muted-foreground mb-6">
              <span>{course.title}</span>
              <span className="mx-2">•</span>
              <span>{module.title}</span>
            </div>

            {/* Lesson Content */}
            <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
              {lesson.content ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
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

            {/* Navigation Footer */}
            <div className="flex flex-wrap justify-between gap-4">
              {prevLesson ? (
                <Button 
                  variant="outline"
                  className="flex items-center"
                  onClick={() => navigateToLesson(prevLesson.moduleId, prevLesson.lessonId)}
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
                  onClick={() => navigateToLesson(nextLesson.moduleId, nextLesson.lessonId)}
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
    </DashboardLayout>
  );
}

