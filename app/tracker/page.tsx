'use client';
import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { getIndicators, getEmployeeIndicators } from '@/lib/db/indicators';
import { logEntry, getLogsForEmployee, deleteEntry } from '@/lib/db/indicatorLogs';
import { getEmployees } from '@/lib/db/employees';
import { Trash, Plus, CaretDown, CaretUp } from '@phosphor-icons/react';
import type { PerformanceIndicator, IndicatorLog, Employee } from '@/types';

const CUR_YEAR = new Date().getFullYear();

function LogModal({
  indicator,
  existingLogs,
  employeeId,
  year,
  onClose,
  onSaved,
}: {
  indicator: PerformanceIndicator;
  existingLogs: IndicatorLog[];
  employeeId: string;
  year: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(today);
  const [value, setValue] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const tally = existingLogs.reduce((s, l) => s + (Number(l.value) || 0), 0);
  const target = Number(indicator.quarterlyTarget || indicator.annualTarget || 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!value || value <= 0) {
      setError('Value must be greater than 0');
      return;
    }
    setSaving(true);
    try {
      await logEntry({ employeeId, indicatorId: indicator.id, date, value: Number(value), notes });
      onSaved();
      onClose();
    } catch (err: any) {
      setError('Failed to record: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">Record Accomplishment</h3>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{
          background: 'var(--color-card-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
          marginBottom: 16
        }}>
          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--color-text)' }}>
            {indicator.functionName || 'Performance Indicator'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4, lineHeight: 1.4 }}>
            {indicator.indicatorDesc}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, fontSize: '0.8rem', fontWeight: 600 }}>
            <span>Running Tally: <strong style={{ fontWeight: 900, color: 'var(--color-primary)' }}>{tally}</strong></span>
            {target > 0 && <span>Target: <strong style={{ color: 'var(--color-text)' }}>{target}</strong></span>}
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date of Entry</label>
              <input
                type="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={today}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Accomplished Output Quantity</label>
              <input
                type="number"
                min={1}
                className="form-control"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Remarks / Location / Notes (Optional)</label>
            <textarea
              className="form-control"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide field details, location, or citation reference..."
            />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn btn-blue" style={{ flex: 2 }}>
              {saving ? 'Saving...' : 'Save Log Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TrackerPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'log' | 'history'>('log');
  const [indicators, setIndicators] = useState<PerformanceIndicator[]>([]);
  const [logs, setLogs] = useState<IndicatorLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [selectedIndicator, setSelectedIndicator] = useState<PerformanceIndicator | null>(null);
  const [openFunctions, setOpenFunctions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin = user?.role === 'admin';

  const loadData = useCallback(async () => {
    const empId = isAdmin ? selectedEmpId : user?.employeeId;
    if (!empId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [allInds, assignedIds, empLogs] = await Promise.all([
        getIndicators(true),
        getEmployeeIndicators(empId),
        getLogsForEmployee({ employeeId: empId, year: CUR_YEAR }),
      ]);
      const myInds =
        assignedIds.length > 0 ? allInds.filter((i) => assignedIds.includes(i.id)) : allInds;
      setIndicators(myInds);
      setLogs(empLogs);
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin, selectedEmpId]);

  useEffect(() => {
    async function init() {
      if (isAdmin) {
        const emps = await getEmployees('jo_cos');
        setEmployees(emps);
        if (emps.length > 0 && !selectedEmpId) {
          setSelectedEmpId(emps[0].id);
        }
      }
    }
    init();
  }, [user, isAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this log entry?')) return;
    try {
      await deleteEntry(id);
      loadData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  // Group by function name
  const grouped: Record<string, PerformanceIndicator[]> = {};
  indicators.forEach((i) => {
    const fn = i.functionName || 'General Indicators';
    if (!grouped[fn]) grouped[fn] = [];
    grouped[fn].push(i);
  });

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Daily Output Tracker
            </h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Rapid logging for JO/COS performance metrics and accomplishment counts
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-muted)' }}>Officer:</span>
                <select
                  className="form-control"
                  style={{ width: 'auto', minWidth: 200, padding: '5px 10px', fontSize: '0.8rem' }}
                  value={selectedEmpId || ''}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                >
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', background: 'var(--color-card-secondary)', padding: 3, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
              <button
                className="btn btn-sm"
                style={{
                  background: tab === 'log' ? 'var(--color-card-bg)' : 'transparent',
                  color: tab === 'log' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: tab === 'log' ? 'var(--shadow-xs)' : 'none',
                  fontWeight: tab === 'log' ? 700 : 600,
                  border: 'none',
                }}
                onClick={() => setTab('log')}
              >
                Log Metrics
              </button>
              <button
                className="btn btn-sm"
                style={{
                  background: tab === 'history' ? 'var(--color-card-bg)' : 'transparent',
                  color: tab === 'history' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: tab === 'history' ? 'var(--shadow-xs)' : 'none',
                  fontWeight: tab === 'history' ? 700 : 600,
                  border: 'none',
                }}
                onClick={() => setTab('history')}
              >
                History ({logs.length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : tab === 'log' ? (
          <div>
            {indicators.length === 0 ? (
              <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>
                No performance indicators assigned for this officer.
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
                gap: 16,
              }}>
                {indicators.map((ind) => {
                  const indLogs = logs.filter((l) => l.indicatorId === ind.id);
                  const tally = indLogs.reduce((s, l) => s + (Number(l.value) || 0), 0);
                  return (
                    <div
                      key={ind.id}
                      className="card bento-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '18px 20px',
                        gap: 16,
                        minHeight: '210px',
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {/* Top tag */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}>
                          <span style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--color-text-muted)'
                          }}>
                            Indicator
                          </span>
                          {indLogs.length > 0 && (
                            <span className="badge badge-admin" style={{ fontSize: '0.66rem', padding: '1px 7px' }}>
                              {indLogs.length} {indLogs.length === 1 ? 'entry' : 'entries'}
                            </span>
                          )}
                        </div>

                        {/* BOLD FOR TITLE */}
                        <h3 style={{
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          color: 'var(--color-text)',
                          lineHeight: 1.35,
                          marginBottom: 6,
                        }}>
                          {ind.functionName || 'Performance Indicator'}
                        </h3>

                        {/* THIN FOR DESCRIPTION */}
                        <p style={{
                          fontSize: '0.8rem',
                          fontWeight: 400,
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.45,
                          flex: 1,
                        }}>
                          {ind.indicatorDesc}
                        </p>
                      </div>

                      {/* Bento Stat & Action Footer */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        paddingTop: 12,
                        borderTop: '1px solid var(--color-border-subtle)',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 6,
                        }}>
                          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--color-primary)', lineHeight: 1 }}>
                            {tally}
                          </span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                            Logged
                          </span>
                        </div>

                        <button
                          onClick={() => setSelectedIndicator(ind)}
                          className="btn btn-primary btn-sm"
                          style={{ gap: 5, fontSize: '0.76rem', padding: '6px 12px' }}
                        >
                          <Plus size={14} weight="bold" />
                          <span>Log Output</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* History View */
          <div className="card">
            <div className="card-header">
              <span>Log Entry History ({logs.length})</span>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 110 }}>Date</th>
                    <th>Function</th>
                    <th>Indicator Description</th>
                    <th style={{ textAlign: 'center', width: 90 }}>Value</th>
                    <th>Remarks</th>
                    <th style={{ textAlign: 'right', width: 80 }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
                        No accomplishment logs recorded yet for this officer.
                      </td>
                    </tr>
                  ) : (
                    [...logs].reverse().map((l) => {
                      const ind = indicators.find((i) => i.id === l.indicatorId);
                      return (
                        <tr key={l.id}>
                          <td>
                            <span className="doc-code-pill">{l.date}</span>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--color-text)', maxWidth: 180 }}>{ind?.functionName || '—'}</td>
                          <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', maxWidth: 280 }}>
                            {ind?.indicatorDesc || l.indicatorId}
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--color-primary)' }}>{l.value}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{l.notes || '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleDelete(l.id)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '3px 8px', color: 'var(--color-danger)' }}
                              title="Delete log"
                            >
                              <Trash size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Log Modal */}
        {selectedIndicator && (
          <LogModal
            indicator={selectedIndicator}
            existingLogs={logs.filter((l) => l.indicatorId === selectedIndicator.id)}
            employeeId={isAdmin ? selectedEmpId || '' : user?.employeeId || ''}
            year={CUR_YEAR}
            onClose={() => setSelectedIndicator(null)}
            onSaved={loadData}
          />
        )}
      </div>
    </AppShell>
  );
}
