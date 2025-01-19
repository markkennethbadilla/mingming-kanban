export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface TaskResponse {
    tasks: Task[];
  }
  
  export interface TagResponse {
    tags: Tag[];
  }
  