'use client';
import { useState, useEffect, useCallback } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '@/lib/db/employees';
import { Plus, PencilSimple, Trash, X, MagnifyingGlass } from '@phosphor-icons/react';
import type { Employee, EmploymentType } from '@/types';

export default function EmployeesAdminPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [form, setForm] = useState<{
    name: string;
    position: string;
    section: string;
    employmentType: EmploymentType;
  }>({
    name: '',
    position: '',
    section: '',
    employmentType: 'plantilla',
  });
  const [typeFilter, setTypeFilter] = useState<'all' | 'plantilla' | 'jo_cos'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployees();
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    await addEmployee(form);
    setForm({ name: '', position: '', section: '', employmentType: 'plantilla' });
    setShowAdd(false);
    load();
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editEmp) return;
    await updateEmployee(editEmp.id, {
      name: editEmp.name,
      position: editEmp.position,
      section: editEmp.section,
      employmentType: editEmp.employmentType,
    });
    setEditEmp(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this officer profile?')) return;
    await deleteEmployee(id);
    load();
  }

  const filtered = employees.filter((e) => {
    const matchesType = typeFilter === 'all' || e.employmentType === typeFilter;
    const matchesSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.position || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.section || '').toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Action Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-text)' }}>
            Personnel Directory
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Manage division plantilla and contractual staff profiles
          </p>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn btn-blue btn-sm"
        >
          <Plus size={16} weight="bold" />
          <span>{showAdd ? 'Cancel' : 'Add Employee'}</span>
        </button>
      </div>

      {/* Filter and Search Bar (Pathfinder Style) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
        background: 'var(--color-card-bg)',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 260, maxWidth: 420 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <MagnifyingGlass size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search personnel by name, position..."
              className="form-control"
              style={{ paddingLeft: 34, fontSize: '0.8rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'All Personnel' },
            { id: 'plantilla', label: 'Plantilla Regular' },
            { id: 'jo_cos', label: 'JO / COS' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id as any)}
              className={`btn btn-sm ${typeFilter === f.id ? 'btn-blue' : 'btn-outline'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Form Drawer */}
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="card"
          style={{ padding: '20px' }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--color-text)', marginBottom: 14 }}>
            Register New Division Personnel
          </div>
          <div className="grid-4" style={{ marginBottom: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Engr. Juan Dela Cruz"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Position Title</label>
              <input
                type="text"
                placeholder="e.g. Planning Officer II"
                className="form-control"
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Section / Unit</label>
              <input
                type="text"
                placeholder="e.g. Transport Planning"
                className="form-control"
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Classification</label>
              <select
                className="form-control"
                value={form.employmentType}
                onChange={(e) => setForm({ ...form, employmentType: e.target.value as any })}
              >
                <option value="plantilla">Plantilla (Regular)</option>
                <option value="jo_cos">JO/COS (Contractual)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-blue btn-sm">
              Save Personnel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <span>Active Division Personnel ({filtered.length})</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Personnel Name</th>
                <th>Designation</th>
                <th>Section</th>
                <th>Classification</th>
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
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No personnel records found.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                        {emp.name}
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{emp.position || '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{emp.section || '—'}</td>
                    <td>
                      <span
                        className={`badge ${
                          emp.employmentType === 'plantilla'
                            ? 'badge-accomplished'
                            : 'badge-pending'
                        }`}
                      >
                        {emp.employmentType === 'plantilla' ? 'Plantilla' : 'JO/COS'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <button
                          onClick={() => setEditEmp(emp)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                          title="Edit"
                        >
                          <PencilSimple size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '3px 8px', fontSize: '0.72rem', color: 'var(--color-danger)' }}
                          title="Delete"
                        >
                          <Trash size={13} />
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

      {/* Edit Modal */}
      {editEmp && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setEditEmp(null)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">Edit Officer Record</h3>
              <button className="modal-close" onClick={() => setEditEmp(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmp.name}
                  onChange={(e) => setEditEmp({ ...editEmp, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Position</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmp.position || ''}
                  onChange={(e) => setEditEmp({ ...editEmp, position: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Section / Unit</label>
                <input
                  type="text"
                  className="form-control"
                  value={editEmp.section || ''}
                  onChange={(e) => setEditEmp({ ...editEmp, section: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Classification</label>
                <select
                  className="form-control"
                  value={editEmp.employmentType || 'plantilla'}
                  onChange={(e) => setEditEmp({ ...editEmp, employmentType: e.target.value as any })}
                >
                  <option value="plantilla">Plantilla (Regular)</option>
                  <option value="jo_cos">JO/COS (Contractual)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditEmp(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-blue btn-sm">
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
