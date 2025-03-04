
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiMenu, FiUser, FiTruck, FiLogOut } from 'react-icons/fi';
import { toast } from 'react-toastify'; // import toast, but NOT ToastContainer
import 'react-toastify/dist/ReactToastify.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    toast.success('Logout successful! Redirecting to login...');
    setTimeout(() => {
      router.push('/components/login');
    }, 2000);
  };

  return (
    <div
      className={`bg-gray-800 text-white min-h-screen transition-all duration-300 flex flex-col ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* REMOVED the ToastContainer here */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-white mb-4 text-2xl focus:outline-none p-2"
      >
        <FiMenu />
      </button>

      <ul className="space-y-4 px-2">
        <li
          className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer"
          onClick={() => router.push('/DriverDetails')}
        >
          <FiUser /> {isOpen && 'Driver details'}
        </li>
        <li
          className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer"
          onClick={() => router.push('/CabInfo')}
        >
          <FiTruck /> {isOpen && 'View Cab'}
        </li>
        <li
          className="flex items-center gap-2 p-2 hover:bg-red-600 rounded cursor-pointer"
          onClick={handleLogout}
        >
          <FiLogOut /> {isOpen && 'Logout'}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

