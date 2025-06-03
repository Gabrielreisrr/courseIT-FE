// User types
export type UserRole = 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Course types
export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  rating?: number;
  learnerCount?: number;
  modules?: Module[];
}

export interface Module {
  id: string;
  title: string;
  courseId: string;
  order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  order: number;
  content?: string;
  duration?: number; // in minutes
}

// Enrollment and progress types
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress?: number;
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface AuthResponse {
  token: string;
  data: User;  // Changed from user to data to match API response structure
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}