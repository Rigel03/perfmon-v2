'use client';
import { useState, useEffect } from 'react';
import { getEmployees } from '@/lib/db/employees';
import { getMFOs } from '@/lib/db/mfos';
import { getEmployeeMFOs, setEmployeeMFOs } from '@/lib/db/assignments';
import { FloppyDisk, Check } from '@phosphor-icons/react';
import type { Employee, MFODefinition } from '@/types';

export default function AssignmentsAdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mfos, setMfos] = useState<MFODefinition[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<string>('');
  const [assignedMfoIds, setAssignedMfoIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [emps, mfoList] = await Promise.all([
          getEmployees('plantilla'),
          getMFOs(true),
        ]);
        setEmployees(emps);
        setMfos(mfoList);
        if (emps.length > 0) {
          setSelectedEmp(emps[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    async function fetchAssigned() {
      if (!selectedEmp) return;
      const ids = await getEmployeeMFOs(selectedEmp);
      setAssignedMfoIds(ids);
      setSavedSuccess(false);
    }
    fetchAssigned();
  }, [selectedEmp]);

  function handleToggle(mfoId: string) {
    setAssignedMfoIds((prev) =>
      prev.includes(mfoId) ? prev.filter((id) => id !== mfoId) : [...prev, mfoId]
    );
    setSavedSuccess(false);
  }

  async function handleSave() {
    if (!selectedEmp) return;
    setSaving(true);
    try {
      await setEmployeeMFOs(selectedEmp, assignedMfoIds);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const currentOfficer = employees.find((e) => e.id === selectedEmp);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
            MFO Assignment Mapping
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Designate which Major Final Outputs appear in each officer&apos;s IPCR commitment form
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !selectedEmp}
          className="btn btn-primary btn-sm"
        >
          {savedSuccess ? <Check size={16} weight="bold" /> : <FloppyDisk size={16} weight="bold" />}
          <span>{saving ? 'Saving...' : savedSuccess ? 'Assignments Saved!' : 'Save Mapping'}</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Officer Selection List */}
        <div className="card" style={{ padding: '8px' }}>
          <div style={{ padding: '8px 10px', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)' }}>
            Plantilla Officers ({employees.length})
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '24px' }}>
              <div className="spinner" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {employees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmp(emp.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: selectedEmp === emp.id ? 700 : 500,
                    background: selectedEmp === emp.id ? 'var(--color-card-secondary)' : 'transparent',
                    border: selectedEmp === emp.id ? '1px solid var(--color-primary)' : '1px solid transparent',
                    color: selectedEmp === emp.id ? 'var(--color-primary)' : 'var(--color-text)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {emp.position || 'Regular Officer'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* MFO Checkboxes */}
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-text)' }}>
                Assigned Outputs for {currentOfficer?.name || 'Officer'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginTop: 2 }}>
                {assignedMfoIds.length} of {mfos.length} outputs active
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setAssignedMfoIds(mfos.map((m) => m.id))}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => setAssignedMfoIds([])}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.74rem', padding: '4px 8px' }}
              >
                Clear All
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '600px', overflowY: 'auto' }}>
            {mfos.map((mfo) => {
              const isChecked = assignedMfoIds.includes(mfo.id);
              return (
                <label
                  key={mfo.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: isChecked ? 'var(--color-primary)' : 'var(--color-border)',
                    background: isChecked ? 'var(--color-card-secondary)' : 'var(--color-card-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(mfo.id)}
                    style={{ marginTop: 3, accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className={`badge ${mfo.category === 'Core' ? 'badge-core' : 'badge-support'}`} style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                        {mfo.category}
                      </span>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{mfo.mfoName}</strong>
                    </div>
                    <p style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.4 }}>
                      {mfo.successIndicatorDesc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
