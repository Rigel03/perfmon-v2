'use client';
import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { getRecords } from '@/lib/db/records';
import { getEmployees } from '@/lib/db/employees';
import { getMFOs } from '@/lib/db/mfos';
import { getLogsForEmployee } from '@/lib/db/indicatorLogs';
import { getIndicators, getEmployeeIndicators } from '@/lib/db/indicators';
import {
  ClipboardText,
  ChartLineUp,
  CheckCircle,
  WarningCircle,
  HourglassMedium,
  Prohibit,
  PlusCircle,
  Clock,
  ShieldCheck,
  Gear,
  ArrowSquareOut,
} from '@phosphor-icons/react';
import Link from 'next/link';
import type { Profile } from '@/types';

const NOW = new Date();
const CUR_YEAR = NOW.getFullYear();
const CUR_MONTH = NOW.getMonth();
const CUR_MONTH_STR = String(CUR_MONTH + 1).padStart(2, '0');
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const CUR_QUARTER = CUR_MONTH < 3 ? 'Q1' : CUR_MONTH < 6 ? 'Q2' : CUR_MONTH < 9 ? 'Q3' : 'Q4';
const QUARTER_MONTHS: Record<string, number[]> = {
  Q1: [0, 1, 2],
  Q2: [3, 4, 5],
  Q3: [6, 7, 8],
  Q4: [9, 10, 11],
};

function MetricCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className={`kpi-card ${accent ? 'accent' : ''}`}>
      <span className="kpi-label">{label}</span>
      <div className="kpi-value">{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  );
}

