import { useState } from 'react';
import { Plus, Pencil, Clock, Shield, UserCheck, UserX } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PageHeader, Modal, formatLKR } from '../components/ui';
import { PERMISSIONS, type StaffUser, type UserRole } from '../types';

export function UsersPage() {
  const { staff, shifts, addStaff, updateStaff, startShift, endShift } = useApp();
  const [activeTab, setActiveTab] = useState<'accounts' | 'permissions' | 'shifts'>('accounts');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [openingCash, setOpeningCash] = useState('5000');
  const [closingShiftId, setClosingShiftId] = useState<string | null>(null);
  const [closingCash, setClosingCash] = useState('');

  const [form, setForm] = useState({
    username: '',
    fullName: '',
    role: 'cashier' as UserRole,
    phone: '',
    email: '',
    isActive: true,
    permissions: ['pos.billing'] as string[],
  });

  const tabs = [
    { id: 'accounts' as const, label: 'Cashier Accounts' },
    { id: 'permissions' as const, label: 'Permissions' },
    { id: 'shifts' as const, label: 'Shift Management' },
  ];

  const roleColors: Record<UserRole, string> = {
    admin: 'badge-danger',
    manager: 'badge-warning',
    cashier: 'badge-info',
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ username: '', fullName: '', role: 'cashier', phone: '', email: '', isActive: true, permissions: ['pos.billing'] });
    setModalOpen(true);
  };

  const openEdit = (user: StaffUser) => {
    setEditing(user);
    setForm({
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      email: user.email,
      isActive: user.isActive,
      permissions: [...user.permissions],
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.username || !form.fullName) return;
    if (editing) {
      updateStaff(editing.id, form);
    } else {
      addStaff(form);
    }
    setModalOpen(false);
  };

  const togglePermission = (permId: string) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((p) => p !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleStartShift = () => {
    if (!selectedUserId) return;
    startShift(selectedUserId, parseFloat(openingCash) || 0);
    setShiftModalOpen(false);
  };

  const handleEndShift = () => {
    if (!closingShiftId) return;
    endShift(closingShiftId, parseFloat(closingCash) || 0);
    setClosingShiftId(null);
    setClosingCash('');
  };

  const activeShifts = shifts.filter((s) => s.status === 'active');

  return (
    <div>
      <PageHeader
        title="Users & Staff"
        subtitle="Cashier accounts, permissions & shift management"
        action={
          activeTab === 'accounts' ? (
            <button onClick={openAdd} className="btn-primary">
              <Plus className="h-4 w-4" />
              Add Staff
            </button>
          ) : activeTab === 'shifts' ? (
            <button onClick={() => setShiftModalOpen(true)} className="btn-primary">
              <Clock className="h-4 w-4" />
              Start Shift
            </button>
          ) : undefined
        }
      />

      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'accounts' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Staff Member</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Username</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Email</th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">Status</th>
                <th className="px-4 py-3 text-center font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium">{user.fullName}</p>
                        <p className="text-xs text-slate-500">Since {user.createdAt}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{user.username}</td>
                  <td className="px-4 py-3">
                    <span className={roleColors[user.role]}>{user.role}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{user.phone}</td>
                  <td className="px-4 py-3 text-slate-500">{user.email}</td>
                  <td className="px-4 py-3 text-center">
                    {user.isActive ? (
                      <span className="badge-success flex items-center justify-center gap-1">
                        <UserCheck className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="badge-danger flex items-center justify-center gap-1">
                        <UserX className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => openEdit(user)} className="text-slate-500 hover:text-emerald-600">
                      <Pencil className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {staff.filter((u) => u.isActive).map((user) => (
            <div key={user.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <div>
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button onClick={() => openEdit(user)} className="btn-secondary text-xs py-1.5">
                  Edit Permissions
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERMISSIONS.map((perm) => (
                  <span
                    key={perm.id}
                    className={
                      user.permissions.includes(perm.id)
                        ? 'badge-success'
                        : 'badge bg-slate-50 text-slate-500'
                    }
                  >
                    {perm.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'shifts' && (
        <div className="space-y-6">
          {activeShifts.length > 0 && (
            <div>
              <h3 className="mb-3 font-semibold text-emerald-700 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Shifts
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {activeShifts.map((shift) => (
                  <div key={shift.id} className="card border-emerald-200 bg-emerald-50 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{shift.userName}</p>
                        <p className="text-xs text-slate-500">
                          Started: {new Date(shift.startTime).toLocaleString('en-LK')}
                        </p>
                      </div>
                      <span className="badge-success">Active</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Opening Cash</p>
                        <p className="font-semibold">{formatLKR(shift.openingCash)}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Sales So Far</p>
                        <p className="font-semibold text-emerald-600">{formatLKR(shift.totalSales)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setClosingShiftId(shift.id);
                        setClosingCash(String(shift.openingCash + shift.totalSales));
                      }}
                      className="btn-danger w-full mt-4 text-sm"
                    >
                      End Shift
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3">
              <h3 className="font-semibold">Shift History</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-slate-500">Staff</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-500">Start</th>
                  <th className="px-4 py-2 text-left font-medium text-slate-500">End</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-500">Opening</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-500">Closing</th>
                  <th className="px-4 py-2 text-right font-medium text-slate-500">Sales</th>
                  <th className="px-4 py-2 text-center font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium">{shift.userName}</td>
                    <td className="px-4 py-2 text-slate-500">{new Date(shift.startTime).toLocaleString('en-LK')}</td>
                    <td className="px-4 py-2 text-slate-500">
                      {shift.endTime ? new Date(shift.endTime).toLocaleString('en-LK') : '-'}
                    </td>
                    <td className="px-4 py-2 text-right">{formatLKR(shift.openingCash)}</td>
                    <td className="px-4 py-2 text-right">
                      {shift.closingCash != null ? formatLKR(shift.closingCash) : '-'}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">{formatLKR(shift.totalSales)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={shift.status === 'active' ? 'badge-success' : 'badge-info'}>
                        {shift.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Staff Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Staff' : 'Add Staff Member'}
        size="lg"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          </div>
          <div>
            <label className="label">Username</label>
            <input className="input" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+94 77 XXX XXXX" />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}>
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              <span className="text-sm">Active</span>
            </label>
          </div>
          <div className="col-span-2">
            <label className="label">Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2 cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(perm.id)}
                    onChange={() => togglePermission(perm.id)}
                    className="rounded"
                  />
                  <div>
                    <span className="text-sm">{perm.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          <button onClick={handleSave} className="btn-primary">{editing ? 'Update' : 'Add Staff'}</button>
        </div>
      </Modal>

      {/* Start Shift Modal */}
      <Modal open={shiftModalOpen} onClose={() => setShiftModalOpen(false)} title="Start New Shift" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Select Cashier</label>
            <select className="input" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              <option value="">Select staff member...</option>
              {staff.filter((u) => u.isActive && u.role !== 'admin').map((u) => (
                <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Opening Cash (Rs.)</label>
            <input type="number" className="input" value={openingCash} onChange={(e) => setOpeningCash(e.target.value)} />
          </div>
          <button onClick={handleStartShift} className="btn-primary w-full">Start Shift</button>
        </div>
      </Modal>

      {/* End Shift Modal */}
      <Modal open={!!closingShiftId} onClose={() => setClosingShiftId(null)} title="End Shift" size="md">
        <div className="space-y-4">
          <div>
            <label className="label">Closing Cash Count (Rs.)</label>
            <input type="number" className="input" value={closingCash} onChange={(e) => setClosingCash(e.target.value)} autoFocus />
          </div>
          <button onClick={handleEndShift} className="btn-danger w-full">End Shift & Close</button>
        </div>
      </Modal>
    </div>
  );
}
