import React, { useState } from 'react';
import { User, Role } from '../types';
import { Shield, Trash2, Plus, User as UserIcon } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onUpdateUsers: (users: User[]) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUsers }) => {
  const [newUser, setNewUser] = useState({ username: '', role: 'EDITOR' as Role });

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username.trim()) return;
    
    // Simple ID gen
    const user: User = {
      id: Date.now().toString(),
      username: newUser.username.trim(),
      role: newUser.role
    };
    
    onUpdateUsers([...users, user]);
    setNewUser({ username: '', role: 'EDITOR' });
  };

  const removeUser = (id: string) => {
    if (window.confirm("Remove this user?")) {
      onUpdateUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          User Roles & Permissions
        </h2>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 mb-6">
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Admin:</strong> Full access to products and user management.</li>
            <li><strong>Editor:</strong> Can view, add, edit, and delete products. No user management.</li>
          </ul>
        </div>

        <form onSubmit={handleAddUser} className="flex gap-4 items-end mb-8 bg-white p-4 border border-dashed border-slate-300 rounded-xl">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Username</label>
            <input 
              type="text" 
              required
              value={newUser.username} 
              onChange={e => setNewUser(prev => ({...prev, username: e.target.value}))}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. john_doe"
            />
          </div>
          <div className="w-48">
             <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Role</label>
             <select 
               value={newUser.role}
               onChange={e => setNewUser(prev => ({...prev, role: e.target.value as Role}))}
               className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
             >
               <option value="EDITOR">Editor</option>
               <option value="ADMIN">Admin</option>
             </select>
          </div>
          <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </form>

        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">User</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Role</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-medium text-slate-900">{user.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeUser(user.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Remove User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};