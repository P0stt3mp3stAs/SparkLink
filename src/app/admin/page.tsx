'use client';

import { useState, useEffect } from 'react';

interface UserPayment {
  userId: string;
  username: string;
  hasPaid: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = () => {
    // Get paid users from localStorage
    const paidData = localStorage.getItem('paidUsers');
    const paidUsers = paidData ? JSON.parse(paidData) : {};
    
    // Convert paidUsers object to array of actual users with payments
    const actualUsers: UserPayment[] = Object.entries(paidUsers).map(([userId, hasPaid]) => ({
      userId,
      username: `user_${userId.slice(0, 8)}`, // Generate username from ID
      hasPaid: hasPaid as boolean
    }));

    setUsers(actualUsers);
    setLoading(false);
  };

  const addTestPayments = () => {
    const paidUsers = {
      'test_user_001': true,
      'test_user_002': false,
      'test_user_003': true,
    };
    
    localStorage.setItem('paidUsers', JSON.stringify(paidUsers));
    loadAllUsers();
  };

  const deleteAllPaymentsData = () => {
  if (confirm('⚠️ ARE YOU SURE?\n\nThis will delete ALL payment data for ALL users. This action cannot be undone!')) {
    
    // 1. Clear the main payment storage
    localStorage.removeItem('paidUsers');
    
    // 2. Clear global premium flag
    localStorage.removeItem('hasPaidForPremium');
    
    // 3. Clear ALL user-specific payment data from localStorage
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (key.includes('Paid') || key.includes('paid') || key.includes('payment')) {
        localStorage.removeItem(key);
      }
    });
    
    // 4. Force reload to clear any in-memory state
    window.location.reload();
    
    alert('✅ ALL payment data has been completely deleted for ALL users!');
  }
};

  const togglePayment = (userId: string) => {
    const paidUsers = JSON.parse(localStorage.getItem('paidUsers') || '{}');
    paidUsers[userId] = !paidUsers[userId];
    localStorage.setItem('paidUsers', JSON.stringify(paidUsers));
    loadAllUsers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Loading payment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">Admin - Payment Management</h1>
        
        <div className="mb-6 flex gap-4 flex-wrap">
          <button
            onClick={addTestPayments}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Add Test Data
          </button>
          <button
            onClick={deleteAllPaymentsData}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 border border-red-400 flex items-center gap-2"
          >
            <span>🗑️</span>
            <span>DELETE ALL PAYMENT DATA</span>
          </button>
          <button
            onClick={loadAllUsers}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">{users.length}</div>
            <div className="text-gray-400">Users with Payment Data</div>
          </div>
          <div className="bg-green-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">
              {users.filter(user => user.hasPaid).length}
            </div>
            <div className="text-green-400">Paid Users</div>
          </div>
          <div className="bg-red-900 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-white">
              {users.filter(user => !user.hasPaid).length}
            </div>
            <div className="text-red-400">Unpaid Users</div>
          </div>
        </div>

        {users.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-yellow-400 text-6xl mb-4">💸</div>
            <h2 className="text-xl font-semibold mb-2">No Payment Data Found</h2>
            <p className="text-gray-400 mb-4">No users have made payments yet.</p>
            <button
              onClick={addTestPayments}
              className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-600"
            >
              Add Test Payment Data
            </button>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Records</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="px-4 py-3 text-left font-semibold">User ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Username</th>
                    <th className="px-4 py-3 text-left font-semibold">Payment Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr 
                      key={user.userId} 
                      className={`border-b border-gray-700 ${index % 2 === 0 ? 'bg-gray-900' : 'bg-gray-800'}`}
                    >
                      <td className="px-4 py-3 text-sm font-mono">{user.userId}</td>
                      <td className="px-4 py-3 font-medium">{user.username}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.hasPaid 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {user.hasPaid ? 'PAID' : 'NOT PAID'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => togglePayment(user.userId)}
                          className={`text-xs px-3 py-1 rounded ${
                            user.hasPaid 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-green-500 hover:bg-green-600'
                          } text-white`}
                        >
                          {user.hasPaid ? 'Mark Unpaid' : 'Mark Paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-yellow-400 mb-2">Current Payment Data:</h3>
              <div className="bg-gray-900 p-3 rounded">
                <pre className="text-xs overflow-x-auto max-h-32">
                  {JSON.stringify(JSON.parse(localStorage.getItem('paidUsers') || '{}'), null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="text-yellow-400 mb-2">Storage Analysis:</h3>
              <div className="text-sm text-gray-400 space-y-2">
                <p>• Total payment records: {users.length}</p>
                <p>• Paid users: {users.filter(u => u.hasPaid).length}</p>
                <p>• Unpaid users: {users.filter(u => !u.hasPaid).length}</p>
                <p>• Storage key: <code>localStorage.paidUsers</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}