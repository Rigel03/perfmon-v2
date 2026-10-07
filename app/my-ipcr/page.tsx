'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { getMFOs } from '@/lib/db/mfos';
import { getRecords, saveRecord } from '@/lib/db/records';
import { getEmployees } from '@/lib/db/employees';
import { getEmployeeMFOs } from '@/lib/db/assignments';
import { X, FloppyDisk, PencilSimple } from '@phosphor-icons/react';
import type { MFODefinition, PerformanceRecord, Employee, Quarter } from '@/types';

const QUARTER_MONTHS: Record<string, string[]> = {
  Q1: ['January', 'February', 'March'],
  Q2: ['April', 'May', 'June'],
  Q3: ['July', 'August', 'September'],
  Q4: ['October', 'November', 'December'],
};

const CUR_YEAR = new Date().getFullYear();

function MFOBentoCard({
  mfo,
  record,
  onEdit,
}: {
  mfo: MFODefinition;
  record?: PerformanceRecord;
  onEdit: (mfo: MFODefinition, record?: PerformanceRecord) => void;
}) {
  const status = record?.status || 'Not Started';
  const target = record?.targetQty || 0;
  const total = record?.totalQty || 0;
  const pct = target > 0 ? Math.min(Math.round((total / target) * 100), 100) : total > 0 ? 100 : 0;

  return (
    <div
      onClick={() => onEdit(mfo, record)}
      className="card bento-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '18px 20px',
        cursor: 'pointer',
        gap: 16,
        minHeight: '210px',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
          <span
            className={`badge badge-${status.toLowerCase().replace(/\s+/g, '')}`}
            style={{ fontSize: '0.72rem', flexShrink: 0 }}
          >
            {status}
          </span>
          <span
            className={`badge ${mfo.category === 'Core' ? 'badge-core' : 'badge-support'}`}
            style={{ fontSize: '0.68rem', padding: '2px 8px' }}
          >
            {mfo.category}
          </span>
        </div>

        {/* BOLD FOR TITLE */}
        <h3 style={{
          fontSize: '0.92rem',
          fontWeight: 800,
          color: 'var(--color-text)',
          lineHeight: 1.35,
          marginBottom: 6,
        }}>
          {mfo.mfoName}
        </h3>

        {/* THIN FOR DESCRIPTION */}
        {mfo.successIndicatorDesc && (
          <p style={{
            fontSize: '0.8rem',
            fontWeight: 400,
            color: 'var(--color-text-muted)',
            lineHeight: 1.45,
          }}>
            {mfo.successIndicatorDesc}
          </p>
        )}
      </div>

      <div>
        {/* Bento Metric Stats */}
        <div style={{
          background: 'var(--color-card-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 6,
          textAlign: 'center',
          marginBottom: 10,
        }}>
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Target</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)', marginTop: 2 }}>{target}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Logged</div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)', marginTop: 2 }}>{total}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Rate</div>
            <div style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: pct >= 100 ? 'var(--color-success)' : pct > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)',
              marginTop: 2
            }}>
              {pct}%
            </div>
          </div>
        </div>

        {/* Progress Fill */}
        <div style={{
          height: 5,
          width: '100%',
          background: 'var(--color-border)',
          borderRadius: 99,
          overflow: 'hidden',
          marginBottom: 12,
        }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: pct >= 100 ? 'var(--color-success)' : 'var(--color-primary)',
              borderRadius: 99,
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ width: '100%', justifyContent: 'center', gap: 6, fontSize: '0.76rem' }}
        >
          <PencilSimple size={13} weight="bold" />
          <span>Edit Entry</span>
        </button>
      </div>
    </div>
  );
}

