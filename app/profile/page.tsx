'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { getSupabaseClient } from '@/lib/supabase/client';
import { getEmployees, updateEmployee } from '@/lib/db/employees';
import { updateUserProfile } from '@/lib/db/users';
import { FLAT_MOOD_AVATARS, getAvatarById } from '@/lib/avatars';
import { useRouter } from 'next/navigation';
import {
  EnvelopeSimple,
  SignOut,
  Moon,
  Sun,
  User,
  ShieldCheck,
  CheckCircle,
  FloppyDisk,
  Key,
  IdentificationCard,
  Buildings,
  Check,
} from '@phosphor-icons/react';
import type { Employee } from '@/types';

export default function ProfilePage() {
  const { user, setUser, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);

  // Form states
  const [displayName, setDisplayName] = useState('');
  const [division, setDivision] = useState('');
  const [position, setPosition] = useState('');
  const [gender, setGender] = useState('');
  const [selectedAvatarId, setSelectedAvatarId] = useState('joyful');

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status banners
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setDisplayName(user.displayName || user.email?.split('@')[0] || '');
      setSelectedAvatarId(user.avatarId || 'joyful');
      setGender(user.gender || 'Male');

      if (user.employeeId) {
        try {
          const emps = await getEmployees();
          const match = emps.find((e) => e.id === user.employeeId);
          if (match) {
            setEmployee(match);
            setDivision(match.division || match.section || '');
            setPosition(match.position || '');
          }
        } catch (err) {
          console.error('Error fetching employee link:', err);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [user]);

  async function handleLogout() {
    await logoutUser();
    router.push('/login');
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      // 1. Update Supabase profiles table
      await updateUserProfile(user.uid, {
        displayName,
      });

      // 2. Update Supabase Auth user_metadata for avatar_id & gender
      const supabase = getSupabaseClient();
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          displayName,
          avatar_id: selectedAvatarId,
          gender,
        },
      });
      if (metaError) throw metaError;

      // 3. Update employee record if linked and division/position changed
      if (user.employeeId && employee) {
        await updateEmployee(user.employeeId, {
          division,
          position,
        });
        setEmployee((prev) => (prev ? { ...prev, division, position } : null));
      }

      // Update client session
      setUser({
        ...user,
        displayName,
        avatarId: selectedAvatarId,
        gender,
      });

      setProfileMsg({ type: 'success', text: 'Personal information updated successfully!' });
      setTimeout(() => setProfileMsg(null), 4000);
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;

      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err: any) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setSavingPassword(false);
    }
  }

  const currentAvatar = getAvatarById(selectedAvatarId);
  const isSuperAdmin = user?.role === 'admin';
  const roleTitle = isSuperAdmin ? 'Super Admin' : user?.employmentType === 'jo_cos' ? 'JO/COS Officer' : 'Plantilla Officer';
  const roleSubtitle = isSuperAdmin ? 'Super Admin — System Owner' : `${roleTitle} — Division Member`;
  const divisionDisplay = division || employee?.division || 'Transport Planning and Management Division (TPMD)';

  return (
    <AppShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 980, margin: '0 auto', width: '100%' }}>
        {/* Top Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <User size={24} weight="bold" color="var(--color-primary)" />
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--color-text)' }}>
              My Profile
            </h1>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            Manage your account information, positive mood avatar, and security credentials
          </p>
        </div>

        {/* ── CARD 1: Identity & Role Overview Banner (Image 1 replica) ── */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {/* Flat SVG Avatar */}
              <div style={{
                width: 60,
                height: 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <currentAvatar.SvgComponent size={56} color={currentAvatar.color} />
              </div>

              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-text)' }}>
                  {displayName || user?.email?.split('@')[0]}
                </h2>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {user?.email}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    color: '#f59e0b',
                  }}>
                    <ShieldCheck size={14} weight="bold" />
                    {roleTitle}
                  </span>

                  <span className="badge badge-accomplished" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                    approved
                  </span>

                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5,
                    fontSize: '0.75rem',
                    color: 'var(--color-text-muted)',
                  }}>
                    <Buildings size={14} />
                    {divisionDisplay}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={toggleTheme}
                className="btn btn-outline btn-sm"
              >
                {theme === 'dark' ? <Sun size={15} color="#facc15" weight="bold" /> : <Moon size={15} color="#0284c7" weight="bold" />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--color-danger)' }}
              >
                <SignOut size={15} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Email / Role Sub-strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            paddingTop: 16,
            borderTop: '1px solid var(--color-border-subtle)',
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
              }}>
                <EnvelopeSimple size={13} />
                <span>Email</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', marginTop: 4 }}>
                {user?.email}
              </div>
            </div>

            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.68rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--color-text-muted)',
              }}>
                <ShieldCheck size={13} />
                <span>Role</span>
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-text)', marginTop: 4 }}>
                {roleSubtitle}
              </div>
            </div>
          </div>
        </div>

        {/* ── CARD 2: Daylio-Style Mood Avatar Picker ── */}
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px 28px',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
                Choose Your Profile Avatar
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                Positive energy & mood circle icons (Daylio-inspired mood palette)
              </p>
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: currentAvatar.color }}>
              Current: {currentAvatar.label}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))',
            gap: 12,
            padding: '12px 0',
          }}>
            {FLAT_MOOD_AVATARS.map((av) => {
              const isSelected = selectedAvatarId === av.id;
              const SvgIcon = av.SvgComponent;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatarId(av.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: '12px 6px',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? `2px solid ${av.color}` : '1px solid transparent',
                    background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                    transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.15s ease',
                  }}>
                    <SvgIcon size={38} color={av.color} />
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 800 : 500,
                    color: isSelected ? av.color : 'var(--color-text-muted)',
                    transition: 'color 0.15s ease',
                  }}>
                    {av.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CARD 3: Personal Information Form (Image 1 replica) ── */}
        <form
          onSubmit={handleSaveProfile}
          style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <IdentificationCard size={20} weight="bold" color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Personal Information
            </h3>
          </div>

          {profileMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: profileMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
              border: `1px solid ${profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}>
              {profileMsg.text}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Display Name *</label>
            <input
              type="text"
              className="form-control"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Argie B. Lico"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Buildings size={14} />
                <span>Division / Department</span>
              </span>
            </label>
            <input
              type="text"
              className="form-control"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="Transport Planning and Management Division (TPMD)"
            />
          </div>

          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Position / Designation</label>
              <input
                type="text"
                className="form-control"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Planning Officer IV"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gender</label>
              <select
                className="form-control"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, padding: '8px 18px' }}
            >
              <FloppyDisk size={16} weight="bold" />
              <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* ── CARD 4: Change Password / Security ── */}
        <form
          onSubmit={handleChangePassword}
          style={{
            background: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px 28px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={20} weight="bold" color="var(--color-primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text)' }}>
              Change Password
            </h3>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Update your own login password directly in Supabase Authentication
          </p>

          {passwordMsg && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              background: passwordMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: passwordMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
              border: `1px solid ${passwordMsg.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}>
              {passwordMsg.text}
            </div>
          )}

          <div className="grid-2">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">New Password *</label>
              <input
                type="password"
                placeholder="At least 6 characters"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Confirm New Password *</label>
              <input
                type="password"
                placeholder="Confirm your password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 8 }}>
            <button
              type="submit"
              disabled={savingPassword}
              className="btn btn-primary btn-sm"
              style={{ gap: 6, padding: '8px 18px' }}
            >
              <Key size={16} weight="bold" />
              <span>{savingPassword ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
