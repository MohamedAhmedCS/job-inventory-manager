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

// ✅ Get all jobs
export async function getAllJobs(): Promise<JobApplication[]> {
  const response = await fetch(API_BASE);
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return await response.json();
}

// ✅ Create a new job
export async function createJob(job: Partial<JobApplication>): Promise<JobApplication> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
  if (!response.ok) throw new Error("Failed to create job");
  return await response.json();
}

// ✅ Update a job
export async function updateJob(id: number, job: Partial<JobApplication>): Promise<JobApplication> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(job),
  });
  if (!response.ok) throw new Error("Failed to update job");
  return await response.json();
}

// ✅ Delete a job
export async function deleteJob(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete job");
}
