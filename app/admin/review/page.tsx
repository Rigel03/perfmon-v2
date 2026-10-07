'use client';
import { useState, useEffect, useCallback } from 'react';
import { getRecords, updateRecordStatus } from '@/lib/db/records';
import { getEmployees } from '@/lib/db/employees';
import { getMFOs } from '@/lib/db/mfos';
import { CheckCircle, Prohibit, HourglassMedium, WarningCircle } from '@phosphor-icons/react';
import type { PerformanceRecord, Employee, MFODefinition } from '@/types';

const CUR_YEAR = new Date().getFullYear();

export default function ReviewAdminPage() {
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mfos, setMfos] = useState<MFODefinition[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('Pending');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, emps, mfoList] = await Promise.all([
        getRecords({ year: CUR_YEAR }),
        getEmployees(),
        getMFOs(true),
      ]);
      setRecords(recs);
      setEmployees(emps);
      setMfos(mfoList);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleSetStatus(recordId: string, nextStatus: string) {
    const remarks = prompt('Optional administrator feedback remarks:');
    try {
      await updateRecordStatus(recordId, nextStatus, remarks || '');
      loadData();
    } catch (err: any) {
      alert('Review update failed: ' + err.message);
    }
  }

  const filtered =
    statusFilter === 'All' ? records : records.filter((r) => r.status === statusFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
            Performance Review & Approval
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Audit and approve quarterly accomplishment records submitted by Plantilla officers
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', 'Pending', 'Accomplished', 'Partial', 'Deferred'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span>Submissions for Review — {CUR_YEAR}</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {filtered.length} entries
          </span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>MFO Output</th>
                <th style={{ textAlign: 'center', width: 80 }}>Quarter</th>
                <th style={{ textAlign: 'center', width: 80 }}>Target</th>
                <th style={{ textAlign: 'center', width: 80 }}>Actual</th>
                <th>Status</th>
                <th>Remarks</th>
                <th style={{ textAlign: 'right', width: 220 }}>Review Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No submission records found under &ldquo;{statusFilter}&rdquo;.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const emp = employees.find((e) => e.id === r.employeeId);
                  const mfo = mfos.find((m) => m.id === r.mfoId);
                  return (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{emp?.name || r.employeeId}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{emp?.position || '—'}</div>
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--color-text)' }}>{mfo?.mfoName || r.mfoId}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{mfo?.successIndicatorDesc}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{r.quarter}</td>
                      <td style={{ textAlign: 'center', fontWeight: 600 }}>{r.targetQty || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--color-text)' }}>{r.totalQty || 0}</td>
                      <td>
                        <span className={`badge badge-${(r.status || '').toLowerCase().replace(' ', '')}`}>
                          {r.status || 'Pending'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', maxWidth: 140 }}>
                        {r.remarks || '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleSetStatus(r.id, 'Accomplished')}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--color-success)' }}
                            title="Mark as Accomplished"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleSetStatus(r.id, 'Partial')}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--color-warning)' }}
                            title="Mark as Partial"
                          >
                            Partial
                          </button>
                          <button
                            onClick={() => handleSetStatus(r.id, 'Deferred')}
                            className="btn btn-outline btn-sm"
                            style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--color-danger)' }}
                            title="Mark as Deferred"
                          >
                            Defer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
