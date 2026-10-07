import { getSupabaseClient } from '../supabase/client';
import type { IndicatorLog } from '@/types';

export async function logEntry({
  employeeId,
  indicatorId,
  date,
  value,
  notes,
}: {
  employeeId: string;
  indicatorId: string;
  date: string;
  value: number;
  notes?: string;
}): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('indicator_logs')
    .insert({
      employee_id: employeeId,
      indicator_id: indicatorId,
      date,
      value,
      notes,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getLogsForEmployee({
  employeeId,
  year,
}: {
  employeeId: string;
  year?: number;
}): Promise<IndicatorLog[]> {
  const supabase = getSupabaseClient();
  let query = supabase
    .from('indicator_logs')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching indicator logs:', error);
    return [];
  }

  let logs = (data || []).map((d: any) => ({
    id: d.id,
    employeeId: d.employee_id,
    indicatorId: d.indicator_id,
    date: d.date,
    value: Number(d.value) || 0,
    notes: d.notes || '',
    loggedAt: d.logged_at,
  }));

  if (year) {
    logs = logs.filter(l => l.date && l.date.startsWith(`${year}-`));
  }

  return logs;
}

export async function deleteEntry(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('indicator_logs').delete().eq('id', id);
  if (error) throw error;
}

export function computeMonthlyTallies(logs: IndicatorLog[]): number[] {
  const tallies = Array(12).fill(0);
  for (const log of logs) {
    if (!log.date) continue;
    const parts = log.date.split('-');
    if (parts.length >= 2) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      if (monthIdx >= 0 && monthIdx < 12) {
        tallies[monthIdx] += log.value || 0;
      }
    }
  }
  return tallies;
}
