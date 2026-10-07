import { getSupabaseClient } from '../supabase/client';
import type { PerformanceIndicator } from '@/types';

export async function getIndicators(activeOnly = true): Promise<PerformanceIndicator[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from('performance_indicators').select('*').order('created_at');

  if (activeOnly) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching indicators:', error);
    return [];
  }

  return (data || []).map((i: any) => ({
    id: i.id,
    indicatorDesc: i.indicator_desc,
    functionName: i.function_name || '',
    quarterlyTarget: i.quarterly_target,
    annualTarget: i.annual_target,
    active: i.active ?? true,
    createdAt: i.created_at,
  }));
}

export async function addIndicator(ind: Partial<PerformanceIndicator>): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('performance_indicators')
    .insert({
      indicator_desc: ind.indicatorDesc,
      active: ind.active ?? true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateIndicator(id: string, ind: Partial<PerformanceIndicator>): Promise<void> {
  const supabase = getSupabaseClient();
  const updateData: any = {};
  if (ind.indicatorDesc !== undefined) updateData.indicator_desc = ind.indicatorDesc;
  if (ind.active !== undefined) updateData.active = ind.active;

  const { error } = await supabase.from('performance_indicators').update(updateData).eq('id', id);
  if (error) throw error;
}

export async function toggleIndicator(id: string, currentActive: boolean): Promise<void> {
  return updateIndicator(id, { active: !currentActive });
}

export async function deleteIndicator(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('performance_indicators').delete().eq('id', id);
  if (error) throw error;
}

export async function getEmployeeIndicators(employeeId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('indicator_assignments')
    .select('indicator_id')
    .eq('employee_id', employeeId);

  if (error) {
    console.error('Error fetching employee indicator assignments:', error);
    return [];
  }

  return (data || []).map((d: any) => d.indicator_id);
}

export async function setEmployeeIndicators(employeeId: string, indicatorIds: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from('indicator_assignments').delete().eq('employee_id', employeeId);

  if (indicatorIds.length === 0) return;

  const records = indicatorIds.map(indicator_id => ({
    employee_id: employeeId,
    indicator_id,
  }));

  const { error } = await supabase.from('indicator_assignments').insert(records);
  if (error) throw error;
}
