import React, { useState, useEffect } from "react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { FaUser, FaMoneyBillWave, FaArrowDown, FaArrowUp, FaHistory } from "react-icons/fa";
import { API_URL } from "../../../config";
import AuthModal from '../../Tools/AuthModal';

function Dashboard() {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [authOpen, setAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const [userInfo, setUserInfo] = useState({
    name: '',
    accountNum: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch user info
        const userInfoResponse = await fetch(`${API_URL}/userinfo`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userInfoData = await userInfoResponse.json();
        if (userInfoResponse.ok) {
          setUserInfo({
            name: userInfoData.name,
            accountNum: userInfoData.account_num
          });
        } else {
          setError(userInfoData.error || 'Failed to fetch user information');
        }

        // Fetch balance
        const balanceResponse = await fetch(`${API_URL}/balance`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const balanceData = await balanceResponse.json();
        if (balanceResponse.ok) {
          setBalance(balanceData.balance);
        } else {
          setError(balanceData.error || 'Failed to fetch balance');
        }

        // Fetch transactions
        const transactionsResponse = await fetch(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactionsData = await transactionsResponse.json();
        if (transactionsResponse.ok) {
          setTransactions(transactionsData.transactions);
        } else {
          setError(transactionsData.error || 'Failed to fetch transactions');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const handleTransaction = async (endpoint, authToken) => {
    if (!amount || isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.newBalance);
        setAmount('');

        // Refresh transactions
        const transactionsResponse = await fetch(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const transactionsData = await transactionsResponse.json();
        if (transactionsResponse.ok) {
          setTransactions(transactionsData.transactions);
        }
      } else {
        setError(data.error || `Failed to process ${endpoint}`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Open AuthModal and set pending action
  const requestAuthFor = (action) => {
    if (!amount || isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }
    setPendingAction(action);
    setAuthOpen(true);
  };

  // Called when authentication succeeds
  const handleAuthSuccess = (authToken) => {
    setAuthOpen(false);
    if (pendingAction) {
      handleTransaction(pendingAction, authToken);
      setPendingAction(null);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome back, <span className="text-blue-600">{userInfo.name || 'User'}</span>
            </h1>
            <div className="flex items-center mt-2 text-gray-600">
              <FaUser className="mr-2" />
              <span className="text-sm font-medium">
                Account #: {userInfo.accountNum || 'Loading...'}
              </span>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/settings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Account Settings
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Balance Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-500">Available Balance</h2>
              <FaMoneyBillWave className="text-blue-500 text-xl" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">
              ${balance.toFixed(2)}
            </div>
            <p className="text-sm text-gray-500">Last updated just now</p>
          </div>

          {/* Transaction Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => requestAuthFor('deposit')}
                  disabled={isLoading}
                  className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                  type="button"
                >
                  <FaArrowDown className="mr-2" />
                  {isLoading ? 'Processing...' : 'Deposit'}
                </button>
                <button
                  onClick={() => requestAuthFor('withdraw')}
                  disabled={isLoading}
                  className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                  type="button"
                >
                  <FaArrowUp className="mr-2" />
                  {isLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-800 flex items-center">
                <FaHistory className="mr-2 text-blue-500" />
                Recent Transactions
              </h2>
              <Link
                to="/bank-statement"
                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Full Statement
              </Link>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No transactions found
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${transaction.type === 'deposit' ? 'bg-green-100 text-green-800' :
                              transaction.type === 'withdrawal' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' :
                          transaction.type === 'withdrawal' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          ${transaction.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.type === 'transfer' ? (
                            <>
                              {transaction.recipient_account_num ? (
                                <span>To: {transaction.recipient_account_num}</span>
                              ) : (
                                <span>From: {transaction.sender_account_num}</span>
                              )}
                            </>
                          ) : (
                            'N/A'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Auth Modal */}
      <AuthModal open={authOpen} onSuccess={handleAuthSuccess} onCancel={() => setAuthOpen(false)} />
    </div>
  );
}

export default Dashboard;