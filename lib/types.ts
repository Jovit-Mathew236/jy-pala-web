export interface RegistrationRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  department?: string;
  position?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  approvedBy?: string;
  approvedAt?: string;
}
