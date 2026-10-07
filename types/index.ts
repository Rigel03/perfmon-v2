// ─── Shared Type Definitions ──────────────────────────────────────────────────

export type UserRole = 'admin' | 'employee';
export type EmploymentType = 'plantilla' | 'jo_cos';
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';
export type RecordStatus =
  | 'Accomplished'
  | 'Partial'
  | 'Pending'
  | 'Deferred'
  | 'Not Started';
export type MFOCategory = 'Core' | 'Support';

// ─── Auth & Users ──────────────────────────────────────────────────────────────

export interface Profile {
  uid: string;
  email: string;
  role: UserRole;
  employeeId: string | null;
  displayName: string;
  avatarId?: string;
  gender?: string;
  employmentType?: EmploymentType | null;
  createdAt?: string;
}

// ─── Employees ─────────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  name: string;
  position?: string;
  section?: string;
  division?: string;
  employmentType: EmploymentType;
  createdAt: string;
}

// ─── MFOs ─────────────────────────────────────────────────────────────────────

export interface MFODefinition {
  id: string;
  category: MFOCategory;
  mfoName: string;
  successIndicatorDesc?: string;
  active: boolean;
  createdAt?: string;
}

// ─── Performance Records ───────────────────────────────────────────────────────

export interface PerformanceRecord {
  id: string;
  employeeId: string;
  mfoId: string;
  quarter: Quarter;
  year: number;
  targetQty: number;
  totalQty: number;
  quantityM1: number;
  quantityM2: number;
  quantityM3: number;
  status: RecordStatus;
  adminRemarks?: string;
  remarks?: string;
  updatedAt?: string;
  reviewedAt?: string;
}

// ─── Performance Indicators (JO/COS) ──────────────────────────────────────────

export interface PerformanceIndicator {
  id: string;
  functionName?: string;
  indicatorDesc: string;
  quarterlyTarget?: number;
  annualTarget?: number;
  active: boolean;
  createdAt?: string;
}

// ─── Indicator Logs ────────────────────────────────────────────────────────────

export interface IndicatorLog {
  id: string;
  employeeId: string;
  indicatorId: string;
  date: string; // YYYY-MM-DD
  value: number;
  notes?: string;
  loggedAt?: string;
}

// ─── DB Query Filters ──────────────────────────────────────────────────────────

export interface RecordFilters {
  employeeId?: string;
  year?: number;
  quarter?: Quarter;
}

export interface LogFilters {
  employeeId: string;
  year?: number;
  month?: number;
}

// ─── UI Helpers ────────────────────────────────────────────────────────────────

export interface StatusConfig {
  label: string;
  badge: string;
  dot: string;
  bg: string;
  text: string;
}

export type Theme = 'light' | 'dark' | 'system';