function EntryModal({
  mfo,
  record,
  months,
  empId,
  mfoId,
  quarter,
  year,
  onClose,
  onSaved,
}: {
  mfo: MFODefinition;
  record?: PerformanceRecord;
  months: string[];
  empId: string;
  mfoId: string;
  quarter: string;
  year: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [targetQty, setTargetQty] = useState<number>(record?.targetQty || 0);
  const [m1, setM1] = useState<number>(record?.quantityM1 || 0);
  const [m2, setM2] = useState<number>(record?.quantityM2 || 0);
  const [m3, setM3] = useState<number>(record?.quantityM3 || 0);
  const [status, setStatus] = useState<string>(record?.status || 'Pending');
  const [remarks, setRemarks] = useState<string>(record?.adminRemarks || record?.remarks || '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const total = Number(m1) + Number(m2) + Number(m3);
  const pct = targetQty > 0 ? Math.min(Math.round((total / targetQty) * 100), 100) : 0;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      await saveRecord(empId, mfoId, quarter, year, {
        targetQty: Number(targetQty),
        quantityM1: Number(m1),
        quantityM2: Number(m2),
        quantityM3: Number(m3),
        totalQty: total,
        status: status as any,
        remarks,
        adminRemarks: remarks,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      console.error('Failed to save record:', err);
      setSaveError(err.message || 'Failed to save performance record.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Record Quarterly Performance</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{
          background: 'var(--color-card-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          marginBottom: 16
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-text)' }}>
            {mfo.mfoName}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {mfo.successIndicatorDesc}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text)' }}>
            <span>Target: <strong>{targetQty}</strong></span>
            <span>Total Logged: <strong>{total}</strong> ({pct}%)</span>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {saveError && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: 'rgba(239, 68, 68, 0.15)',
              color: 'var(--color-danger)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}>
              {saveError}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Quarterly Target Commitment</label>
            <input
              type="number"
              min={0}
              className="form-control"
              value={targetQty}
              onChange={(e) => setTargetQty(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="form-label">Monthly Accomplishment Output</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 4 }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{months[0]}</span>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  style={{ marginTop: 2 }}
                  value={m1}
                  onChange={(e) => setM1(Number(e.target.value))}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{months[1]}</span>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  style={{ marginTop: 2 }}
                  value={m2}
                  onChange={(e) => setM2(Number(e.target.value))}
                />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{months[2]}</span>
                <input
                  type="number"
                  min={0}
                  className="form-control"
                  style={{ marginTop: 2 }}
                  value={m3}
                  onChange={(e) => setM3(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Status</label>
            <select
              className="form-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Accomplished">Accomplished</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending Review</option>
              <option value="Deferred">Deferred</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Remarks / Justification</label>
            <textarea
              className="form-control"
              rows={2}
              placeholder="Explanations for variances, delays, or milestones..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              <FloppyDisk size={15} weight="bold" />
              <span>{saving ? 'Saving...' : 'Save Commitment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MyIPCRPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [quarter, setQuarter] = useState<Quarter>('Q1');
  const [year, setYear] = useState<number>(CUR_YEAR);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [mfos, setMFOs] = useState<MFODefinition[]>([]);
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMfo, setEditingMfo] = useState<{ mfo: MFODefinition; record?: PerformanceRecord } | null>(null);

  const isAdmin = user?.role === 'admin';

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let targetEmpId = user.employeeId || user.uid;

      if (isAdmin) {
        const emps = await getEmployees('plantilla');
        setAllEmployees(emps);
        if (!selectedEmpId && emps.length > 0) {
          targetEmpId = emps[0].id;
          setSelectedEmpId(emps[0].id);
        } else if (selectedEmpId) {
          targetEmpId = selectedEmpId;
        }
      }

      const [allMfos, assignedIds, recs] = await Promise.all([
        getMFOs(true),
        getEmployeeMFOs(targetEmpId),
        getRecords({ employeeId: targetEmpId, year, quarter }),
      ]);

      const filteredMfos =
        assignedIds.length > 0 ? allMfos.filter((m) => assignedIds.includes(m.id)) : allMfos;

      setMFOs(filteredMfos);
      setRecords(recs);
    } catch (err) {
      console.error('My IPCR load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, selectedEmpId, year, quarter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const coreMfos = mfos.filter((m) => m.category === 'Core');
  const supportMfos = mfos.filter((m) => m.category === 'Support');

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Header Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Individual Performance Commitment & Review
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Track and submit quarterly targets and outputs for Plantilla evaluation
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isAdmin && allEmployees.length > 0 && (
              <select
                className="form-control"
                style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                {allEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            )}

            <div style={{ display: 'flex', gap: 4 }}>
              {(['Q1', 'Q2', 'Q3', 'Q4'] as Quarter[]).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuarter(q)}
                  className={`btn btn-sm ${quarter === q ? 'btn-primary' : 'btn-outline'}`}
                  style={{ minWidth: 44 }}
                >
                  {q}
                </button>
              ))}
            </div>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Core Functions Bento Section */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
                paddingBottom: 8,
                borderBottom: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    Core Functions
                  </h2>
                  <span className="badge badge-core" style={{ fontSize: '0.72rem' }}>
                    {coreMfos.length} {coreMfos.length === 1 ? 'output' : 'outputs'}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Primary mandated outputs
                </span>
              </div>

              {coreMfos.length === 0 ? (
                <div className="card" style={{ padding: 28, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
                  No Core functions assigned for this session.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: 16
                }}>
                  {coreMfos.map((mfo) => {
                    const rec = records.find((r) => r.mfoId === mfo.id);
                    return (
                      <MFOBentoCard
                        key={mfo.id}
                        mfo={mfo}
                        record={rec}
                        onEdit={(m, r) => setEditingMfo({ mfo: m, record: r })}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Support Functions Bento Section */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 14,
                paddingBottom: 8,
                borderBottom: '1px solid var(--color-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)' }}>
                    Support Functions
                  </h2>
                  <span className="badge badge-support" style={{ fontSize: '0.72rem' }}>
                    {supportMfos.length} {supportMfos.length === 1 ? 'output' : 'outputs'}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                  Administrative & operational support
                </span>
              </div>

              {supportMfos.length === 0 ? (
                <div className="card" style={{ padding: 28, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
                  No Support functions assigned for this session.
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                  gap: 16
                }}>
                  {supportMfos.map((mfo) => {
                    const rec = records.find((r) => r.mfoId === mfo.id);
                    return (
                      <MFOBentoCard
                        key={mfo.id}
                        mfo={mfo}
                        record={rec}
                        onEdit={(m, r) => setEditingMfo({ mfo: m, record: r })}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingMfo && (
          <EntryModal
            mfo={editingMfo.mfo}
            record={editingMfo.record}
            months={QUARTER_MONTHS[quarter]}
            empId={(isAdmin ? selectedEmpId : user?.employeeId || user?.uid) || ''}
            mfoId={editingMfo.mfo.id}
            quarter={quarter}
            year={year}
            onClose={() => setEditingMfo(null)}
            onSaved={loadData}
          />
        )}
      </div>
    </AppShell>
  );
}
