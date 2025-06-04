"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  Award,
  BarChart,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Loader2,
  Play,
} from "lucide-react";
import Image from "next/image";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  coursesApi,
  enrollmentsApi,
  modulesApi,
  lessonsApi,
  progressApi,
} from "@/lib/api";
import { Course, Module, Lesson, Progress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CoursePageClient() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<{ [key: string]: Lesson[] }>({});
  const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [courseProgress, setCourseProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const courseResponse = await coursesApi.getCourseById(id);
        if (courseResponse.data) {
          setCourse(courseResponse.data);
        }

        const modulesResponse = await modulesApi.getModulesByCourse(id);
        if (modulesResponse.data) {
          const sortedModules = [...modulesResponse.data].sort(
            (a, b) => a.order - b.order
          );
          setModules(sortedModules);

          const lessonData: { [key: string]: Lesson[] } = {};
          await Promise.all(
            sortedModules.map(async (module) => {
              const lessonsResponse = await lessonsApi.getLessonsByModule(
                module.id
              );
              if (lessonsResponse.data) {
                lessonData[module.id] = lessonsResponse.data;
              }
            })
          );
          setLessons(lessonData);

          if (user?.role === "STUDENT") {
            const enrollmentResponse = await enrollmentsApi.getMyEnrollments();
            if (enrollmentResponse.data) {
              const enrollments = enrollmentResponse.data;
              const isUserEnrolled = enrollments.some((e) => e.courseId === id);
              setIsEnrolled(isUserEnrolled);

              if (isUserEnrolled) {
                const lessonProgress: { [key: string]: boolean } = {};
                await Promise.all(
                  Object.values(lessonData)
                    .flat()
                    .map(async (lesson: Lesson) => {
                      const progressResponse =
                        await progressApi.getLessonProgress(lesson.id);
                      if (progressResponse.data) {
                        lessonProgress[lesson.id] =
                          progressResponse.data.completed;
                      }
                    })
                );
                setProgress(lessonProgress);

                const totalLessons = Object.values(lessonData).flat().length;
                const completedLessons =
                  Object.values(lessonProgress).filter(Boolean).length;
                const progress =
                  totalLessons > 0
                    ? (completedLessons / totalLessons) * 100
                    : 0;
                setCourseProgress(progress);
              }
            }
          } else if (isAdmin) {
            setIsEnrolled(true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load course data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [id, user, toast, isAdmin]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      const response = await enrollmentsApi.enrollInCourse(id);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Enrollment Failed",
          description: response.error,
        });
      } else {
        setIsEnrolled(true);
        toast({
          title: "Successfully Enrolled",
          description: "You have been enrolled in this course.",
        });
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast({
        variant: "destructive",
        title: "Enrollment Failed",
        description: "An error occurred during enrollment.",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const navigateToLesson = (moduleId: string, lessonId: string) => {
    router.push(`/courses/${id}/modules/${moduleId}/lessons/${lessonId}`);
  };

  const handleMarkComplete = async (lessonId: string) => {
    try {
      await progressApi.markLessonAsCompleted(lessonId);
      setProgress((prev) => ({ ...prev, [lessonId]: true }));

      const totalLessons = Object.values(lessons).flat().length;
      const completedLessons = Object.values({
        ...progress,
        [lessonId]: true,
      }).filter(Boolean).length;
      const newProgress =
        totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
      setCourseProgress(newProgress);

      toast({
        title: "Progress Updated",
        description: "Lesson marked as completed.",
      });
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update progress.",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8">
          <div className="p-8 text-center bg-muted rounded-lg">
            <h3 className="text-xl font-medium mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen">
        <div className="relative h-[300px] md:h-[400px] bg-gradient-to-b from-primary/20 to-background">
          {course.imageUrl && (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="container relative h-full flex flex-col justify-end p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  {course.title}
                </h1>
                <p className="text-muted-foreground max-w-2xl">
                  {course.description}
                </p>
              </div>
              {!isAdmin && !isEnrolled && (
                <Button
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    "Enroll Now"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="container p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Course Content</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="bg-card shadow-sm p-6 rounded-lg border">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-medium">Duration</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {modules.reduce(
                          (total, module) =>
                            total +
                            (module.lessons?.reduce(
                              (sum, lesson) => sum + (lesson.duration || 0),
                              0
                            ) || 0),
                          0
                        )}{" "}
                        minutes
                      </p>
                    </div>

                    <div className="bg-card shadow-sm p-6 rounded-lg border">
                      <div className="flex items-center gap-2 text-primary mb-2">
                        <Award className="h-4 w-4" />
                        <span className="text-sm font-medium">Enrolled</span>
                      </div>
                      <p className="text-2xl font-bold">
                        {course.learnerCount || 0} students
                      </p>
                    </div>

                    {isEnrolled && (
                      <div className="md:col-span-2 bg-card shadow-sm p-6 rounded-lg border">
                        <div className="flex items-center gap-2 text-primary mb-4">
                          <BarChart className="h-4 w-4" />
                          <span className="text-sm font-medium">Progress</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Course Progress</span>
                            <span>{Math.round(courseProgress)}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300 ease-in-out"
                              style={{ width: `${courseProgress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="content">
                  <div className="bg-card shadow-sm rounded-lg border">
                    <Accordion type="single" collapsible className="w-full">
                      {modules.map((module) => (
                        <AccordionItem key={module.id} value={module.id}>
                          <AccordionTrigger className="px-6">
                            <div className="flex items-center gap-2">
                              <span>{module.title}</span>
                              {isAdmin && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-2"
                                  asChild
                                >
                                  <Link href={`/admin/modules/${module.id}`}>
                                    Edit
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="px-6 pb-4">
                              {lessons[module.id]?.length > 0 ? (
                                <div className="space-y-2">
                                  {lessons[module.id]
                                    .sort((a, b) => a.order - b.order)
                                    .map((lesson) => (
                                      <div
                                        key={lesson.id}
                                        className={cn(
                                          "flex items-center justify-between p-4 rounded-lg transition-colors",
                                          isEnrolled
                                            ? "hover:bg-muted cursor-pointer"
                                            : "opacity-60 cursor-not-allowed"
                                        )}
                                        onClick={() =>
                                          isEnrolled &&
                                          navigateToLesson(module.id, lesson.id)
                                        }
                                      >
                                        <div className="flex items-center gap-3">
                                          <div
                                            className={cn(
                                              "p-2 rounded-md",
                                              progress[lesson.id]
                                                ? "bg-emerald-500/10 text-emerald-500"
                                                : "bg-primary/10 text-primary"
                                            )}
                                          >
                                            {progress[lesson.id] ? (
                                              <CheckCircle2 className="h-4 w-4" />
                                            ) : (
                                              <Play className="h-4 w-4" />
                                            )}
                                          </div>
                                          <div>
                                            <h3 className="font-medium">
                                              {lesson.title}
                                            </h3>
                                            {lesson.duration && (
                                              <p className="text-sm text-muted-foreground">
                                                {lesson.duration} minutes
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                        {isEnrolled && (
                                          <div className="flex items-center gap-2">
                                            {progress[lesson.id] ? (
                                              <span className="text-xs text-emerald-500 font-medium">
                                                Completed
                                              </span>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleMarkComplete(lesson.id);
                                                }}
                                              >
                                                Mark Complete
                                              </Button>
                                            )}
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                  No lessons available in this module.
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <div className="bg-card shadow-sm rounded-lg border p-6 space-y-6 sticky top-8">
                <div>
                  <h3 className="font-semibold mb-2">Course Information</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <p className="font-medium">
                        {modules.reduce(
                          (total, module) =>
                            total +
                            (module.lessons?.reduce(
                              (sum, lesson) => sum + (lesson.duration || 0),
                              0
                            ) || 0),
                          0
                        )}{" "}
                        minutes
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Modules:</span>
                      <p className="font-medium">{modules.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Lessons:</span>
                      <p className="font-medium">
                        {Object.values(lessons).reduce(
                          (total, moduleLessons) =>
                            total + moduleLessons.length,
                          0
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Students:</span>
                      <p className="font-medium">
                        {course.learnerCount || 0} enrolled
                      </p>
                    </div>
                    {course.rating && (
                      <div>
                        <span className="text-muted-foreground">Rating:</span>
                        <p className="font-medium">{course.rating} / 5</p>
                      </div>
                    )}
                  </div>
                </div>

                {isAdmin ? (
                  <Button className="w-full" asChild>
                    <Link href={`/admin/courses/${id}`}>Edit Course</Link>
                  </Button>
                ) : !isEnrolled ? (
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleEnroll}
                    disabled={enrolling}
                  >
                    {enrolling ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enrolling...
                      </>
                    ) : (
                      "Enroll Now"
                    )}
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Course Progress</span>
                      <span>{Math.round(courseProgress)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300 ease-in-out"
                        style={{ width: `${courseProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
