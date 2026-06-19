import { useState } from 'react';
import { Plus, Pencil, Clock, Shield, UserCheck, UserX } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { PageHeader, Modal, formatLKR, DataTable, Table, TableHead, TableBody, TableRow, TableTh, TableTd } from '../components/ui';
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
        <DataTable>
          <Table>
            <TableHead>
              <TableRow>
                <TableTh>Staff Member</TableTh>
                <TableTh>Username</TableTh>
                <TableTh>Role</TableTh>
                <TableTh>Phone</TableTh>
                <TableTh>Email</TableTh>
                <TableTh align="center">Status</TableTh>
                <TableTh align="center">Actions</TableTh>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((user) => (
                <TableRow key={user.id}>
                  <TableTd>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 font-semibold text-sm">
                        {user.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.fullName}</p>
                        <p className="text-xs text-slate-500">Since {user.createdAt}</p>
                      </div>
                    </div>
                  </TableTd>
                  <TableTd className="font-mono text-xs">{user.username}</TableTd>
                  <TableTd>
                    <span className={roleColors[user.role]}>{user.role}</span>
                  </TableTd>
                  <TableTd className="text-slate-500">{user.phone}</TableTd>
                  <TableTd className="text-slate-500">{user.email}</TableTd>
                  <TableTd align="center">
                    {user.isActive ? (
                      <span className="badge-success flex items-center justify-center gap-1">
                        <UserCheck className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="badge-danger flex items-center justify-center gap-1">
                        <UserX className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </TableTd>
                  <TableTd align="center">
                    <button onClick={() => openEdit(user)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-100 hover:text-emerald-600">
                      <Pencil className="h-4 w-4 inline" />
                    </button>
                  </TableTd>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
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

          <DataTable title="Shift History">
            <Table>
              <TableHead>
                <TableRow>
                  <TableTh>Staff</TableTh>
                  <TableTh>Start</TableTh>
                  <TableTh>End</TableTh>
                  <TableTh align="right">Opening</TableTh>
                  <TableTh align="right">Closing</TableTh>
                  <TableTh align="right">Sales</TableTh>
                  <TableTh align="center">Status</TableTh>
                </TableRow>
              </TableHead>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableTd className="font-medium text-slate-900">{shift.userName}</TableTd>
                    <TableTd className="text-slate-500">{new Date(shift.startTime).toLocaleString('en-LK')}</TableTd>
                    <TableTd className="text-slate-500">
                      {shift.endTime ? new Date(shift.endTime).toLocaleString('en-LK') : '-'}
                    </TableTd>
                    <TableTd align="right">{formatLKR(shift.openingCash)}</TableTd>
                    <TableTd align="right">
                      {shift.closingCash != null ? formatLKR(shift.closingCash) : '-'}
                    </TableTd>
                    <TableTd align="right" className="font-medium text-emerald-700">{formatLKR(shift.totalSales)}</TableTd>
                    <TableTd align="center">
                      <span className={shift.status === 'active' ? 'badge-success' : 'badge-info'}>
                        {shift.status}
                      </span>
                    </TableTd>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DataTable>
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