/* ══════════════════════════════════════════
   JO/COS HOME DASHBOARD
══════════════════════════════════════════ */
function JOCOSHome({ user }: { user: Profile }) {
  const [indicators, setIndicators] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.employeeId) {
        setLoading(false);
        return;
      }
      try {
        const [allInds, assigned, empLogs] = await Promise.all([
          getIndicators(true),
          getEmployeeIndicators(user.employeeId),
          getLogsForEmployee({ employeeId: user.employeeId, year: CUR_YEAR }),
        ]);
        const myInds =
          assigned.length > 0 ? allInds.filter((i) => assigned.includes(i.id)) : allInds;
        setIndicators(myInds);
        setLogs(empLogs);
      } catch (err) {
        console.error('JO/COS home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const loggedThisMonth = logs
    .filter((l) => l.date?.startsWith(`${CUR_YEAR}-${CUR_MONTH_STR}`))
    .reduce((s, l) => s + (Number(l.value) || 0), 0);
  const qMonths = QUARTER_MONTHS[CUR_QUARTER];
  const loggedThisQuarter = logs
    .filter((l) => {
      if (!l.date) return false;
      const m = parseInt(l.date.split('-')[1], 10) - 1;
      return qMonths.includes(m);
    })
    .reduce((s, l) => s + (Number(l.value) || 0), 0);

  const loggedIndIds = new Set(logs.map((l) => l.indicatorId));
  const activeFunctions = new Set(
    indicators.filter((i) => loggedIndIds.has(i.id)).map((i) => i.functionName).filter(Boolean)
  ).size;

  const recent = [...logs].reverse().slice(0, 5);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Pathfinder-style Banner */}
      <div className="banner-pathfinder">
        <div>
          <div className="banner-role-badge">
            JO/COS Officer · {MONTH_NAMES[CUR_MONTH]} {CUR_YEAR}
          </div>
          <h2 className="banner-title">
            Good day, {user?.displayName || user?.email?.split('@')[0]}
          </h2>
          <div className="banner-desc">
            Performance indicator reporting active for {CUR_QUARTER} {CUR_YEAR}
          </div>
        </div>
        <div className="banner-period-badge">
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{CUR_QUARTER}</span>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{CUR_YEAR}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="grid-4">
            <MetricCard label="Assigned Indicators" value={indicators.length} sub="Performance indicators" />
            <MetricCard label="This Month" value={loggedThisMonth} sub={MONTH_NAMES[CUR_MONTH]} />
            <MetricCard label={`${CUR_QUARTER} Total`} value={loggedThisQuarter} sub="Quarterly volume" accent />
            <MetricCard label="Active Functions" value={activeFunctions} sub="With recorded entries" />
          </div>

          {/* Quick Actions */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Quick Actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              <Link href="/tracker" className="action-card">
                <PlusCircle size={32} color="#0284c7" weight="bold" />
                <div className="action-title">Log Entry</div>
                <div className="action-desc">Record daily performance metrics</div>
              </Link>

              <Link href="/tracker?tab=history" className="action-card">
                <Clock size={32} color="#38bdf8" weight="bold" />
                <div className="action-title">Log History</div>
                <div className="action-desc">Review all {CUR_QUARTER} entries</div>
              </Link>

              <Link href="/profile" className="action-card">
                <ShieldCheck size={32} color="#10b981" weight="bold" />
                <div className="action-title">My Profile</div>
                <div className="action-desc">Account & review status</div>
              </Link>
            </div>
          </div>

          {/* Recent Entries */}
          {recent.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span>Recent Log Entries</span>
                <Link href="/tracker?tab=history" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>View All</span>
                  <ArrowSquareOut size={14} />
                </Link>
              </div>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 110 }}>Date</th>
                      <th>Function & Indicator</th>
                      <th style={{ textAlign: 'center', width: 90 }}>Value</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((l) => {
                      const ind = indicators.find((i) => i.id === l.indicatorId);
                      return (
                        <tr key={l.id}>
                          <td>
                            <span className="doc-code-pill">{l.date}</span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{ind?.functionName || '—'}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>{ind?.indicatorDesc}</div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--color-text)' }}>{l.value}</td>
                          <td style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>{l.notes || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   PLANTILLA / ADMIN HOME DASHBOARD
══════════════════════════════════════════ */
function PlantillaHome({ user }: { user: Profile }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    async function loadStats() {
      try {
        const [records, employees, mfos] = await Promise.all([
          getRecords({ year: CUR_YEAR }),
          getEmployees(),
          getMFOs(true),
        ]);
        const totalRecords = records.length;
        const accomplished = records.filter((r) => r.status === 'Accomplished').length;
        const pending = records.filter((r) => r.status === 'Pending').length;
        const deferred = records.filter((r) => r.status === 'Deferred').length;
        const partial = records.filter((r) => r.status === 'Partial').length;
        const rate = totalRecords > 0 ? Math.round((accomplished / totalRecords) * 100) : 0;
        const submittedEmpIds = new Set(
          records.filter((r) => r.quarter === CUR_QUARTER).map((r) => r.employeeId)
        );
        const pendingSubmissions = employees.filter((e) => !submittedEmpIds.has(e.id)).length;
        setStats({
          totalEmployees: employees.length,
          totalMFOs: mfos.length,
          totalRecords,
          accomplished,
          pending,
          deferred,
          partial,
          rate,
          pendingSubmissions,
        });
      } catch (err) {
        console.error('Plantilla home load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Pathfinder-style Banner */}
      <div className="banner-pathfinder">
        <div>
          <div className="banner-role-badge">
            {isAdmin ? 'Super Administrator' : 'Plantilla Regular Officer'} · {CUR_QUARTER} {CUR_YEAR}
          </div>
          <h2 className="banner-title">
            Good day, {user?.displayName || user?.email?.split('@')[0]}
          </h2>
          <div className="banner-desc">
            Division Performance Tracker active · Complete IPCR monitoring
          </div>
        </div>
        <div className="banner-period-badge">
          <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{CUR_QUARTER}</span>
          <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{CUR_YEAR}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-center">
          <div className="spinner" />
        </div>
      ) : stats ? (
        <>
          <div className="grid-4">
            <MetricCard label="Active Personnel" value={stats.totalEmployees} sub="Division roster" />
            <MetricCard label="Defined MFOs" value={stats.totalMFOs} sub="Major final outputs" />
            <MetricCard label="Accomplishment Rate" value={`${stats.rate}%`} sub={`${stats.accomplished} of ${stats.totalRecords} done`} accent />
            <MetricCard label="Pending Submissions" value={stats.pendingSubmissions} sub={`Due for ${CUR_QUARTER}`} />
          </div>

          {/* Status Breakdown Grid */}
          <div className="grid-4">
            <div className="status-tile accomplished">
              <div className="status-tile-icon">
                <CheckCircle size={22} weight="bold" />
              </div>
              <div className="status-tile-body">
                <span className="status-tile-label">Accomplished</span>
                <span className="status-tile-value">{stats.accomplished}</span>
              </div>
            </div>

            <div className="status-tile partial">
              <div className="status-tile-icon">
                <WarningCircle size={22} weight="bold" />
              </div>
              <div className="status-tile-body">
                <span className="status-tile-label">Partial</span>
                <span className="status-tile-value">{stats.partial}</span>
              </div>
            </div>

            <div className="status-tile pending">
              <div className="status-tile-icon">
                <HourglassMedium size={22} weight="bold" />
              </div>
              <div className="status-tile-body">
                <span className="status-tile-label">Pending Review</span>
                <span className="status-tile-value">{stats.pending}</span>
              </div>
            </div>

            <div className="status-tile deferred">
              <div className="status-tile-icon">
                <Prohibit size={22} weight="bold" />
              </div>
              <div className="status-tile-body">
                <span className="status-tile-label">Deferred</span>
                <span className="status-tile-value">{stats.deferred}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: 12 }}>
              Quick Actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              <Link href="/my-ipcr" className="action-card">
                <ClipboardText size={32} color="#0284c7" weight="bold" />
                <div className="action-title">Submit My IPCR</div>
                <div className="action-desc">Log {CUR_QUARTER} accomplishments</div>
              </Link>

              <Link href="/dashboard" className="action-card">
                <ChartLineUp size={32} color="#38bdf8" weight="bold" />
                <div className="action-title">View Analytics</div>
                <div className="action-desc">Charts, exports & rankings</div>
              </Link>

              {isAdmin ? (
                <Link href="/admin/employees" className="action-card">
                  <Gear size={32} color="#f59e0b" weight="bold" />
                  <div className="action-title">Admin Console</div>
                  <div className="action-desc">Manage personnel & targets</div>
                </Link>
              ) : (
                <Link href="/profile" className="action-card">
                  <ShieldCheck size={32} color="#10b981" weight="bold" />
                  <div className="action-title">My Profile</div>
                  <div className="action-desc">Review status & logs</div>
                </Link>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <AppShell>
        <div className="loading-center">
          <div className="spinner" />
        </div>
      </AppShell>
    );
  }

  const isJOCOS = user.role !== 'admin' && user.employmentType === 'jo_cos';

  return (
    <AppShell>
      {isJOCOS ? <JOCOSHome user={user} /> : <PlantillaHome user={user} />}
    </AppShell>
  );
}
