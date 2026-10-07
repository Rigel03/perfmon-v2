'use client';
import { useState, useEffect, useCallback } from 'react';
import { getIndicators, addIndicator, updateIndicator, toggleIndicator, deleteIndicator } from '@/lib/db/indicators';
import { Plus, PencilSimple, Trash, ToggleLeft, ToggleRight, X } from '@phosphor-icons/react';
import type { PerformanceIndicator } from '@/types';

export default function IndicatorsAdminPage() {
  const [indicators, setIndicators] = useState<PerformanceIndicator[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [editInd, setEditInd] = useState<PerformanceIndicator | null>(null);
  const [funcName, setFuncName] = useState<string>('');
  const [desc, setDesc] = useState<string>('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getIndicators(false);
      setIndicators(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addIndicator({ functionName: funcName, indicatorDesc: desc });
    setFuncName('');
    setDesc('');
    setShowAdd(false);
    load();
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editInd) return;
    await updateIndicator(editInd.id, {
      functionName: editInd.functionName,
      indicatorDesc: editInd.indicatorDesc,
    });
    setEditInd(null);
    load();
  }

  async function handleToggle(ind: PerformanceIndicator) {
    await toggleIndicator(ind.id, ind.active);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this indicator definition? Historical logs may be affected.')) return;
    await deleteIndicator(id);
    load();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
            Performance Indicators (PI) Definitions
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Daily metric definitions tracked by JO/COS contractual officers
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} weight="bold" />
          <span>{showAdd ? 'Cancel' : 'New Indicator'}</span>
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="card"
          style={{ padding: '18px 20px', background: 'var(--color-card-secondary)', borderColor: 'var(--color-border)' }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: 12 }}>
            Register New Performance Indicator
          </div>
          <div className="form-group" style={{ marginBottom: 12 }}>
            <label className="form-label">Function Area</label>
            <input
              type="text"
              placeholder="e.g. Traffic Signal Maintenance & Monitoring"
              className="form-control"
              value={funcName}
              onChange={(e) => setFuncName(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Indicator Description *</label>
            <textarea
              placeholder="Detailed metric description and counting criteria"
              className="form-control"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              Save Indicator
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <span>All Performance Indicators</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {indicators.length} total defined
          </span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 220 }}>Function Name</th>
                <th>Indicator Description</th>
                <th style={{ textAlign: 'center', width: 90 }}>Status</th>
                <th style={{ textAlign: 'right', width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : indicators.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No performance indicators found.
                  </td>
                </tr>
              ) : (
                indicators.map((ind) => (
                  <tr key={ind.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>{ind.functionName || '—'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {ind.indicatorDesc}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${ind.active ? 'badge-accomplished' : 'badge-deferred'}`}>
                        {ind.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => handleToggle(ind)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px' }}
                          title={ind.active ? 'Deactivate' : 'Activate'}
                        >
                          {ind.active ? (
                            <ToggleRight size={18} color="var(--color-success)" weight="fill" />
                          ) : (
                            <ToggleLeft size={18} color="var(--color-text-muted)" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditInd(ind)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Edit"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(ind.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px', color: 'var(--color-danger)' }}
                          title="Delete"
                        >
                          <Trash size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editInd && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setEditInd(null)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit Indicator Definition</h3>
              <button className="modal-close" onClick={() => setEditInd(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Function Area</label>
                <input
                  type="text"
                  className="form-control"
                  value={editInd.functionName || ''}
                  onChange={(e) => setEditInd({ ...editInd, functionName: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Indicator Description</label>
                <textarea
                  className="form-control"
                  value={editInd.indicatorDesc}
                  onChange={(e) => setEditInd({ ...editInd, indicatorDesc: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditInd(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
