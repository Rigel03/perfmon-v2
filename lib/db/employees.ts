import { getSupabaseClient } from '../supabase/client';
import type { Employee, EmploymentType } from '@/types';

export async function getEmployees(employmentType?: EmploymentType): Promise<Employee[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from('employees').select('*').order('name');

  if (employmentType) {
    query = query.eq('employment_type', employmentType);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching employees:', error);
    return [];
  }

  return (data || []).map((e: any) => ({
    id: e.id,
    name: e.name,
    position: e.position,
    section: e.section,
    division: e.division,
    employmentType: e.employment_type || 'plantilla',
    createdAt: e.created_at,
  }));
}

export async function addEmployee(emp: Partial<Employee>): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('employees')
    .insert({
      name: emp.name,
      position: emp.position,
      section: emp.section,
      division: emp.division,
      employment_type: emp.employmentType || 'plantilla',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateEmployee(id: string, emp: Partial<Employee>): Promise<void> {
  const supabase = getSupabaseClient();
  const updateData: any = { updated_at: new Date().toISOString() };
  if (emp.name !== undefined) updateData.name = emp.name;
  if (emp.position !== undefined) updateData.position = emp.position;
  if (emp.section !== undefined) updateData.section = emp.section;
  if (emp.division !== undefined) updateData.division = emp.division;
  if (emp.employmentType !== undefined) updateData.employment_type = emp.employmentType;

  const { error } = await supabase.from('employees').update(updateData).eq('id', id);
  if (error) throw error;
}

export async function deleteEmployee(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}
