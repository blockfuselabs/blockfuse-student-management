import React, { useState } from 'react';
import { Users, Trash2, Plus } from 'lucide-react';

interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  dateAdded: string;
}

const Admin: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([
    { 
      id: 1, 
      name: "John Admin", 
      email: "john@example.com", 
      role: "Super Admin",
      dateAdded: "2024-01-15"
    },
    { 
      id: 2, 
      name: "Sarah Manager", 
      email: "sarah@example.com", 
      role: "Admin",
      dateAdded: "2024-01-20"
    }
  ]);

  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'Admin'
  });

  const [showAddModal, setShowAddModal] = useState(false);

  const addAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) return;

    const admin: Admin = {
      id: Date.now(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setAdmins([...admins, admin]);
    setNewAdmin({ name: '', email: '', role: 'Admin' });
    setShowAddModal(false);
  };

  const removeAdmin = (id: number) => {
    setAdmins(admins.filter(admin => admin.id !== id));
  };

  return (
    <div className="px-4 md:px-8 bg-white flex-grow min-w-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 items-start py-6">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2A3355]">Admin Management</h1>
          <p className="text-gray-600 mt-2">Add or remove system administrators</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-[#1E2A55] text-white rounded-lg hover:bg-[#2A3355] transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Admin
        </button>
      </div>

      {/* Admin Summary Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-[#2A3355]">Total Admins</h3>
          <p className="mt-2 text-3xl font-bold text-[#2A3355]">{admins.length}</p>
          <p className="text-gray-600">active administrators</p>
        </div>
      </div>

      {/* Admin Table */}
      <div className="bg-white mt-8 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Admin</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date Added</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {admins.map(admin => (
                <tr key={admin.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {admin.dateAdded}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <button
                      onClick={() => removeAdmin(admin.id)}
                      className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#2A3355] mb-4">Add New Admin</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A55]"
                  placeholder="Enter admin name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A55]"
                  placeholder="Enter admin email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E2A55]"
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={addAdmin}
                  className="px-4 py-2 bg-[#1E2A55] text-white rounded-lg hover:bg-[#2A3355]"
                >
                  Add Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;