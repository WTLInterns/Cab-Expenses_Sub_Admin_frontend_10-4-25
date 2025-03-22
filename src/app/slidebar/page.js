'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu, FiUser, FiTruck, FiLogOut, FiSettings } from 'react-icons/fi';
import { MdOutlineAssignmentTurnedIn, MdDashboard } from 'react-icons/md';
import { RiMoneyRupeeCircleLine } from 'react-icons/ri';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from "framer-motion";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Logout successful! Redirecting to login...');
    setTimeout(() => {
      router.push('/components/login');
    }, 1000);
  };

  // Simulate sidebar loading (skeleton loader) for 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Update cursor position for both desktop and touch devices
  useEffect(() => {
    const updateCursor = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const updateTouchCursor = (e) => {
      if (e.touches.length > 0) {
        setCursorPos({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        });
      }
    };

    window.addEventListener('mousemove', updateCursor);
    window.addEventListener('touchmove', updateTouchCursor);
    return () => {
      window.removeEventListener('mousemove', updateCursor);
      window.removeEventListener('touchmove', updateTouchCursor);
    };
  }, []);

  // Define sidebar menu items
  const menuItems = [
    { icon: <MdDashboard />, label: 'Dashboard', link: '/AdminDashboard' },
    { icon: <FiUser />, label: 'Driver Details', link: '/DriverDetails' },
    { icon: <FiTruck />, label: 'View Cab', link: '/CabInfo' },
    { icon: <FiSettings />, label: 'Servicing', link: '/Servicing' },
    { icon: <RiMoneyRupeeCircleLine />, label: 'Expensive', link: '/Expensive' },
    { icon: <MdOutlineAssignmentTurnedIn />, label: 'Assign Cab', link: '/AssignCab' },
    { icon: <MdOutlineAssignmentTurnedIn />, label: 'Add Cab', link: '/AddCab' },
    { icon: <MdOutlineAssignmentTurnedIn />, label: 'Add Driver', link: '/AddDriver' },
  ];

  return (
    <>
      {/* Custom Cursor */}
      <div
        className="fixed pointer-events-none z-50 rounded-full border-2 border-white"
        style={{
          width: '20px',
          height: '20px',
          transform: `translate(${cursorPos.x - 10}px, ${cursorPos.y - 10}px)`,
          transition: 'transform 0.1s ease-out',
        }}
      />

      {/* Sidebar */}
      <div className="flex">
        <div
          className={`min-h-screen transition-all duration-300 flex flex-col 
            ${isOpen ? 'w-64' : 'w-16'} bg-black backdrop-blur-lg shadow-lg border-r border-gray-700 border-opacity-40`}
          style={{
            borderImage: 'linear-gradient(to bottom, #ffffff33, #ffffff11) 1',
          }}
        >
          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl p-3 hover:bg-gray-800/50 transition-all rounded-full"
          >
            <FiMenu />
          </button>

          <ul className="space-y-4 px-2">
            {loading
              ? // Render skeleton loaders for each menu item
                menuItems.map((_, index) => (
                  <li key={index} className="flex items-center gap-2 p-2 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                    {isOpen && (
                      <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
                    )}
                  </li>
                ))
              : // Render actual menu items
                menuItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 hover:scale-105"
                    onClick={() => router.push(item.link)}
                  >
                    {/* Icon container with black background and white border */}
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white">
                      <span className="text-white font-bold">{item.icon}</span>
                    </span>
                    {isOpen && (
                      <span className="text-white font-semibold hover:text-yellow-300">
                        {item.label}
                      </span>
                    )}
                  </li>
                ))}

            {loading ? (
              // Render skeleton loader for logout button
              <li className="flex items-center gap-3 p-3 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
                {isOpen && (
                  <div className="w-24 h-4 bg-gray-700 rounded animate-pulse" />
                )}
              </li>
            ) : (
              // Render actual logout button
              <motion.button
  onClick={handleLogout}
  whileHover={{ scale: 1.1, rotate: 3 }} // Animation on hover
  className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full text-white transition duration-200"
>
  {/* Icon container with black background and white border */}
  <span className="flex items-center justify-center w-10 h-10 rounded-full bg-black border border-white">
    <FiLogOut className="text-white text-lg font-bold" />
  </span>
  {/* Logout text (visible only when sidebar is open) */}
  {isOpen && (
    <span className="text-white text-lg font-semibold hover:text-yellow-300">
      Logout
    </span>
  )}
</motion.button>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Sidebar;