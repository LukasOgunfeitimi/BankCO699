import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './components/Pages/Dashboard/Dashboard';
import BankStatement from './components/Pages/BankStatement/BankStatement.js';
import Authenticate from './components/Pages/Auth/Authenticate.js';
import Layout from './components/Pages/Dashboard/Layout';
import Login from './components/Pages/Login';
import Register from './components/Pages/Register';
import RequestReset from './components/Pages/RequestReset';
import ResetPassword from './components/Pages/ResetPassword';
import Settings from './components/Pages/Dashboard/Settings';
import Transfer from './components/Pages/Dashboard/Transfer';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/requestreset" element={<RequestReset />} />
        <Route path="/resetpassword" element={<ResetPassword />} />
        <Route path="/" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="bank-statement" element={<BankStatement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="transfer" element={<Transfer />} />
        </Route>
      </Routes>
    </Router>
  );
}
// add not found page

export default App;