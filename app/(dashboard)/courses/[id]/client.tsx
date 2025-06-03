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
  Play
} from "lucide-react";
import Image from "next/image";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { coursesApi, enrollmentsApi, modulesApi, lessonsApi, progressApi } from "@/lib/api";
import { Course, Module, Lesson, Progress } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

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
        // Fetch course details
        const courseResponse = await coursesApi.getCourseById(id);
        if (courseResponse.data) {
          setCourse(courseResponse.data.data);
        }

        // Fetch modules for this course
        const modulesResponse = await modulesApi.getModulesByCourse(id);
        if (modulesResponse.data) {
          const moduleData = modulesResponse.data.data || [];
          setModules(moduleData);

          // Fetch lessons for each module
          const lessonData: { [key: string]: Lesson[] } = {};
          await Promise.all(
            moduleData.map(async (module) => {
              const lessonsResponse = await lessonsApi.getLessonsByModule(module.id);
              if (lessonsResponse.data) {
                lessonData[module.id] = lessonsResponse.data.data || [];
              }
            })
          );
          setLessons(lessonData);
        }

        // Check if the user is enrolled in this course
        if (user?.role === 'STUDENT') {
          const enrollmentResponse = await enrollmentsApi.getMyEnrollments();
          if (enrollmentResponse.data) {
            const enrollments = enrollmentResponse.data.data || [];
            const isUserEnrolled = enrollments.some(e => e.courseId === id);
            setIsEnrolled(isUserEnrolled);

            if (isUserEnrolled) {
              // Fetch course progress
              const progressResponse = await progressApi.getCourseProgress(id);
              if (progressResponse.data) {
                const progressData = progressResponse.data.data || [];
                
                // Calculate overall progress (percentage of completed lessons)
                const completedLessons = progressData.filter(p => p.completed).length;
                const totalLessons = progressData.length;
                const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
                setCourseProgress(progress);

                // Set lesson completion status
                const lessonProgress: { [key: string]: boolean } = {};
                progressData.forEach(progress => {
                  lessonProgress[progress.lessonId] = progress.completed;
                });
                setProgress(lessonProgress);
              }
            }
          }
        } else if (isAdmin) {
          // Admins can view courses without enrollment
          setIsEnrolled(true);
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
      setProgress(prev => ({ ...prev, [lessonId]: true }));
      
      // Update overall course progress
      const progressResponse = await progressApi.getCourseProgress(id);
      if (progressResponse.data) {
        const progressData = progressResponse.data.data || [];
        // Calculate progress percentage
        const completedLessons = progressData.filter(p => p.completed).length;
        const totalLessons = progressData.length;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        setCourseProgress(progress);
      }
      
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
              <a href="/courses">Back to Courses</a>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate total lessons count
  const totalLessonsCount = Object.values(lessons).reduce(
    (total, moduleLessons) => total + moduleLessons.length, 
    0
  );

  // Calculate completed lessons count
  const completedLessonsCount = Object.values(progress).filter(Boolean).length;

  return (
    <DashboardLayout>
      <div>
        {/* Course Header */}
        <div className="relative">
          <div className="h-48 md:h-64 w-full bg-indigo-600 dark:bg-indigo-900">
            {course.imageUrl && (
              <div className="absolute inset-0">
                <Image
                  src={course.imageUrl || "https://images.pexels.com/photos/5428010/pexels-photo-5428010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                  alt={course.title}
                  fill
                  className="object-cover opacity-20"
                />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-indigo-900/80 dark:from-indigo-900/80 dark:to-indigo-950/80" />
            <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-6">
              <h1 className="text-2xl md:text-4xl font-bold text-white">{course.title}</h1>
              <p className="text-indigo-100 mt-2 max-w-2xl">{course.description}</p>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-6">
                  <div className="space-y-6">
                    <div className="bg-card shadow-sm p-6 rounded-lg border">
                      <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                      <p className="text-muted-foreground">{course.description}</p>
                    </div>
                    
                    <div className="bg-card shadow-sm p-6 rounded-lg border">
                      <h2 className="text-xl font-semibold mb-4">What Will I Learn?</h2>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Comprehensive understanding of the subject matter</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Practical skills applicable in real-world scenarios</span>
                        </li>
                        <li className="flex items-start">
                          <ChevronRight className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span>Industry-relevant knowledge and best practices</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-card shadow-sm p-6 rounded-lg border">
                      <h2 className="text-xl font-semibold mb-4">Course Structure</h2>
                      <p className="text-muted-foreground mb-4">
                        This course contains {modules.length} modules with a total of {totalLessonsCount} lessons.
                      </p>
                      <div className="space-y-3">
                        {modules.map((module, index) => (
                          <div key={module.id} className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-medium">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {lessons[module.id]?.length || 0} lessons
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="content" className="mt-6">
                  <div className="bg-card shadow-sm rounded-lg border">
                    <Accordion type="multiple" className="divide-y">
                      {modules.map((module, moduleIndex) => (
                        <AccordionItem key={module.id} value={module.id} className="border-none">
                          <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                            <div className="flex items-center gap-3 text-left">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                                {moduleIndex + 1}
                              </div>
                              <div>
                                <h3 className="font-medium">{module.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {lessons[module.id]?.length || 0} lessons
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-0 pb-0 pt-0">
                            <div className="pl-8 pr-0 py-2 bg-muted/30 divide-y">
                              {lessons[module.id]?.map((lesson, lessonIndex) => {
                                const isCompleted = progress[lesson.id] === true;
                                
                                return (
                                  <div 
                                    key={lesson.id}
                                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="h-6 w-6 flex items-center justify-center">
                                        {isCompleted ? (
                                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                        ) : (
                                          <span className="text-sm text-muted-foreground">
                                            {moduleIndex + 1}.{lessonIndex + 1}
                                          </span>
                                        )}
                                      </div>
                                      <span className="font-medium">{lesson.title}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {lesson.duration && (
                                        <span className="text-xs text-muted-foreground flex items-center">
                                          <Clock className="h-3 w-3 mr-1" />
                                          {lesson.duration} min
                                        </span>
                                      )}
                                      
                                      {isEnrolled ? (
                                        <Button 
                                          size="sm" 
                                          variant={isCompleted ? "outline" : "default"}
                                          onClick={() => navigateToLesson(module.id, lesson.id)}
                                          className={isCompleted ? "" : "bg-indigo-600 hover:bg-indigo-700"}
                                        >
                                          {isCompleted ? "Review" : "Start"}
                                        </Button>
                                      ) : (
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          disabled
                                        >
                                          Locked
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Enrollment / Progress Card */}
              <div className="bg-card shadow-sm rounded-lg border overflow-hidden">
                {course.imageUrl && (
                  <div className="relative aspect-video">
                    <Image
                      src={course.imageUrl || "https://images.pexels.com/photos/5428010/pexels-photo-5428010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {isEnrolled ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Your Progress</span>
                          <span className="text-sm font-medium">{courseProgress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all duration-300 ease-in-out"
                            style={{ width: `${courseProgress}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {completedLessonsCount} of {totalLessonsCount} lessons completed
                        </p>
                      </div>

                      <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        {courseProgress > 0 ? "Continue Learning" : "Start Learning"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {totalLessonsCount} lessons
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Certification available
                        </span>
                      </div>

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
                          "Enroll in Course"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Stats */}
              <div className="bg-card shadow-sm rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Course Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Modules</span>
                    <span className="font-medium">{modules.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span className="font-medium">{totalLessonsCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">{course.learnerCount || "--"}</span>
                  </div>
                  {course.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">{course.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(course.rating || 0)
                                  ? "text-yellow-400 fill-current"
                                  : "text-muted stroke-current"
                              }`}
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="bg-card shadow-sm rounded-lg border p-6">
                  <h3 className="font-semibold mb-4">Admin Actions</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Edit Course
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                      Delete Course
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

