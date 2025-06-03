// API client for making requests to the backend
import { AuthResponse, ApiResponse, Course, Module, Lesson, User, Enrollment, Progress } from './types';

const API_URL = 'http://localhost:3000/api';

// Helper to get the auth token
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to set the auth token
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Helper to remove the auth token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Generic fetch function with authentication
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: headers as HeadersInit,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.message || 'An error occurred' };
    }

    const data = await response.json();
    return { data: data as T };
  } catch (error) {
    return { error: (error as Error).message || 'Network error' };
  }
}

// Auth API calls
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return fetchApi<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string, role = 'STUDENT'): Promise<ApiResponse<AuthResponse>> => {
    return fetchApi<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  getMe: async (): Promise<ApiResponse<{ data: User }>> => {
    return fetchApi<{ data: User }>('/users/me');
  },
};

// Courses API calls
export const coursesApi = {
  getAllCourses: async (): Promise<ApiResponse<{ data: Course[] }>> => {
    return fetchApi<{ data: Course[] }>('/courses');
  },

  getCourseById: async (id: string): Promise<ApiResponse<{ data: Course }>> => {
    return fetchApi<{ data: Course }>(`/courses/${id}`);
  },

  createCourse: async (courseData: any): Promise<ApiResponse<{ data: Course }>> => {
    return fetchApi<{ data: Course }>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  },

  updateCourse: async (id: string, courseData: any): Promise<ApiResponse<{ data: Course }>> => {
    return fetchApi<{ data: Course }>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  },

  deleteCourse: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/courses/${id}`, {
      method: 'DELETE',
    });
  },
};

// Modules API calls
export const modulesApi = {
  getModulesByCourse: async (courseId: string): Promise<ApiResponse<{ data: Module[] }>> => {
    return fetchApi<{ data: Module[] }>(`/modules/course/${courseId}`);
  },

  createModule: async (moduleData: any): Promise<ApiResponse<{ data: Module }>> => {
    return fetchApi<{ data: Module }>('/modules', {
      method: 'POST',
      body: JSON.stringify(moduleData),
    });
  },

  updateModule: async (id: string, moduleData: any): Promise<ApiResponse<{ data: Module }>> => {
    return fetchApi<{ data: Module }>(`/modules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(moduleData),
    });
  },

  deleteModule: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/modules/${id}`, {
      method: 'DELETE',
    });
  },
};

// Lessons API calls
export const lessonsApi = {
  getLessonsByModule: async (moduleId: string): Promise<ApiResponse<{ data: Lesson[] }>> => {
    return fetchApi<{ data: Lesson[] }>(`/lessons/module/${moduleId}`);
  },

  createLesson: async (lessonData: any): Promise<ApiResponse<{ data: Lesson }>> => {
    return fetchApi<{ data: Lesson }>('/lessons', {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  },

  updateLesson: async (id: string, lessonData: any): Promise<ApiResponse<{ data: Lesson }>> => {
    return fetchApi<{ data: Lesson }>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    });
  },

  deleteLesson: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/lessons/${id}`, {
      method: 'DELETE',
    });
  },
};

// Enrollments API calls
export const enrollmentsApi = {
  getMyEnrollments: async (): Promise<ApiResponse<{ data: Enrollment[] }>> => {
    return fetchApi<{ data: Enrollment[] }>('/enrollments/my');
  },

  getEnrollmentsByCourse: async (courseId: string): Promise<ApiResponse<{ data: Enrollment[] }>> => {
    return fetchApi<{ data: Enrollment[] }>(`/enrollments/courses/${courseId}`);
  },

  enrollInCourse: async (courseId: string): Promise<ApiResponse<{ data: Enrollment }>> => {
    return fetchApi<{ data: Enrollment }>(`/enrollments/courses/${courseId}`, {
      method: 'POST',
    });
  },
};

// Progress API calls
export const progressApi = {
  getCourseProgress: async (courseId: string): Promise<ApiResponse<{ data: Progress[] }>> => {
    return fetchApi<{ data: Progress[] }>(`/progress/courses/${courseId}`);
  },

  getLessonProgress: async (lessonId: string): Promise<ApiResponse<{ data: Progress }>> => {
    return fetchApi<{ data: Progress }>(`/progress/lessons/${lessonId}`);
  },

  markLessonAsCompleted: async (lessonId: string): Promise<ApiResponse<{ data: Progress }>> => {
    return fetchApi<{ data: Progress }>(`/progress/lessons/${lessonId}`, {
      method: 'POST',
    });
  },
};

// Users API calls
export const usersApi = {
  getAllUsers: async (): Promise<ApiResponse<{ data: User[] }>> => {
    return fetchApi<{ data: User[] }>('/users');
  },

  getUserById: async (id: string): Promise<ApiResponse<{ data: User }>> => {
    return fetchApi<{ data: User }>(`/users/${id}`);
  },

  createUser: async (userData: any): Promise<ApiResponse<{ data: User }>> => {
    return fetchApi<{ data: User }>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (id: string, userData: any): Promise<ApiResponse<{ data: User }>> => {
    return fetchApi<{ data: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};