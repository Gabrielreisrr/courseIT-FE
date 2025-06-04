import Link from "next/link";
import Image from "next/image";
import { Star, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { Course } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  course: Course;
  progress?: number;
  className?: string;
}

export function CourseCard({ course, progress, className }: CourseCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md",
        className
      )}
    >
      <div className="relative h-48 w-full">
        <Image
          src={
            course.imageUrl ||
            "https:images.pexels.com/photos/5428010/pexels-photo-5428010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
          }
          alt={course.title}
          fill
          className="object-cover"
          priority
        />
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg truncate">{course.title}</h3>
            {course.rating && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-medium">{course.rating}</span>
              </div>
            )}
          </div>

          {course.learnerCount && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{course.learnerCount} Learners</span>
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>

          {progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium">
                  {progress}% Complete
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary rounded-full h-2 transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
          <Link href={`/courses/${course.id}`}>
            {progress !== undefined && progress > 0
              ? "Continue Learning"
              : "View Course"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
