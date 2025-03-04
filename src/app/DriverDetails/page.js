'use client';

import { useState } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Sidebar from '../slidebar/page';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Driver() {
  const [drivers, setDrivers] = useState([
    {
      id: 1,
      image: '/images/driver1.jpg',
      name: 'John Doe',
      email: 'johndoe@example.com',
      aadharNo: '1234 5678 9012',
      drivingLicense: 'DL1234567890',
      vehicleNo: 'MH 12 AB 1234',
      contact: '9876543210',
    },
    {
      id: 2,
      image: '/images/driver2.jpg',
      name: 'Jane Smith',
      email: 'janesmith@example.com',
      aadharNo: '9876 5432 1098',
      drivingLicense: 'DL0987654321',
      vehicleNo: 'MH 34 CD 5678',
      contact: '9876543211',
    },
  ]);

  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleEdit = (driver) => {
    setFormData({ ...driver });
    setIsEditMode(true);
    setSelectedDriver(driver);
    setErrors({});
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      setDrivers(drivers.filter((driver) => driver.id !== id));
      toast.success('Driver deleted successfully!');
    }
  };

  const validateForm = () => {
    let tempErrors = {};

    if (!formData.email || !formData.email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      tempErrors.email = 'Invalid email format';
    }
    if (!formData.aadharNo || !formData.aadharNo.match(/^\d{4} \d{4} \d{4}$/)) {
      tempErrors.aadharNo = 'Aadhar must be in format: 1234 5678 9012';
    }
    if (!formData.vehicleNo || !formData.vehicleNo.match(/^[A-Z]{2} \d{2} [A-Z]{2} \d{4}$/)) {
      tempErrors.vehicleNo = 'Invalid vehicle number format (e.g., MH 12 AB 1234)';
    }
    if (!formData.contact || !formData.contact.match(/^\d{10}$/)) {
      tempErrors.contact = 'Contact must be 10 digits';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    setDrivers((prevDrivers) =>
      prevDrivers.map((d) => (d.id === formData.id ? formData : d))
    );
    setIsEditMode(false);
    setSelectedDriver(null);
    toast.success('Driver details updated successfully!');
  };

  return (
    /* 
      We removed "flex-col md:flex-row min-h-screen" 
      and replaced it with "flex min-h-screen". 
      This pins the sidebar on the left, and content on the right. 
    */
    <div className="flex min-h-screen">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6">
        <ToastContainer />
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6">
          Driver Details
        </h1>

        {/* Single Table for All Screens */}
        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="border p-3 whitespace-nowrap">Image</th>
                <th className="border p-3 whitespace-nowrap">Driver Name</th>
                <th className="border p-3 whitespace-nowrap">Email</th>
                <th className="border p-3 whitespace-nowrap">Aadhar No</th>
                <th className="border p-3 whitespace-nowrap">Driving License</th>
                <th className="border p-3 whitespace-nowrap">Vehicle No</th>
                <th className="border p-3 whitespace-nowrap">Contact</th>
                <th className="border p-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr
                  key={driver.id}
                  className="border-b hover:bg-gray-100 transition-all"
                >
                  <td className="border p-3 text-center">
                    <Image
                      src={driver.image}
                      alt="Driver"
                      width={50}
                      height={50}
                      className="rounded-full object-cover mx-auto"
                    />
                  </td>
                  <td className="border p-3 whitespace-nowrap">{driver.name}</td>
                  <td className="border p-3 whitespace-nowrap">{driver.email}</td>
                  <td className="border p-3 whitespace-nowrap">{driver.aadharNo}</td>
                  <td className="border p-3 whitespace-nowrap">{driver.drivingLicense}</td>
                  <td className="border p-3 whitespace-nowrap">{driver.vehicleNo}</td>
                  <td className="border p-3 whitespace-nowrap">{driver.contact}</td>
                  <td className="border p-3 text-center">
                    <button
                      onClick={() => handleEdit(driver)}
                      className="text-yellow-500 hover:text-yellow-700 mx-2"
                    >
                      <FiEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="text-red-500 hover:text-red-700 mx-2"
                    >
                      <FiTrash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {selectedDriver && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4 z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Driver</h2>

              <label className="font-semibold">Driving License</label>
              <input
                type="text"
                value={formData.drivingLicense}
                disabled
                className="border p-2 rounded w-full mb-2"
              />

              <label className="font-semibold">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border p-2 rounded w-full mb-2"
              />
              {errors.email && <p className="text-red-500">{errors.email}</p>}

              <label className="font-semibold">Aadhar No</label>
              <input
                type="text"
                value={formData.aadharNo}
                onChange={(e) =>
                  setFormData({ ...formData, aadharNo: e.target.value })
                }
                className="border p-2 rounded w-full mb-2"
              />
              {errors.aadharNo && <p className="text-red-500">{errors.aadharNo}</p>}

              <label className="font-semibold">Vehicle No</label>
              <input
                type="text"
                value={formData.vehicleNo}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleNo: e.target.value })
                }
                className="border p-2 rounded w-full mb-2"
              />
              {errors.vehicleNo && <p className="text-red-500">{errors.vehicleNo}</p>}

              <label className="font-semibold">Contact</label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className="border p-2 rounded w-full mb-2"
              />
              {errors.contact && <p className="text-red-500">{errors.contact}</p>}

              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
