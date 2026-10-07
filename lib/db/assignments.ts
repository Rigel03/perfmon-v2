import { getSupabaseClient } from '../supabase/client';

export async function getEmployeeMFOs(employeeId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('mfo_assignments')
    .select('mfo_id')
    .eq('employee_id', employeeId);

  if (error) {
    console.error('Error fetching employee MFO assignments:', error);
    return [];
  }

  return (data || []).map((d: any) => d.mfo_id);
}

export async function setEmployeeMFOs(employeeId: string, mfoIds: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  await supabase.from('mfo_assignments').delete().eq('employee_id', employeeId);

  if (mfoIds.length === 0) return;

  const records = mfoIds.map(mfo_id => ({
    employee_id: employeeId,
    mfo_id,
  }));

  const { error } = await supabase.from('mfo_assignments').insert(records);
  if (error) throw error;
}
