import {
  AuthResponse,
  ApiResponse,
  Course,
  Module,
  Lesson,
  User,
  Enrollment,
  Progress,
  PaginatedResponse,
} from "./types";

const API_URL = "http://localhost:3000/api";

export const getToken = (): string | null => {
  if (typeof document !== "undefined") {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1] || null
    );
  }
  return null;
};

export const setToken = (token: string): void => {
  document.cookie = `token=${token}; path=/; max-age=2592000; SameSite=Strict`;
};

export const removeToken = (): void => {
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: headers as HeadersInit,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || data.error || "An error occurred" };
    }

    return { data: data as T };
  } catch (error) {
    return { error: (error as Error).message || "Network error" };
  }
}

export const authApi = {
  login: async (
    email: string,
    password: string
  ): Promise<ApiResponse<AuthResponse>> => {
    return fetchApi<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role = "STUDENT"
  ): Promise<ApiResponse<AuthResponse>> => {
    return fetchApi<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  getMe: async (): Promise<ApiResponse<User>> => {
    return fetchApi<User>("/users/me");
  },
};

export const coursesApi = {
  getAllCourses: async (): Promise<ApiResponse<PaginatedResponse<Course>>> => {
    return fetchApi<PaginatedResponse<Course>>("/courses");
  },

  getCourseById: async (id: string): Promise<ApiResponse<Course>> => {
    return fetchApi<Course>(`/courses/${id}`);
  },

  createCourse: async (courseData: any): Promise<ApiResponse<Course>> => {
    return fetchApi<Course>("/courses", {
      method: "POST",
      body: JSON.stringify(courseData),
    });
  },

  updateCourse: async (
    id: string,
    courseData: any
  ): Promise<ApiResponse<Course>> => {
    return fetchApi<Course>(`/courses/${id}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    });
  },

  deleteCourse: async (
    id: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/courses/${id}`, {
      method: "DELETE",
    });
  },
};

export const modulesApi = {
  getModulesByCourse: async (
    courseId: string
  ): Promise<ApiResponse<PaginatedResponse<Module>>> => {
    return fetchApi<PaginatedResponse<Module>>(`/modules/course/${courseId}`);
  },

  createModule: async (moduleData: any): Promise<ApiResponse<Module>> => {
    return fetchApi<Module>("/modules", {
      method: "POST",
      body: JSON.stringify(moduleData),
    });
  },

  updateModule: async (
    id: string,
    moduleData: any
  ): Promise<ApiResponse<Module>> => {
    return fetchApi<Module>(`/modules/${id}`, {
      method: "PUT",
      body: JSON.stringify(moduleData),
    });
  },

  deleteModule: async (
    id: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/modules/${id}`, {
      method: "DELETE",
    });
  },
};

export const lessonsApi = {
  getLessonsByModule: async (
    moduleId: string
  ): Promise<ApiResponse<PaginatedResponse<Lesson>>> => {
    return fetchApi<PaginatedResponse<Lesson>>(`/lessons/module/${moduleId}`);
  },

  createLesson: async (lessonData: any): Promise<ApiResponse<Lesson>> => {
    return fetchApi<Lesson>("/lessons", {
      method: "POST",
      body: JSON.stringify(lessonData),
    });
  },

  updateLesson: async (
    id: string,
    lessonData: any
  ): Promise<ApiResponse<Lesson>> => {
    return fetchApi<Lesson>(`/lessons/${id}`, {
      method: "PUT",
      body: JSON.stringify(lessonData),
    });
  },

  deleteLesson: async (
    id: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/lessons/${id}`, {
      method: "DELETE",
    });
  },
};

export const enrollmentsApi = {
  getMyEnrollments: async (): Promise<
    ApiResponse<PaginatedResponse<Enrollment>>
  > => {
    return fetchApi<PaginatedResponse<Enrollment>>("/enrollments/my");
  },

  enrollInCourse: async (
    courseId: string
  ): Promise<ApiResponse<Enrollment>> => {
    return fetchApi<Enrollment>("/enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    });
  },

  unenrollFromCourse: async (
    courseId: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/enrollments/${courseId}`, {
      method: "DELETE",
    });
  },
};

export const progressApi = {
  getLessonProgress: async (
    lessonId: string
  ): Promise<ApiResponse<Progress>> => {
    return fetchApi<Progress>(`/progress/lesson/${lessonId}`);
  },

  markLessonAsCompleted: async (
    lessonId: string
  ): Promise<ApiResponse<Progress>> => {
    return fetchApi<Progress>(`/progress/lesson/${lessonId}/complete`, {
      method: "POST",
    });
  },
};

export const usersApi = {
  getAllUsers: async (): Promise<ApiResponse<{ data: User[] }>> => {
    return fetchApi<{ data: User[] }>("/users");
  },

  getUserById: async (id: string): Promise<ApiResponse<{ data: User }>> => {
    return fetchApi<{ data: User }>(`/users/${id}`);
  },

  createUser: async (userData: any): Promise<ApiResponse<{ data: User }>> => {
    return fetchApi<{ data: User }>("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  updateUser: async (
    id: string,
    userData: any
  ): Promise<ApiResponse<{ data: User }>> => {
    return fetchApi<{ data: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (
    id: string
  ): Promise<ApiResponse<{ success: boolean }>> => {
    return fetchApi<{ success: boolean }>(`/users/${id}`, {
      method: "DELETE",
    });
  },
};
