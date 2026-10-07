'use client';
import { useState, useEffect, useCallback } from 'react';
import { getMFOs, addMFO, updateMFO, toggleMFO, deleteMFO } from '@/lib/db/mfos';
import { Plus, PencilSimple, Trash, ToggleLeft, ToggleRight, X } from '@phosphor-icons/react';
import type { MFODefinition, MFOCategory } from '@/types';

export default function MFOsAdminPage() {
  const [mfos, setMfos] = useState<MFODefinition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [editMfo, setEditMfo] = useState<MFODefinition | null>(null);
  const [form, setForm] = useState<{
    category: MFOCategory;
    mfoName: string;
    successIndicatorDesc: string;
  }>({
    category: 'Core',
    mfoName: '',
    successIndicatorDesc: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMFOs(false);
      setMfos(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addMFO(form);
    setForm({ category: 'Core', mfoName: '', successIndicatorDesc: '' });
    setShowAdd(false);
    load();
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editMfo) return;
    await updateMFO(editMfo.id, {
      category: editMfo.category,
      mfoName: editMfo.mfoName,
      successIndicatorDesc: editMfo.successIndicatorDesc,
    });
    setEditMfo(null);
    load();
  }

  async function handleToggle(mfo: MFODefinition) {
    await toggleMFO(mfo.id, mfo.active);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this MFO definition? Assigned commitments may be orphaned.')) return;
    await deleteMFO(id);
    load();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
            Major Final Output (MFO) Definitions
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Outputs, success targets, and performance standards for Plantilla review
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} weight="bold" />
          <span>{showAdd ? 'Cancel' : 'New MFO'}</span>
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="card"
          style={{ padding: '18px 20px', background: 'var(--color-card-secondary)', borderColor: 'var(--color-border)' }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: 12 }}>
            Create MFO Definition
          </div>
          <div className="grid-3" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Function Category</label>
              <select
                className="form-control"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value as any })}
              >
                <option value="Core">Core Function</option>
                <option value="Support">Support Function</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label className="form-label">MFO Name / Title</label>
              <input
                type="text"
                placeholder="e.g. Traffic Signal Maintenance & Monitoring"
                className="form-control"
                value={form.mfoName}
                onChange={(e) => setForm({ ...form, mfoName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Success Indicator Description</label>
            <textarea
              placeholder="Detailed targets, deliverables, and performance metrics"
              className="form-control"
              value={form.successIndicatorDesc}
              onChange={(e) => setForm({ ...form, successIndicatorDesc: e.target.value })}
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
              Save MFO Definition
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <span>All MFO Definitions</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {mfos.length} total defined
          </span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 100 }}>Category</th>
                <th style={{ width: 220 }}>MFO Name</th>
                <th>Success Indicator</th>
                <th style={{ textAlign: 'center', width: 90 }}>Status</th>
                <th style={{ textAlign: 'right', width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : mfos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No MFO definitions recorded.
                  </td>
                </tr>
              ) : (
                mfos.map((mfo) => (
                  <tr key={mfo.id}>
                    <td>
                      <span className={`badge ${mfo.category === 'Core' ? 'badge-core' : 'badge-support'}`}>
                        {mfo.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--color-text)' }}>{mfo.mfoName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
                      {mfo.successIndicatorDesc}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${mfo.active ? 'badge-accomplished' : 'badge-deferred'}`}>
                        {mfo.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => handleToggle(mfo)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px' }}
                          title={mfo.active ? 'Deactivate' : 'Activate'}
                        >
                          {mfo.active ? (
                            <ToggleRight size={18} color="var(--color-success)" weight="fill" />
                          ) : (
                            <ToggleLeft size={18} color="var(--color-text-muted)" />
                          )}
                        </button>
                        <button
                          onClick={() => setEditMfo(mfo)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 6px' }}
                          title="Edit"
                        >
                          <PencilSimple size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(mfo.id)}
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

      {editMfo && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setEditMfo(null)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit MFO Definition</h3>
              <button className="modal-close" onClick={() => setEditMfo(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select
                  className="form-control"
                  value={editMfo.category}
                  onChange={(e) => setEditMfo({ ...editMfo, category: e.target.value as any })}
                >
                  <option value="Core">Core Function</option>
                  <option value="Support">Support Function</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">MFO Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editMfo.mfoName}
                  onChange={(e) => setEditMfo({ ...editMfo, mfoName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Success Indicator Description</label>
                <textarea
                  className="form-control"
                  value={editMfo.successIndicatorDesc}
                  onChange={(e) => setEditMfo({ ...editMfo, successIndicatorDesc: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditMfo(null)}
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
