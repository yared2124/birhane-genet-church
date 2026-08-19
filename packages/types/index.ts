// Shared TypeScript types for frontend and backend
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

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  lastLogin?: Date;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  christianName?: string;
  gender: string;
  phone?: string;
  address?: string;
  job?: string;
  maritalStatus?: string;
  childrenCount?: number;
  isHeadOfHousehold: boolean;
  familyId?: string;
  confessorPriestId?: string;
  memberStatus: MemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Family {
  id: string;
  familyCode: string;
  headOfHouseholdId: string;
  members: Member[];
  createdAt: Date;
}

export interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description?: string;
  transactionDate: Date;
  status: TransactionStatus;
  familyId?: string;
  memberId?: string;
  preparedById: string;
  approvedById?: string;
  approvedAt?: Date;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
