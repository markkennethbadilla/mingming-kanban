'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ToastProvider, useToast } from '@/context/ToastContext';
import Loader from '@/components/Loader';
import { User, Lock, Trash2, Save, Eye, EyeOff } from 'lucide-react';

const inputClass = 'w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors';
const btnPrimary = 'inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors disabled:opacity-50';
const btnDanger = 'inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50';

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
    <div className="min-h-[calc(100vh-64px)] bg-[var(--surface)] px-4 py-6" data-page="profile">
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Profile Settings</h1>

        {/* Account Info */}
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-card p-5 space-y-4" data-section="account-info">
          <div className="flex items-center gap-2 text-[var(--text)]">
            <User size={18} />
            <h2 className="text-base font-semibold">Account Information</h2>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} data-field="username" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} data-field="email" />
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl border border-[var(--border)] shadow-card p-5 space-y-4" data-section="password">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--text)]">
              <Lock size={18} />
              <h2 className="text-base font-semibold">Change Password</h2>
            </div>
            <button onClick={() => setShowPasswordSection(!showPasswordSection)} className="text-xs text-primary hover:underline" data-action="toggle-password">
              {showPasswordSection ? 'Cancel' : 'Change'}
            </button>
          </div>
          {showPasswordSection && (
            <div className="space-y-3 animate-fade-in">
              <div className="relative">
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Current Password</label>
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} data-field="current-password" />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-2.5 top-7 text-[var(--text-muted)]">
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">New Password</label>
                <input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} data-field="new-password" />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-2.5 top-7 text-[var(--text-muted)]">
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">Confirm New Password</label>
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
        <div className="bg-red-50 rounded-xl border border-red-200 p-5 space-y-3" data-section="danger-zone">
          <h2 className="text-base font-semibold text-red-700">Danger Zone</h2>
          <p className="text-sm text-red-600">Deleting your account is permanent and cannot be undone.</p>
          <button onClick={() => setShowDeleteConfirm(true)} className={btnDanger} data-action="delete-account">
            <Trash2 size={16} /> Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" data-modal="delete-account">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 animate-fade-in">
            <h3 className="text-lg font-bold text-[var(--text)] mb-2">Delete Account?</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">This action is irreversible. All your tasks and data will be permanently deleted.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-sm rounded-lg border border-[var(--border)] hover:bg-gray-50 transition-colors">
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
