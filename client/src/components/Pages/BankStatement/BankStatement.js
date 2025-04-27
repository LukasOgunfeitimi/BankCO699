import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FaDownload, FaFilePdf, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { API_URL } from '../../../config';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable';

// Apply plugin to jsPDF
applyPlugin(jsPDF);

/**
 * BankStatement component displays a user's account statement with transaction history
 * and provides functionality to download the statement as a PDF.
 */
const BankStatement = () => {
  const { token } = useOutletContext();
  const [statementData, setStatementData] = useState({
    transactions: [],
    userInfo: { name: '', accountNum: '' },
    isLoading: false,
    error: null
  });

  /**
   * Fetches user information and transaction data from the API
   */
  useEffect(() => {
    const fetchStatementData = async () => {
      try {
        setStatementData(prev => ({ ...prev, isLoading: true, error: null }));

        // Fetch user info and transactions in parallel for better performance
        const [userInfoResponse, transactionsResponse] = await Promise.all([
          fetch(`${API_URL}/userinfo`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch(`${API_URL}/transactions?limit=100&sort=desc`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // Check for errors in responses
        if (!userInfoResponse.ok || !transactionsResponse.ok) {
          const error = !userInfoResponse.ok 
            ? 'Failed to fetch user information' 
            : 'Failed to fetch transactions';
          throw new Error(error);
        }

        const [userInfoData, transactionsData] = await Promise.all([
          userInfoResponse.json(),
          transactionsResponse.json()
        ]);

        setStatementData({
          transactions: transactionsData.transactions || [],
          userInfo: {
            name: userInfoData.name,
            accountNum: userInfoData.account_num
          },
          isLoading: false,
          error: null
        });
      } catch (error) {
        setStatementData(prev => ({
          ...prev,
          isLoading: false,
          error: error.message
        }));
      }
    };

    fetchStatementData();
  }, [token]);

  /**
   * Generates a PDF document containing the account statement
   */
  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const currentDate = new Date();
      const formattedDate = format(currentDate, 'MMM dd, yyyy hh:mm:ss');
      const fileName = `LuFunds_Statement_${format(currentDate, 'yyyyMMdd_HHmmss')}.pdf`;

      // Document styling constants
      const primaryColor = [40, 53, 147];
      const secondaryColor = [240, 240, 240];
      const headerHeight = 40;
      const margin = 20;

      // Add header with bank logo and title
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, doc.internal.pageSize.width, headerHeight, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('LuFunds Bank', margin, 20);
      
      doc.setFontSize(14);
      doc.text('Account Statement', margin, 30);

      // Add account holder information
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Account Holder: ${statementData.userInfo.name}`, margin, 45);
      doc.text(`Account Number: ${statementData.userInfo.accountNum}`, margin, 50);
      doc.line(margin, 52, doc.internal.pageSize.width - margin, 52);

      // Prepare table data
      const columns = ['Date', 'Transaction Type', 'Amount (USD)'];
      const rows = statementData.transactions.map(t => [
        format(new Date(t.created_at), 'MMM dd, yyyy'),
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.amount.toFixed(2)
      ]);

      // Add transactions table
      doc.autoTable({
        head: [columns],
        body: rows,
        startY: 60,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          valign: 'middle'
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: secondaryColor
        },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 60 },
          2: { cellWidth: 30, halign: 'right' }
        }
      });

      // Add footer
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text(`Generated on: ${formattedDate}`, margin, doc.internal.pageSize.height - 20);
      doc.text('LuFunds Bank - All rights reserved', margin, doc.internal.pageSize.height - 10);

      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setStatementData(prev => ({
        ...prev,
        error: 'Failed to generate PDF statement'
      }));
    }
  };

  /**
   * Renders a loading spinner
   */
  const renderLoadingSpinner = () => (
    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
      <div className="text-center">
        <FaSpinner className="animate-spin text-3xl text-blue-600 mb-2 mx-auto" />
        <p className="text-gray-600">Loading your account statement...</p>
      </div>
    </div>
  );

  /**
   * Renders an error message
   */
  const renderErrorMessage = () => (
    <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
      <div className="flex items-center">
        <FaExclamationTriangle className="flex-shrink-0 text-red-500 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Error loading statement</h3>
          <p className="text-sm text-red-700 mt-1">{statementData.error}</p>
        </div>
      </div>
    </div>
  );

  /**
   * Renders the account information section
   */
  const renderAccountInfo = () => (
    <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Account Holder</p>
          <p className="text-lg font-medium text-gray-800">
            {statementData.userInfo.name || 'Not available'}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Account Number</p>
          <p className="text-lg font-medium text-gray-800">
            {statementData.userInfo.accountNum || 'Not available'}
          </p>
        </div>
      </div>
    </div>
  );

  /**
   * Renders the transactions table
   */
  const renderTransactionsTable = () => {
    if (statementData.isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-gray-500 text-2xl" />
        </div>
      );
    }

    if (statementData.transactions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">No transactions found for this account</p>
        </div>
      );
    }

    return (
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statementData.transactions.map((transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(transaction.created_at), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.type === 'deposit'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                  ${transaction.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden relative">
          {/* Loading overlay */}
          {statementData.isLoading && renderLoadingSpinner()}

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-white text-xl font-bold">Account Statement</h1>
              <span className="text-blue-200 text-sm">
                {format(new Date(), 'MMMM d, yyyy')}
              </span>
            </div>
            <button
              onClick={generatePDF}
              disabled={statementData.isLoading}
              className="inline-flex items-center space-x-2 bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md transition-colors duration-200 font-medium shadow-sm"
            >
              <FaFilePdf className="text-lg" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Main content */}
          <div className="px-6 py-6">
            {/* Error message */}
            {statementData.error && renderErrorMessage()}

            {/* Account information */}
            {renderAccountInfo()}

            {/* Transactions */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Transaction History</h2>
              {renderTransactionsTable()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankStatement;