"use client";

import { useEffect, useState } from "react";
import {
  Edit,
  Trash2,
  Plus,
  Loader2,
  Search,
  MoreVertical,
  Eye,
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { coursesApi, modulesApi, lessonsApi } from "@/lib/api";
import { Course } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { withRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const CoursesAdminPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [modulesByCourse, setModulesByCourse] = useState<Record<string, any[]>>(
    {}
  );
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, any[]>>(
    {}
  );
  const [loadingModules, setLoadingModules] = useState<string | null>(null);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [moduleCourseId, setModuleCourseId] = useState<string | null>(null);
  const [creatingModule, setCreatingModule] = useState(false);
  const [editModule, setEditModule] = useState<any | null>(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [deletingModule, setDeletingModule] = useState<any | null>(null);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [creatingLesson, setCreatingLesson] = useState(false);
  const [editLesson, setEditLesson] = useState<any | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [deletingLesson, setDeletingLesson] = useState<any | null>(null);
  const [newLessonContent, setNewLessonContent] = useState("");
  const [editLessonContent, setEditLessonContent] = useState("");
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [videoLesson, setVideoLesson] = useState<any | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await coursesApi.getAllCourses();
        if (response.data) {
          const courses = Array.isArray(response.data.data)
            ? response.data.data
            : Array.isArray(response.data)
            ? response.data
            : [];
          setCourses(courses);
          setFilteredCourses(courses);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load courses. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

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

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this course? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await coursesApi.deleteCourse(id);
      if (response.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: response.error,
        });
      } else {
        setCourses((prev) => prev.filter((course) => course.id !== id));
        setFilteredCourses((prev) => prev.filter((course) => course.id !== id));
        toast({
          title: "Course Deleted",
          description: "The course has been successfully deleted.",
        });
      }
    } catch (error) {
      console.error("Failed to delete course:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete course. Please try again.",
      });
    }
  };

  const fetchModulesAndLessons = async (courseId: string) => {
    setLoadingModules(courseId);
    const modulesRes = await modulesApi.getModulesByCourse(courseId);
    console.log("modulesRes", modulesRes);
    let modules: any[] = [];
    if (Array.isArray(modulesRes.data?.data)) {
      modules = modulesRes.data.data;
    } else if (Array.isArray(modulesRes.data)) {
      modules = modulesRes.data;
    }
    setModulesByCourse((prev) => ({ ...prev, [courseId]: modules }));
    const lessonsObj: Record<string, any[]> = {};
    await Promise.all(
      modules.map(async (module: any) => {
        const lessonsRes = await lessonsApi.getLessonsByModule(module.id);
        let lessons: any[] = [];
        if (Array.isArray(lessonsRes.data?.data)) {
          lessons = lessonsRes.data.data;
        } else if (Array.isArray(lessonsRes.data)) {
          lessons = lessonsRes.data;
        }
        lessonsObj[module.id] = lessons;
      })
    );
    setLessonsByModule((prev) => ({ ...prev, ...lessonsObj }));
    setLoadingModules(null);
  };

  const handleOpenModuleDialog = (courseId: string) => {
    setModuleCourseId(courseId);
    setShowModuleDialog(true);
  };

  const handleCreateModule = async () => {
    if (!newModuleTitle.trim() || !moduleCourseId) return;
    setCreatingModule(true);
    const payload = {
      title: newModuleTitle,
      courseId: moduleCourseId,
      order: modulesByCourse[moduleCourseId]?.length || 0,
    };
    const res = await modulesApi.createModule(payload);
    setCreatingModule(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Erro", description: res.error });
      return;
    }
    setShowModuleDialog(false);
    setNewModuleTitle("");
    setExpandedCourseId(moduleCourseId);
    await fetchModulesAndLessons(moduleCourseId);
  };

  const handleOpenEditModule = (module: any) => {
    setEditModule(module);
    setEditModuleTitle(module.title);
  };

  const handleUpdateModule = async () => {
    if (!editModuleTitle.trim() || !editModule) return;
    setCreatingModule(true);
    const payload = {
      title: editModuleTitle,
    };
    const res = await modulesApi.updateModule(editModule.id, payload);
    setCreatingModule(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Erro", description: res.error });
      return;
    }
    setEditModule(null);
    setEditModuleTitle("");
    await fetchModulesAndLessons(editModule.courseId);
  };

  const handleDeleteModule = async () => {
    if (!deletingModule) return;
    setCreatingModule(true);
    const res = await modulesApi.deleteModule(deletingModule.id);
    setCreatingModule(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Erro", description: res.error });
      return;
    }
    setDeletingModule(null);
    await fetchModulesAndLessons(deletingModule.courseId);
  };

  const handleOpenLessonDialog = (moduleId: string) => {
    setLessonModuleId(moduleId);
    setShowLessonDialog(true);
    setNewLessonTitle("");
    setNewLessonContent("");
  };

  const handleCreateLesson = async () => {
    if (!newLessonTitle.trim() || !lessonModuleId) return;
    setCreatingLesson(true);
    const res = await lessonsApi.createLesson({
      title: newLessonTitle,
      moduleId: lessonModuleId,
      order: lessonsByModule[lessonModuleId]?.length || 0,
      content: newLessonContent,
    });
    setCreatingLesson(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Erro", description: res.error });
      return;
    }
    setShowLessonDialog(false);
    setNewLessonTitle("");
    setNewLessonContent("");
    let courseId = "";
    for (const [cId, modules] of Object.entries(modulesByCourse)) {
      if (modules.some((m) => m.id === lessonModuleId)) {
        courseId = cId;
        break;
      }
    }
    if (courseId) {
      await fetchModulesAndLessons(courseId);
    }
  };

  const handleOpenEditLesson = (lesson: any) => {
    setEditLesson(lesson);
    setEditLessonTitle(lesson.title);
    setEditLessonContent(lesson.content || "");
  };

  const handleUpdateLesson = async () => {
    if (!editLessonTitle.trim() || !editLesson) return;
    setCreatingLesson(true);
    const res = await lessonsApi.updateLesson(editLesson.id, {
      title: editLessonTitle,
      content: editLessonContent,
    });
    setCreatingLesson(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Erro", description: res.error });
      return;
    }
    setEditLesson(null);
    setEditLessonTitle("");
    setEditLessonContent("");
    await fetchModulesAndLessons(
      editLesson.moduleId
        ? modulesByCourse[editLesson.moduleId]?.[0]?.courseId
        : ""
    );
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    setCreatingLesson(true);
    const res = await lessonsApi.deleteLesson(deletingLesson.id);
    setCreatingLesson(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Erro", description: res.error });
      return;
    }
    setDeletingLesson(null);
    let courseId = "";
    for (const [cId, modules] of Object.entries(modulesByCourse)) {
      if (modules.some((m) => m.id === deletingLesson.moduleId)) {
        courseId = cId;
        break;
      }
    }
    if (courseId) {
      await fetchModulesAndLessons(courseId);
    }
  };

  const handleOpenVideoDialog = (lesson: any) => {
    setVideoLesson(lesson);
    setShowVideoDialog(true);
    setVideoFile(null);
  };

  const handleUploadVideo = async () => {
    if (!videoLesson || !videoFile) return;
    setUploadingVideo(true);
    const res = await lessonsApi.uploadVideo(videoLesson.id, videoFile);
    setUploadingVideo(false);
    if (res.error) {
      toast({ variant: "destructive", title: "Erro", description: res.error });
      return;
    }
    setShowVideoDialog(false);
    setVideoLesson(null);
    setVideoFile(null);
    let courseId = "";
    for (const [cId, modules] of Object.entries(modulesByCourse)) {
      if (modules.some((m) => m.id === videoLesson.moduleId)) {
        courseId = cId;
        break;
      }
    }
    if (courseId) {
      await fetchModulesAndLessons(courseId);
    }
    toast({
      title: "Vídeo enviado",
      description: "O vídeo foi enviado com sucesso.",
    });
  };

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
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Courses Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage your courses.
          </p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700" asChild>
          <Link href="/admin/courses/new">
            <Plus className="h-4 w-4 mr-2" />
            Add New Course
          </Link>
        </Button>
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
        <div className="bg-card rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">
                  Description
                </TableHead>
                <TableHead className="hidden md:table-cell">Students</TableHead>
                <TableHead className="hidden md:table-cell">Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.flatMap((course) => {
                const rows = [
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">
                      {course.title}
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {course.description}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {course.learnerCount || 0}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {course.rating || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setExpandedCourseId(
                              expandedCourseId === course.id ? null : course.id
                            );
                            if (expandedCourseId !== course.id)
                              fetchModulesAndLessons(course.id);
                          }}
                        >
                          {expandedCourseId === course.id
                            ? "Fechar"
                            : "Gerenciar"}
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/courses/${course.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>,
                ];
                if (expandedCourseId === course.id) {
                  rows.push(
                    <TableRow key={course.id + "-expanded"}>
                      <TableCell colSpan={5} className="bg-muted p-0">
                        {loadingModules === course.id ? (
                          <div className="flex items-center gap-2 p-4">
                            <Loader2 className="animate-spin" /> Carregando
                            módulos...
                          </div>
                        ) : (
                          <>
                            <Accordion
                              type="single"
                              collapsible
                              className="w-full p-4"
                            >
                              {modulesByCourse[course.id]?.map((module) => (
                                <AccordionItem
                                  key={module.id}
                                  value={module.id}
                                >
                                  <AccordionTrigger className="group">
                                    <span className="group-hover:underline">
                                      {module.title}
                                    </span>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="no-underline"
                                          onClick={() =>
                                            handleOpenEditModule(module)
                                          }
                                        >
                                          Editar
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="no-underline"
                                          onClick={() =>
                                            setDeletingModule(module)
                                          }
                                        >
                                          Excluir
                                        </Button>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleOpenLessonDialog(module.id)
                                        }
                                      >
                                        Nova Lição
                                      </Button>
                                    </div>
                                    <ul className="space-y-2">
                                      {lessonsByModule[module.id]?.map(
                                        (lesson) => (
                                          <li
                                            key={lesson.id}
                                            className="flex justify-between items-center bg-card rounded p-2"
                                          >
                                            <div className="flex items-center gap-4">
                                              <span>{lesson.title}</span>
                                              {lesson.videoUrl && (
                                                <video
                                                  controls
                                                  width={200}
                                                  src={`${
                                                    process.env
                                                      .NEXT_PUBLIC_API_URL ||
                                                    "http://localhost:3000"
                                                  }${lesson.videoUrl}`}
                                                  className="rounded shadow"
                                                />
                                              )}
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                  handleOpenEditLesson(lesson)
                                                }
                                              >
                                                Editar
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                  handleOpenVideoDialog(lesson)
                                                }
                                              >
                                                Upload Vídeo
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() =>
                                                  setDeletingLesson(lesson)
                                                }
                                              >
                                                Excluir
                                              </Button>
                                            </div>
                                          </li>
                                        )
                                      )}
                                      {(!lessonsByModule[module.id] ||
                                        lessonsByModule[module.id].length ===
                                          0) && (
                                        <li className="text-muted-foreground">
                                          Nenhuma lição cadastrada.
                                        </li>
                                      )}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>
                              ))}
                              {(!modulesByCourse[course.id] ||
                                modulesByCourse[course.id].length === 0) && (
                                <div className="text-muted-foreground p-4">
                                  Nenhum módulo cadastrado.
                                </div>
                              )}
                            </Accordion>
                            <div className="mt-4 px-4 pb-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleOpenModuleDialog(course.id)
                                }
                              >
                                Adicionar Módulo
                              </Button>
                            </div>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }
                return rows;
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="p-8 text-center bg-muted rounded-lg">
          <h3 className="text-lg font-medium mb-2">No courses found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? "Try a different search term."
              : "Get started by creating your first course."}
          </p>
          {!searchQuery && (
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/admin/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Link>
            </Button>
          )}
        </div>
      )}

      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Módulo</DialogTitle>
            <DialogDescription id="desc-novo-modulo">
              Preencha o título do novo módulo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Título do módulo"
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              disabled={creatingModule}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateModule}
              disabled={creatingModule || !newModuleTitle.trim()}
            >
              {creatingModule ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editModule}
        onOpenChange={(v) => {
          if (!v) setEditModule(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription id="desc-editar-modulo">
              Altere o título do módulo.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Título do módulo"
              value={editModuleTitle}
              onChange={(e) => setEditModuleTitle(e.target.value)}
              disabled={creatingModule}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateModule}
              disabled={creatingModule || !editModuleTitle.trim()}
            >
              {creatingModule ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingModule}
        onOpenChange={(v) => {
          if (!v) setDeletingModule(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Módulo</DialogTitle>
            <DialogDescription id="desc-excluir-modulo">
              Confirme a exclusão do módulo. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir este módulo? Esta ação não pode ser
            desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteModule}
              disabled={creatingModule}
            >
              {creatingModule ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Lição</DialogTitle>
            <DialogDescription id="desc-nova-licao">
              Preencha o título e conteúdo da nova lição.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Título da lição"
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              disabled={creatingLesson}
            />
            <textarea
              placeholder="Conteúdo da lição"
              className="w-full min-h-[100px] border rounded p-2"
              value={newLessonContent}
              onChange={(e) => setNewLessonContent(e.target.value)}
              disabled={creatingLesson}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateLesson}
              disabled={creatingLesson || !newLessonTitle.trim()}
            >
              {creatingLesson ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editLesson}
        onOpenChange={(v) => {
          if (!v) setEditLesson(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Lição</DialogTitle>
            <DialogDescription id="desc-editar-licao">
              Altere o título e conteúdo da lição.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Título da lição"
              value={editLessonTitle}
              onChange={(e) => setEditLessonTitle(e.target.value)}
              disabled={creatingLesson}
            />
            <textarea
              placeholder="Conteúdo da lição"
              className="w-full min-h-[100px] border rounded p-2"
              value={editLessonContent}
              onChange={(e) => setEditLessonContent(e.target.value)}
              disabled={creatingLesson}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateLesson}
              disabled={creatingLesson || !editLessonTitle.trim()}
            >
              {creatingLesson ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deletingLesson}
        onOpenChange={(v) => {
          if (!v) setDeletingLesson(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Lição</DialogTitle>
            <DialogDescription id="desc-excluir-licao">
              Confirme a exclusão da lição. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <p>
            Tem certeza que deseja excluir esta lição? Esta ação não pode ser
            desfeita.
          </p>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteLesson}
              disabled={creatingLesson}
            >
              {creatingLesson ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showVideoDialog} onOpenChange={setShowVideoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload de Vídeo</DialogTitle>
            <DialogDescription id="desc-upload-video">
              Selecione um arquivo de vídeo para enviar para a lição.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              disabled={uploadingVideo}
            />
            {videoFile && (
              <div className="text-sm text-muted-foreground">
                Arquivo selecionado: {videoFile.name}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={handleUploadVideo}
              disabled={uploadingVideo || !videoFile}
            >
              {uploadingVideo ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : null}
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withRole(CoursesAdminPage, ["ADMIN"]);
