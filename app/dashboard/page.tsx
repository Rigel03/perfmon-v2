'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { getRecords } from '@/lib/db/records';
import { getEmployees } from '@/lib/db/employees';
import { getMFOs } from '@/lib/db/mfos';
import { exportToExcel, exportToPDF } from '@/lib/export';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileXls,
  FilePdf,
  TrendUp,
  Trophy,
  ChartPieSlice,
  ListBullets,
  WarningOctagon,
} from '@phosphor-icons/react';
import type { PerformanceRecord, Employee, MFODefinition } from '@/types';

const STATUS_COLORS = {
  Accomplished: '#10b981',
  Partial: '#f59e0b',
  Pending: '#0284c7',
  Deferred: '#ef4444',
  'Not Started': '#94a3b8',
};

const CUR_YEAR = new Date().getFullYear();

export default function DashboardPage() {
  const [tab, setTab] = useState<'overview' | 'trends' | 'leaderboard' | 'gap' | 'table'>('overview');
  const [year, setYear] = useState<number>(CUR_YEAR);
  const [quarter, setQuarter] = useState<string>('All');
  const [empFilter, setEmpFilter] = useState<string>('All');
  const [records, setRecords] = useState<PerformanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [mfos, setMFOs] = useState<MFODefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [recs, emps, mfoList] = await Promise.all([
        getRecords({ year }),
        getEmployees(),
        getMFOs(true),
      ]);
      setRecords(recs);
      setEmployees(emps);
      setMFOs(mfoList);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    let list = records;
    if (quarter !== 'All') list = list.filter((r) => r.quarter === quarter);
    if (empFilter !== 'All') list = list.filter((r) => r.employeeId === empFilter);
    return list;
  }, [records, quarter, empFilter]);

  const total = filtered.length;
  const accomplished = filtered.filter((r) => r.status === 'Accomplished').length;
  const pending = filtered.filter((r) => r.status === 'Pending').length;
  const deferred = filtered.filter((r) => r.status === 'Deferred').length;
  const partial = filtered.filter((r) => r.status === 'Partial').length;
  const rate = total > 0 ? Math.round((accomplished / total) * 100) : 0;

  const mfoChart = useMemo(() => {
    return mfos.map((m) => {
      const mfoRecs = filtered.filter((r) => r.mfoId === m.id);
      const acc = mfoRecs.filter((r) => r.status === 'Accomplished').length;
      const pct = mfoRecs.length > 0 ? Math.round((acc / mfoRecs.length) * 100) : 0;
      return { name: m.mfoName.slice(0, 20), value: pct };
    });
  }, [mfos, filtered]);

  const qTrend = useMemo(() => {
    return ['Q1', 'Q2', 'Q3', 'Q4'].map((q) => {
      const qRecs = records.filter((r) => r.quarter === q);
      const acc = qRecs.filter((r) => r.status === 'Accomplished').length;
      return {
        quarter: q,
        rate: qRecs.length > 0 ? Math.round((acc / qRecs.length) * 100) : 0,
        total: qRecs.length,
      };
    });
  }, [records]);

  const pieData = useMemo(() => {
    return [
      { name: 'Accomplished', value: accomplished, color: STATUS_COLORS.Accomplished },
      { name: 'Partial', value: partial, color: STATUS_COLORS.Partial },
      { name: 'Pending', value: pending, color: STATUS_COLORS.Pending },
      { name: 'Deferred', value: deferred, color: STATUS_COLORS.Deferred },
    ].filter((d) => d.value > 0);
  }, [accomplished, partial, pending, deferred]);

  const leaderboard = useMemo(() => {
    return employees
      .map((emp) => {
        const empRecs = filtered.filter((r) => r.employeeId === emp.id);
        const acc = empRecs.filter((r) => r.status === 'Accomplished').length;
        const pct = empRecs.length > 0 ? Math.round((acc / empRecs.length) * 100) : 0;
        return { ...emp, totalRecs: empRecs.length, accomplished: acc, rate: pct };
      })
      .sort((a, b) => b.rate - a.rate);
  }, [employees, filtered]);

  const submittedEmpIds = new Set(filtered.map((r) => r.employeeId));
  const notSubmitted = employees.filter((e) => !submittedEmpIds.has(e.id));
  const deferredRecs = filtered.filter((r) => r.status === 'Deferred');

  const tableData = useMemo(() => {
    return filtered.map((r) => {
      const emp = employees.find((e) => e.id === r.employeeId);
      const mfo = mfos.find((m) => m.id === r.mfoId);
      return {
        Employee: emp?.name || r.employeeId,
        MFO: mfo?.mfoName || r.mfoId,
        Category: mfo?.category || '',
        Quarter: r.quarter,
        Target: r.targetQty || 0,
        M1: r.quantityM1 || 0,
        M2: r.quantityM2 || 0,
        M3: r.quantityM3 || 0,
        Total: r.totalQty || 0,
        Status: r.status || 'Not Started',
        Remarks: r.remarks || '',
      };
    });
  }, [filtered, employees, mfos]);

  function handleExportXLSX() {
    exportToExcel(tableData, `IPCR_${year}_${quarter}`);
  }

  function handleExportPDF() {
    exportToPDF(tableData, `IPCR Report — ${quarter} ${year}`, `IPCR_${year}_${quarter}`);
  }

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Top bar & filters */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Analytics & Reporting
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Performance breakdown, output trends, and quarterly commitments
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
              value={empFilter}
              onChange={(e) => setEmpFilter(e.target.value)}
            >
              <option value="All">All Officers</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>

            <select
              className="form-control"
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.8rem' }}
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
            >
              {['All', 'Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
                <option key={q} value={q}>
                  {q}
                </option>
              ))}
            </select>

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

        {/* Tab Selection */}
        <div className="tab-list">
          {[
            { id: 'overview', label: 'Overview', icon: ChartPieSlice },
            { id: 'trends', label: 'Trends', icon: TrendUp },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            { id: 'gap', label: 'Gap Analysis', icon: WarningOctagon },
            { id: 'table', label: 'Data Table', icon: ListBullets },
          ].map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                className={`tab-btn ${active ? 'active' : ''}`}
                onClick={() => setTab(t.id as any)}
              >
                <Icon size={16} weight={active ? 'bold' : 'regular'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="grid-4">
                  <div className="kpi-card">
                    <span className="kpi-label">Total Submissions</span>
                    <span className="kpi-value">{total}</span>
                    <span className="kpi-sub">Quarterly commitments</span>
                  </div>
                  <div className="kpi-card accent">
                    <span className="kpi-label">Accomplished</span>
                    <span className="kpi-value">{rate}%</span>
                    <span className="kpi-sub">{accomplished} records done</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Pending</span>
                    <span className="kpi-value">{pending}</span>
                    <span className="kpi-sub">Awaiting review</span>
                  </div>
                  <div className="kpi-card">
                    <span className="kpi-label">Deferred</span>
                    <span className="kpi-value">{deferred}</span>
                    <span className="kpi-sub">Postponed outputs</span>
                  </div>
                </div>

                <div className="grid-2">
                  {/* Bar Chart */}
                  <div className="card">
                    <div className="card-header">
                      MFO Accomplishment Percentage
                    </div>
                    <div className="card-body" style={{ height: 280, padding: 14 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mfoChart} margin={{ left: -15, bottom: 25, top: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} angle={-25} textAnchor="end" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                          <Tooltip
                            contentStyle={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }}
                            formatter={(v) => [`${v}%`, 'Completion']}
                          />
                          <Bar dataKey="value" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Pie Chart */}
                  <div className="card">
                    <div className="card-header">
                      Status Distribution
                    </div>
                    <div className="card-body" style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
                      <div style={{ width: 180, height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" innerRadius={42}>
                              {pieData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {pieData.map((d) => (
                          <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', fontWeight: 600 }}>
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 2,
                                background: d.color,
                                flexShrink: 0
                              }}
                            />
                            <span>
                              {d.name}: <strong style={{ fontWeight: 800 }}>{d.value}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TRENDS ── */}
            {tab === 'trends' && (
              <div className="card">
                <div className="card-header">
                  Quarterly Progression — {year}
                </div>
                <div className="card-body" style={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={qTrend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                      <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#64748b' }} />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip contentStyle={{ background: 'var(--color-card-bg)', borderColor: 'var(--color-border)', borderRadius: 8, color: 'var(--color-text)' }} formatter={(v: any, name: any) => (name === 'rate' ? `${v}%` : v)} />
                      <Line type="monotone" dataKey="rate" name="Completion Rate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="total" name="Total Records" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── LEADERBOARD ── */}
            {tab === 'leaderboard' && (
              <div className="card">
                <div className="card-header">
                  Division Leaderboard — {year}
                </div>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 60 }}>Rank</th>
                        <th>Personnel Name</th>
                        <th>Position</th>
                        <th>Classification</th>
                        <th style={{ textAlign: 'center' }}>Total Records</th>
                        <th style={{ textAlign: 'center' }}>Done</th>
                        <th style={{ textAlign: 'center' }}>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((emp, idx) => (
                        <tr key={emp.id}>
                          <td style={{ fontWeight: 800, color: idx < 3 ? '#eab308' : 'var(--color-text-muted)' }}>
                            {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>{emp.name}</td>
                          <td style={{ color: 'var(--color-text-muted)' }}>{emp.position || '—'}</td>
                          <td>
                            <span className={`badge ${emp.employmentType === 'plantilla' ? 'badge-accomplished' : 'badge-pending'}`}>
                              {emp.employmentType === 'plantilla' ? 'Plantilla' : 'JO/COS'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{emp.totalRecs}</td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--color-success)' }}>{emp.accomplished}</td>
                          <td style={{ textAlign: 'center', fontWeight: 900, color: 'var(--color-text)' }}>{emp.rate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── GAP ANALYSIS ── */}
            {tab === 'gap' && (
              <div className="grid-2">
                <div className="card">
                  <div className="card-header" style={{ color: 'var(--color-danger)' }}>
                    Officers Without Submissions ({notSubmitted.length})
                  </div>
                  <div className="card-body" style={{ padding: 14 }}>
                    {notSubmitted.length === 0 ? (
                      <div className="alert alert-success">All division officers have submitted commitments.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {notSubmitted.map((e) => (
                          <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-card-secondary)' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text)' }}>{e.name}</div>
                              <div style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)' }}>{e.position || '—'}</div>
                            </div>
                            <span className="badge badge-notstarted">Pending Filing</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header" style={{ color: 'var(--color-danger)' }}>
                    Deferred Outputs ({deferredRecs.length})
                  </div>
                  <div className="card-body" style={{ padding: 14 }}>
                    {deferredRecs.length === 0 ? (
                      <div className="alert alert-success">No outputs deferred for this period.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {deferredRecs.map((r) => {
                          const emp = employees.find((e) => e.id === r.employeeId);
                          const mfo = mfos.find((m) => m.id === r.mfoId);
                          return (
                            <div key={r.id} style={{ padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', background: 'var(--color-card-secondary)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <strong style={{ fontSize: '0.82rem', color: 'var(--color-text)' }}>{emp?.name || 'Officer'}</strong>
                                <span className="badge badge-deferred">{r.quarter}</span>
                              </div>
                              <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                                {mfo?.mfoName || r.mfoId}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── DATA TABLE ── */}
            {tab === 'table' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" onClick={handleExportXLSX}>
                    <FileXls size={15} color="#10b981" weight="bold" />
                    <span>Export Excel</span>
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={handleExportPDF}>
                    <FilePdf size={15} color="#ef4444" weight="bold" />
                    <span>Export PDF</span>
                  </button>
                </div>

                <div className="card">
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>MFO</th>
                          <th>Category</th>
                          <th style={{ textAlign: 'center' }}>Quarter</th>
                          <th style={{ textAlign: 'center' }}>Target</th>
                          <th style={{ textAlign: 'center' }}>M1</th>
                          <th style={{ textAlign: 'center' }}>M2</th>
                          <th style={{ textAlign: 'center' }}>M3</th>
                          <th style={{ textAlign: 'center' }}>Total</th>
                          <th>Status</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tableData.length === 0 ? (
                          <tr>
                            <td colSpan={11} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>
                              No records found for the selected filter.
                            </td>
                          </tr>
                        ) : (
                          tableData.map((row, i) => (
                            <tr key={i}>
                              <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>{row.Employee}</td>
                              <td style={{ maxWidth: 220, fontSize: '0.8rem' }}>{row.MFO}</td>
                              <td>
                                <span className={`badge ${row.Category === 'Core' ? 'badge-admin' : 'badge-notstarted'}`}>
                                  {row.Category}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.Quarter}</td>
                              <td style={{ textAlign: 'center', fontWeight: 600 }}>{row.Target}</td>
                              <td style={{ textAlign: 'center' }}>{row.M1}</td>
                              <td style={{ textAlign: 'center' }}>{row.M2}</td>
                              <td style={{ textAlign: 'center' }}>{row.M3}</td>
                              <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--color-text)' }}>{row.Total}</td>
                              <td>
                                <span className={`badge badge-${(row.Status || '').toLowerCase().replace(' ', '')}`}>
                                  {row.Status}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)', maxWidth: 160 }}>
                                {row.Remarks || '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
