'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export default function ResetPassword() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
  
    const handleResetPassword = async (e) => {
      e.preventDefault();
      setLoading(true);
  
      try {
        const email = localStorage.getItem('email');
        const res = await axios.post('http://localhost:5000/api/admin/reset-password', { email, password });
        if (res.status === 200) {
          toast.success('Password Reset Successful!');
          localStorage.removeItem('email');
          router.push('/components/login');
        }
      } catch (error) {
        toast.error('Failed to reset password. Try again.');
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <button
              type="submit"
              className={`w-full bg-blue-500 text-white py-2 rounded-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }
  