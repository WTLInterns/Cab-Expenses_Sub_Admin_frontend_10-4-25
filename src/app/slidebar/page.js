'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu, FiUser, FiTruck, FiLogOut, FiSettings, FiX } from 'react-icons/fi';
import { MdOutlineAssignmentTurnedIn, MdDashboard } from 'react-icons/md';
import { RiMoneyRupeeCircleLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logout successful! Redirecting to login...');
    setTimeout(() => {
      router.push('/components/login');
    }, 1000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: <MdDashboard />, label: 'Dashboard', link: '/AdminDashboard' },
    { icon: <FiUser />, label: 'Driver Details', link: '/DriverDetails' },
    { icon: <FiTruck />, label: 'View Cab', link: '/CabInfo' },
    { icon: <FiSettings />, label: 'Servicing', link: '/Servicing' },
    { icon: <RiMoneyRupeeCircleLine />, label: 'Expensive', link: '/Expensive' },
    { icon: <MdOutlineAssignmentTurnedIn />, label: 'Assign Cab', link: '/AssignCab' },
    // { icon: <MdOutlineAssignmentTurnedIn />, label: 'Add Cab', link: '/AddCab' },
    // { icon: <MdOutlineAssignmentTurnedIn />, label: 'Add Driver', link: '/AddDriver' },
  ];

  return (
    <>
      {/* Mobile Navbar - Only shown on mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-500 to-indigo-700 bg-opacity-90 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-white text-lg font-semibold">Admin</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white text-2xl p-1 rounded-full hover:bg-gray-800 transition-all"
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Overlay - Only shown when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - With reduced opacity control */}
      <div className={`fixed md:relative z-40 h-full transition-all duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div
          className={`min-h-screen flex flex-col w-64 bg-black backdrop-blur-lg shadow-lg border-r border-gray-700 border-opacity-40 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'md:opacity-100 opacity-70'
          }`}
        >
          {/* Hidden on mobile since it's in the navbar */}
          <h2 className="hidden md:block text-white text-lg font-semibold text-center py-3 border-b border-gray-700 md:pb-4 md:pt-6">
            Admin 
          </h2>

          <ul className="space-y-4 px-2 mt-20 md:mt-4">
            {loading
              ? menuItems.map((_, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                    <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
                  </li>
                ))
              : menuItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 p-2  rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 hover:scale-105"
                    onClick={() => {
                      router.push(item.link);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                  >
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white">
                      <span className="text-white font-bold">{item.icon}</span>
                    </span>
                    <span className="text-white font-semibold hover:text-yellow-300">
                      {item.label}
                    </span>
                  </li>
                ))}

            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.1, rotate: 3 }}
              className="w-full mt-4 flex cursor-pointer items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full text-white transition duration-200"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white">
                <FiLogOut className="text-white text-lg font-bold" />
              </span>
              <span className="text-white text-lg font-semibold hover:text-yellow-300">
                Logout
              </span>
            </motion.button>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;