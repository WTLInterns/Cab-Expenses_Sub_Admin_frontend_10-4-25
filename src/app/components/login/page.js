'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send login request to backend
      const res = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password
      });

      // Check if login was successful
      if (res.status === 200) {
        toast.success(res.data.message);

        // ✅ Store the token in localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('id', res.data.id);

        // ✅ Redirect to the dashboard
        router.push('/AdminDashboard');
      }
    } catch (error) {
      // Handle error response
      toast.error('Invalid credentials or something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Define animation variants
  const variants = {
    initial: { opacity: 0, rotateY: -90 },
    animate: { opacity: 1, rotateY: 0 },
    exit: { opacity: 0, rotateY: 90 },
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="relative w-80 h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key="login"
            className="absolute inset-0 bg-gray-900 text-white p-8 rounded-2xl shadow-2xl border border-gray-700"
            style={{ backfaceVisibility: "hidden" }}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-300 text-sm font-bold mb-2">Email</label>
                <motion.input
                  whileFocus={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(99,102,241)" }}
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-300 text-sm font-bold mb-2">Password</label>
                <motion.input
                  whileFocus={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(99,102,241)" }}
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                type="submit"
                className={`w-full bg-indigo-600 text-white py-2 rounded-lg transition ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-500'}`}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </motion.button>
            </form>
            <p
              className="text-center text-sm text-indigo-400 mt-4 cursor-pointer hover:underline"
              onClick={() => router.push('/forgot-password')}
            >
              Forgot Password?
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;