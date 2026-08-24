/**
 * Shared TypeScript types for both frontend and backend.
 * Ensures type safety across the entire monorepo.
 */

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  SEBEKA_GUBAE = "SEBEKA_GUBAE",
  PRIEST = "PRIEST",
  CASHIER = "CASHIER",
  PROPERTY_MANAGER = "PROPERTY_MANAGER",
  REGISTRAR = "REGISTRAR",
  YOUTH_COORDINATOR = "YOUTH_COORDINATOR",
  MEMBER = "MEMBER",
}

export enum TransactionStatus {
  DRAFT = "DRAFT",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  PAID = "PAID",
}

export enum MemberStatus {
  ACTIVE = "ACTIVE",
  DECEASED = "DECEASED",
  TRANSFERRED = "TRANSFERRED",
  EXCOMMUNICATED = "EXCOMMUNICATED",
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  WIDOWED = "WIDOWED",
  DIVORCED = "DIVORCED",
}

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: string;
  employee?: Employee;
}

export interface Employee {
  id: string;
  fullName: string;
  christianName?: string;
  jobTitle: string;
  phone?: string;
}

export interface Family {
  id: string;
  familyCode: string;
  headOfHouseholdId: string;
  head?: Member;
  members?: Member[];
  createdAt: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  christianName?: string;
  gender: "Male" | "Female";
  phone?: string;
  address?: string;
  job?: string;
  maritalStatus?: MaritalStatus;
  childrenCount?: number;
  isHeadOfHousehold: boolean;
  familyId?: string;
  family?: Family;
  confessorPriestId?: string;
  confessor?: Employee;
  memberStatus: MemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  description?: string;
  transactionDate: string;
  status: TransactionStatus;
  familyId?: string;
  family?: Family;
  memberId?: string;
  member?: Member;
  preparedById: string;
  preparedBy?: User;
  approvedById?: string;
  approvedBy?: User;
  approvedAt?: string;
}

export interface CertificateRequest {
  id: string;
  serviceType: "BAPTISM" | "MARRIAGE";
  referenceId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  certificatePdfPath?: string;
  createdAt: string;
  requestedBy?: Employee;
  approvedBy?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalMembers: number;
  occupiedHouses: number;
  pendingApprovals: number;
  recentBaptisms: Baptism[];
  weeklyIncome: number;
}

export interface Baptism {
  id: string;
  childFullName: string;
  childGender: "Male" | "Female";
  birthDate: string;
  christianName?: string;
  fatherName: string;
  motherName: string;
  godfatherName?: string;
  godmotherName?: string;
  parentPhone?: string;
  baptismDate: string;
  performedByPriestId: string;
  performedBy?: Employee;
  childMemberId?: string;
  childMember?: Member;
}
