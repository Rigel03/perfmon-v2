import { getSupabaseClient } from '../supabase/client';
import type { PerformanceRecord, RecordFilters } from '@/types';

export function buildRecordId(employeeId: string, mfoId: string, quarter: string, year: number | string): string {
  return `${employeeId}_${mfoId}_${quarter}_${year}`;
}

export async function getRecords(filters: RecordFilters = {}): Promise<PerformanceRecord[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from('performance_records').select('*');

  if (filters.employeeId) query = query.eq('employee_id', filters.employeeId);
  if (filters.year) query = query.eq('year', filters.year);
  if (filters.quarter) query = query.eq('quarter', filters.quarter);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching records:', error);
    return [];
  }

  return (data || []).map((d: any) => ({
    id: d.id,
    employeeId: d.employee_id,
    mfoId: d.mfo_id,
    quarter: d.quarter,
    year: d.year,
    targetQty: d.target_qty ?? 0,
    totalQty: d.total_qty ?? 0,
    quantityM1: d.quantity_m1 ?? 0,
    quantityM2: d.quantity_m2 ?? 0,
    quantityM3: d.quantity_m3 ?? 0,
    status: d.status || 'Not Started',
    adminRemarks: d.admin_remarks || '',
    remarks: d.remarks || '',
    updatedAt: d.updated_at,
    reviewedAt: d.reviewed_at,
  }));
}

export async function saveRecord(
  employeeId: string,
  mfoId: string,
  quarter: string,
  year: number,
  payload: Partial<PerformanceRecord>
): Promise<void> {
  const supabase = getSupabaseClient();
  const id = buildRecordId(employeeId, mfoId, quarter, year);

  const { error } = await supabase.from('performance_records').upsert(
    {
      id,
      employee_id: employeeId,
      mfo_id: mfoId,
      quarter,
      year,
      target_qty: payload.targetQty || 0,
      total_qty: payload.totalQty || 0,
      quantity_m1: payload.quantityM1 || 0,
      quantity_m2: payload.quantityM2 || 0,
      quantity_m3: payload.quantityM3 || 0,
      status: payload.status || 'Pending',
      admin_remarks: payload.remarks || payload.adminRemarks || '',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) throw error;
}

export async function updateRecordStatus(
  id: string,
  status: string,
  adminRemarks?: string
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('performance_records')
    .update({
      status,
      admin_remarks: adminRemarks || '',
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export async function deleteRecord(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('performance_records').delete().eq('id', id);
  if (error) throw error;
}
