"use client";

import { useEffect, useState } from "react";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Loader2,
  Search,
  MoreVertical,
  Eye
} from "lucide-react";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { coursesApi } from "@/lib/api";
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
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const CoursesAdminPage = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await coursesApi.getAllCourses();
        if (response.data) {
          const courses = response.data.data;
          setCourses(courses || []);
          setFilteredCourses(courses || []);
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

  // Filter courses based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = courses.filter(
      course => 
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    );
    
    setFilteredCourses(filtered);
  }, [searchQuery, courses]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
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
        setCourses(prev => prev.filter(course => course.id !== id));
        setFilteredCourses(prev => prev.filter(course => course.id !== id));
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

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 md:p-8">
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Courses Management</h1>
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
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden md:table-cell">Students</TableHead>
                  <TableHead className="hidden md:table-cell">Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-xs truncate">
                      {course.description}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{course.learnerCount || 0}</TableCell>
                    <TableCell className="hidden md:table-cell">{course.rating || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-2">
                        <div className="md:block hidden">
                          <Button size="sm" variant="ghost" asChild>
                            <Link href={`/courses/${course.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
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
                        <div className="md:hidden block">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/courses/${course.id}`}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/courses/${course.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => handleDelete(course.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
      </div>
    </DashboardLayout>
  );
};

// Wrap the component with role protection
export default withRole(CoursesAdminPage, ["ADMIN"]);