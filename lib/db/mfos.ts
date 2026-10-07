import { getSupabaseClient } from '../supabase/client';
import type { MFODefinition } from '@/types';

export async function getMFOs(activeOnly = true): Promise<MFODefinition[]> {
  const supabase = getSupabaseClient();
  let query = supabase.from('mfo_definitions').select('*').order('category').order('mfo_name');

  if (activeOnly) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching MFOs:', error);
    return [];
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    category: m.category,
    mfoName: m.mfo_name,
    successIndicatorDesc: m.success_indicator_desc,
    active: m.active ?? true,
    createdAt: m.created_at,
  }));
}

export async function addMFO(mfo: Partial<MFODefinition>): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('mfo_definitions')
    .insert({
      category: mfo.category || 'Core',
      mfo_name: mfo.mfoName,
      success_indicator_desc: mfo.successIndicatorDesc,
      active: mfo.active ?? true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateMFO(id: string, mfo: Partial<MFODefinition>): Promise<void> {
  const supabase = getSupabaseClient();
  const updateData: any = {};
  if (mfo.category !== undefined) updateData.category = mfo.category;
  if (mfo.mfoName !== undefined) updateData.mfo_name = mfo.mfoName;
  if (mfo.successIndicatorDesc !== undefined) updateData.success_indicator_desc = mfo.successIndicatorDesc;
  if (mfo.active !== undefined) updateData.active = mfo.active;

  const { error } = await supabase.from('mfo_definitions').update(updateData).eq('id', id);
  if (error) throw error;
}

export async function toggleMFO(id: string, currentActive: boolean): Promise<void> {
  return updateMFO(id, { active: !currentActive });
}

export async function deleteMFO(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('mfo_definitions').delete().eq('id', id);
  if (error) throw error;
}
