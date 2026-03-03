'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastProvider, useToast } from '@/context/ToastContext';
import Loader from '@/components/Loader';
import { PixelCatIdle } from '@/components/pixel-cats';
import { User, Lock, Trash2, Save, Eye, EyeOff } from 'lucide-react';

const inputClass = 'w-full rounded-xl border-2 border-[var(--border)] bg-[var(--card-bg)] px-3 py-2 text-sm font-semibold text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition-colors';
const btnPrimary = 'btn-yarn inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-40';
const btnDanger = 'inline-flex items-center gap-2 rounded-xl border-2 border-[var(--yarn-red)] bg-red-50 dark:bg-red-950/30 px-4 py-2 text-sm font-bold text-[var(--yarn-red)] hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors disabled:opacity-40';

const ProfileInner: React.FC = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) { router.push('/login'); return; }
        const res = await fetch('/api/session', { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
          setUsername(data.user.username || '');
          setEmail(data.user.email || '');
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      const body: Record<string, string> = { username, email };
      if (showPasswordSection) {
        if (!currentPassword) {
          showToast({ severity: 'warn', summary: 'Warning', detail: 'Current password is required to change password.', life: 3000 });
          setSaving(false);
          return;
        }
        if (newPassword !== confirmPassword) {
          showToast({ severity: 'warn', summary: 'Warning', detail: 'New passwords do not match.', life: 3000 });
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          showToast({ severity: 'warn', summary: 'Warning', detail: 'New password must be at least 6 characters.', life: 3000 });
          setSaving(false);
          return;
        }
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast({ severity: 'success', summary: 'Saved', detail: 'Profile updated successfully.', life: 3000 });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      } else {
        showToast({ severity: 'error', summary: 'Error', detail: data.message || 'Failed to update profile.', life: 3000 });
      }
    } catch (err) {
      console.error('Save profile error:', err);
      showToast({ severity: 'error', summary: 'Error', detail: 'Something went wrong.', life: 3000 });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem('authToken');
        router.push('/');
      } else {
        showToast({ severity: 'error', summary: 'Error', detail: data.message || 'Failed to delete account.', life: 3000 });
      }
    } catch (err) {
      console.error('Delete account error:', err);
      showToast({ severity: 'error', summary: 'Error', detail: 'Something went wrong.', life: 3000 });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-[calc(100vh-64px)] px-4 py-6" style={{ backgroundColor: 'var(--background)' }} data-page="profile">
      <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="cat-wiggle"><PixelCatIdle size={36} /></div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">Profile Settings</h1>
        </div>

        {/* Account Info */}
        <div className="card-cozy p-5 space-y-4" data-section="account-info">
          <div className="flex items-center gap-2 text-[var(--text)]">
            <User size={18} />
            <h2 className="text-base font-bold">Account Information</h2>
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} data-field="username" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} data-field="email" />
          </div>
        </div>

        {/* Password Section */}
        <div className="card-cozy p-5 space-y-4" data-section="password">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <Lock size={18} />
              <h2 className="text-base font-bold">Change Password</h2>
            </div>
            <button onClick={() => setShowPasswordSection(!showPasswordSection)} className="text-xs text-[var(--primary)] font-bold hover:underline" data-action="toggle-password">
              {showPasswordSection ? 'Cancel' : 'Change'}
            </button>
          </div>
          {showPasswordSection && (
            <div className="space-y-3 animate-fade-in">
              <div className="relative">
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Current Password</label>
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} data-field="current-password" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-2.5 top-7 text-[var(--text-muted)]">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">New Password</label>
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} data-field="new-password" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-2.5 top-7 text-[var(--text-muted)]">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-1">Confirm New Password</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} data-field="confirm-password" />
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <button onClick={handleSaveProfile} disabled={saving} className={btnPrimary + ' w-full justify-center'} data-action="save-profile">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
        </button>

        {/* Danger Zone */}
        <div className="card-cozy p-5 space-y-3" style={{ borderColor: 'var(--yarn-red)' }} data-section="danger-zone">
          <h2 className="text-base font-extrabold text-[var(--yarn-red)]">Danger Zone</h2>
          <p className="text-sm font-semibold text-[var(--yarn-red)] opacity-80">Deleting your account is permanent and cannot be undone.</p>
          <button onClick={() => setShowDeleteConfirm(true)} className={btnDanger} data-action="delete-account">
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" data-modal="delete-account">
          <div className="card-cozy p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-extrabold text-[var(--text)] mb-2">Delete Account?</h3>
            <p className="text-sm font-semibold text-[var(--text-muted)] mb-4">This action is irreversible. All your tasks and data will be permanently deleted.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm font-bold rounded-xl border-2 border-[var(--border)] hover:bg-[var(--surface-alt)] transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteAccount} className={btnDanger}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProfilePage: React.FC = () => (
  <ToastProvider>
    <ProfileInner />
  </ToastProvider>
);
export default ProfilePage;
