'use client';
import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, createUser, adminUpdateUser, deleteUserProfile } from '@/lib/db/users';
import { getEmployees } from '@/lib/db/employees';
import { Plus, Trash, PencilSimple, User, X, Check, Key, ShieldCheck, Eye, EyeSlash } from '@phosphor-icons/react';
import type { Profile, Employee } from '@/types';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

  const [form, setForm] = useState<{
    email: string;
    password?: string;
    role: 'admin' | 'employee';
    displayName?: string;
    employeeId?: string;
  }>({
    email: '',
    password: '',
    role: 'employee',
    displayName: '',
    employeeId: '',
  });

  const [editForm, setEditForm] = useState<{
    email: string;
    password?: string;
    role: 'admin' | 'employee';
    displayName?: string;
    employeeId?: string;
  }>({
    email: '',
    password: '',
    role: 'employee',
    displayName: '',
    employeeId: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [uList, emps] = await Promise.all([getAllUsers(), getEmployees()]);
      setUsers(uList);
      setEmployees(emps);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUser({
        ...form,
        employeeId: form.employeeId || null,
      });
      setForm({ email: '', password: '', role: 'employee', displayName: '', employeeId: '' });
      setShowAdd(false);
      await load();
    } catch (err: any) {
      alert('Failed to create account: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(u: Profile) {
    setEditingUser(u);
    setEditForm({
      email: u.email || '',
      password: '',
      role: u.role || 'employee',
      displayName: u.displayName || '',
      employeeId: u.employeeId || '',
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      await adminUpdateUser({
        uid: editingUser.uid,
        email: editForm.email,
        password: editForm.password ? editForm.password : undefined,
        role: editForm.role,
        displayName: editForm.displayName,
        employeeId: editForm.employeeId || null,
      });
      setEditingUser(null);
      await load();
    } catch (err: any) {
      alert('Failed to update account: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(uid: string) {
    if (!confirm('Permanently delete this user account and authentication access?')) return;
    try {
      await deleteUserProfile(uid);
      await load();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
            User Accounts & Authentication
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            System logins, role assignments, and links to employee profiles
          </p>
        </div>

        <button
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingUser(null);
          }}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} weight="bold" />
          <span>{showAdd ? 'Cancel' : 'New Account'}</span>
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="card"
          style={{ padding: '18px 20px', background: 'var(--color-card-secondary)', borderColor: 'var(--color-border)' }}
        >
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-text)', marginBottom: 12 }}>
            Register New User Account
          </div>
          <div className="grid-4" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                placeholder="officer@cttmo.gov.ph"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Initial Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password123!"
                  className="form-control"
                  style={{ paddingRight: 32 }}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Display Name</label>
              <input
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                className="form-control"
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as any })}
              >
                <option value="employee">Officer (Employee)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Linked Division Personnel Record</label>
            <select
              className="form-control"
              value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
            >
              <option value="">(No personnel link)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.position || emp.employmentType}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setShowAdd(false)}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      )}

      {editingUser && (
        <form
          onSubmit={handleSaveEdit}
          className="card"
          style={{
            padding: '18px 20px',
            background: 'var(--color-card-secondary)',
            borderColor: 'var(--color-primary)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PencilSimple size={18} color="var(--color-primary)" weight="bold" />
              <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--color-text)' }}>
                Edit Account: {editingUser.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="btn btn-ghost btn-sm"
              style={{ padding: '2px 6px' }}
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid-4" style={{ marginBottom: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                New Password <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(leave blank to keep)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showEditPassword ? 'text' : 'password'}
                  placeholder="Enter to change password"
                  className="form-control"
                  style={{ paddingRight: 32 }}
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--color-text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={showEditPassword ? 'Hide password' : 'Show password'}
                >
                  {showEditPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Display Name</label>
              <input
                type="text"
                placeholder="e.g. Juan Dela Cruz"
                className="form-control"
                value={editForm.displayName}
                onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Role</label>
              <select
                className="form-control"
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
              >
                <option value="employee">Officer (Employee)</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Linked Division Personnel Record</label>
            <select
              className="form-control"
              value={editForm.employeeId}
              onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
            >
              <option value="">(No personnel link)</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.position || emp.employmentType}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
              {submitting ? 'Saving...' : 'Save Account Changes'}
            </button>
          </div>
        </form>
      )}

      <div className="card">
        <div className="card-header">
          <span>All Registered Users</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {users.length} accounts
          </span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Email</th>
                <th>Role</th>
                <th>Linked Employee</th>
                <th>Created</th>
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px', color: 'var(--color-text-muted)' }}>
                    No user accounts found.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const emp = employees.find((e) => e.id === u.employeeId);
                  const isCurrentEditing = editingUser?.uid === u.uid;
                  return (
                    <tr
                      key={u.uid}
                      style={{
                        background: isCurrentEditing ? 'rgba(56, 189, 248, 0.08)' : undefined,
                      }}
                    >
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                          {u.displayName || u.email?.split('@')[0]}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-accomplished'}`}>
                          {u.role?.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {emp ? (
                          <div style={{ fontSize: '0.82rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{emp.name}</span>
                            <span style={{ color: 'var(--color-text-muted)', marginLeft: 6 }}>
                              ({emp.employmentType})
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem' }}>Unlinked</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => startEdit(u)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 6px', color: 'var(--color-primary)' }}
                            title="Edit User Account"
                          >
                            <PencilSimple size={15} weight="bold" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.uid)}
                            className="btn btn-ghost btn-sm"
                            style={{ padding: '4px 6px', color: 'var(--color-danger)' }}
                            title="Delete Account"
                          >
                            <Trash size={15} />
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
