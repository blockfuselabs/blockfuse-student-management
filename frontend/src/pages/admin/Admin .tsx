import React, { useState, useEffect } from 'react';
import { Users, Trash2, Plus } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAccount, useContractWrite, useWaitForTransactionReceipt, useContractRead } from 'wagmi';
import { parseAbi } from 'viem';

// Define the contract ABI
const contractABI = parseAbi([
  "function addAdmin(address adminAddress) returns (bool)",
  "function removeAdmin(address adminAddress) returns (bool)",
  "function superAdmin() view returns (address)"
]);

// Define types for admin and contract interactions
interface Admin {
  id: number;
  name: string;
  email: string;
  role: string;
  address: string;
  dateAdded: string;
}

const CONTRACT_ADDRESS = "0x675ec9E03ff013479eDaE3033ecfd26d796a5f0d" as `0x${string}`;

const Admin: React.FC = () => {
  const { address: userAddress, isConnected } = useAccount();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'Admin',
    address: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);

  // Read super admin address
  const { data: superAdminAddress } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: contractABI,
    functionName: 'superAdmin',
  });

  // Add admin contract write
  const { 
    writeContract: addAdminWrite, 
    isPending: isAddingAdmin, 
    data: addAdminData 
  } = useContractWrite({
    mutation: {
      onSuccess(data) {
        handleAddAdminSuccess();
        toast.success('Admin added successfully!');
      },
      onError(error) {
        toast.error('Failed to add admin: ' + error.message);
      }
    }
  });

  // Remove admin contract write
  const { 
    writeContract: removeAdminWrite, 
    isPending: isRemovingAdmin, 
    data: removeAdminData 
  } = useContractWrite({
    mutation: {
      onSuccess(data) {
        handleRemoveAdminSuccess();
        toast.success('Admin removed successfully!');
      },
      onError(error) {
        toast.error('Failed to remove admin: ' + error.message);
      }
    }
  });

  // Check if user is super admin
  useEffect(() => {
    if (superAdminAddress && userAddress && 
        superAdminAddress.toLowerCase() !== userAddress.toLowerCase()) {
      toast.error('Only super admin can access this page');
    }
  }, [superAdminAddress, userAddress]);

  const handleAddAdminSuccess = () => {
    const admin: Admin = {
      id: Date.now(),
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      address: newAdmin.address,
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setAdmins([...admins, admin]);
    setNewAdmin({ name: '', email: '', role: 'Admin', address: '' });
    setShowAddModal(false);
  };

  const handleRemoveAdminSuccess = () => {
    setAdmins(admins.filter(admin => admin.address !== newAdmin.address));
  };

  const addAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.address) {
      toast.warning('Please fill in all required fields');
      return;
    }
    
    try {
      addAdminWrite({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'addAdmin',
        args: [newAdmin.address as `0x${string}`],
      });
    } catch (err: any) {
      toast.error('Failed to add admin: ' + err.message);
    }
  };

  const removeAdmin = async (id: number, address: string) => {
    try {
      removeAdminWrite({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: 'removeAdmin',
        args: [address as `0x${string}`],
      });
    } catch (err: any) {
      toast.error('Failed to remove admin: ' + err.message);
    }
  };

  if (!isConnected) {
    return (
      <div className="px-4 md:px-8 py-6">
        <ToastContainer />
        <div className="text-center">
          Please connect your wallet to access this page
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 bg-white flex-grow min-w-0">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between gap-4 items-start py-6">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-[#2A3355]">Admin Management</h1>
          <p className="text-gray-600 mt-2">Add or remove system administrators</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={isAddingAdmin || isRemovingAdmin}
          className="flex items-center px-4 py-2 bg-[#1E2A55] text-white rounded-lg hover:bg-[#2A3355] transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Admin
        </button>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-[#2A3355] mb-4">Add New Admin</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newAdmin.name}
                onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Wallet Address</label>
              <input
                type="text"
                value={newAdmin.address}
                onChange={(e) => setNewAdmin({ ...newAdmin, address: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring focus:ring-blue-300"
              />
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={addAdmin}
                className="px-4 py-2 bg-[#1E2A55] text-white rounded-lg hover:bg-[#2A3355] transition-colors"
              >
                Add Admin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Table */}
      <div className="bg-white mt-8 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Admin</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Address</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {`${admin.address.slice(0, 6)}...${admin.address.slice(-4)}`}
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
                      onClick={() => removeAdmin(admin.id, admin.address)}
                      disabled={isRemovingAdmin}
                      className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {admins.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500 text-sm"
                  >
                    No admins found. Click "Add New Admin" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;