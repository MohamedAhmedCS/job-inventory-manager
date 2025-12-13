export interface JobApplication {
  id: number;
  company: string;
  title: string;
  location: string;
  status: string;
  appliedDate: string;
  notes: string;
}

const API_BASE = "http://localhost:5132/api/jobapplications";

// Get token from localStorage
function getToken(): string {
  return localStorage.getItem("authToken") || "";
}

// Helper to make authenticated requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("authToken");
    window.location.href = "/";
    throw new Error("Unauthorized");
  }

  if (!response.ok) throw new Error(`Request failed: ${response.statusText}`);
  return response;
}

// Get all jobs
export async function getAllJobs(): Promise<JobApplication[]> {
  const response = await fetchWithAuth(API_BASE);
  return await response.json();
}

// Create a new job
export async function createJob(job: Partial<JobApplication>): Promise<JobApplication> {
  const response = await fetchWithAuth(API_BASE, {
    method: "POST",
    body: JSON.stringify(job),
  });
  return await response.json();
}

// Update a job
export async function updateJob(id: number, job: Partial<JobApplication>): Promise<JobApplication> {
  const response = await fetchWithAuth(`${API_BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(job),
  });
  return await response.json();
}

// Delete a job
export async function deleteJob(id: number): Promise<void> {
  await fetchWithAuth(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
}

// Authentication functions
export async function login(username: string, password: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:5132/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Invalid credentials" }));
      throw new Error(error?.error || "Invalid credentials");
    }
    
    const data = await response.json();
    localStorage.setItem("authToken", data.token);
    return data.token;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function register(username: string, password: string): Promise<string> {
  try {
    const response = await fetch("http://localhost:5132/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Registration failed" }));
      throw new Error(error?.error || "Registration failed");
    }
    
    const data = await response.json();
    localStorage.setItem("authToken", data.token);
    return data.token;
  } catch (error) {
    console.error("Register error:", error);
    throw error;
  }
}

export function logout(): void {
  localStorage.removeItem("authToken");
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("authToken");
}
