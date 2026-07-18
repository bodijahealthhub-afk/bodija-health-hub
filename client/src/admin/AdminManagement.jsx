import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FiUserPlus, FiKey, FiTrash2, FiShield } from 'react-icons/fi'

export default function AdminManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'admin', phone: '' })
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/auth/users', { headers: { Authorization: `Bearer ${token}` } })
      if (res.ok) setUsers(await res.json())
    } catch { toast.error('Failed to load users') }
    setLoading(false)
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newUser)
      })
      if (res.ok) {
        toast.success('User created!')
        setShowAddModal(false)
        setNewUser({ name: '', email: '', password: '', role: 'admin', phone: '' })
        fetchUsers()
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed')
      }
    } catch { toast.error('Network error') }
    setSaving(false)
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/auth/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ user_id: selectedUser.id, new_password: newPassword })
      })
      if (res.ok) {
        toast.success('Password reset!')
        setShowResetModal(false)
        setSelectedUser(null)
        setNewPassword('')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed')
      }
    } catch { toast.error('Network error') }
    setSaving(false)
  }

  const handleDeleteUser = async (user) => {
    if (!confirm(`Delete ${user.name}?`)) return
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) { toast.success('User deleted'); fetchUsers() }
      else { const err = await res.json(); toast.error(err.error || 'Failed') }
    } catch { toast.error('Network error') }
  }

  const roleColors = { admin: 'bg-red-100 text-red-700', super_admin: 'bg-purple-100 text-purple-700', doctor: 'bg-blue-100 text-blue-700', receptionist: 'bg-green-100 text-green-700', content_manager: 'bg-yellow-100 text-yellow-700' }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-500 mt-1">{users.length} users registered</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 flex items-center gap-2">
          <FiUserPlus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{user.phone || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setSelectedUser(user); setShowResetModal(true) }} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Reset password">
                      <FiKey className="w-4 h-4" />
                    </button>
                    {user.role !== 'super_admin' && (
                      <button onClick={() => handleDeleteUser(user)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete user">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New User</h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input id="new-user-name" type="text" required value={newUser.name} onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input id="new-user-email" type="email" required value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input id="new-user-password" type="password" required value={newUser.password} onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select id="new-user-role" value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500">
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                  <option value="content_manager">Content Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input id="new-user-phone" type="tel" value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50">{saving ? 'Creating...' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowResetModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reset Password</h2>
            <p className="text-gray-500 mb-4">Reset password for <strong>{selectedUser?.name}</strong></p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
                <input id="reset-password" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50">{saving ? 'Resetting...' : 'Reset Password'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
