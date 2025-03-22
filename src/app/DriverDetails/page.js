'use client';

import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import Sidebar from '../slidebar/page';
import Image from 'next/image';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

export default function Driver() {
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/driver/profile',
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        setDrivers(res.data);
      } catch (error) {
        console.error('Error fetching driver data:', error);
        toast.error('Failed to fetch driver data.');
      }
    };

    fetchData();
  }, []);

  const handleEdit = (driver) => {
    setFormData({ ...driver });
    setIsEditMode(true);
    setSelectedDriver(driver);
    setErrors({});


  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await axios.delete(`http://localhost:5000/api/driver/profile/${id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        setDrivers(drivers.filter((driver) => driver._id !== id));
        toast.success('Driver deleted successfully!');
      } catch (error) {
        console.error('Error deleting driver:', error);
        toast.error('Failed to delete driver.');
      }
    }
  };

  // const validateForm = () => {
  //   let tempErrors = {};

  //   if (!formData.email?.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
  //     tempErrors.email = 'Invalid email format';
  //   }
  //   if (!formData.adharNo?.match(/^\d{4} \d{4} \d{4}$/)) {
  //     tempErrors.adharNo = 'Aadhar must be in format: 1234 5678 9012';
  //   }
  //   if (!formData.phone?.match(/^\d{10}$/)) {
  //     tempErrors.phone = 'Contact must be 10 digits';
  //   }

  //   setErrors(tempErrors);
  //   return Object.keys(tempErrors).length === 0;
  // };

  const handleSubmit = async () => {
    // if (!validateForm()) return;

    try {
      await axios.put(`http://localhost:5000/api/driver/profile/${formData._id}`, formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      setDrivers((prevDrivers) =>
        prevDrivers.map((d) => (d._id === formData._id ? formData : d))
      );
      setIsEditMode(false);
      setSelectedDriver(null);
      toast.success('Driver details updated successfully!');
    } catch (error) {
      console.error('Error updating driver:', error);
      toast.error('Failed to update driver.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 bg-gray-800">
        <ToastContainer />
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-white">Driver Details</h1>

        <div className="overflow-x-auto border-white  shadow-lg rounded-lg bg-gray-600">
          <table className="min-w-full table-auto border-collapse ">
            <thead className="bg-gray-700 text-white ">
              <tr>
                <th className=" p-3" >Image</th>
                <th className="  p-3">Driver Name</th>
                <th className="  p-3">Email</th>
                <th className="  p-3">Aadhar No</th>
                <th className="  p-3">Driving License</th>
                <th className="  p-3">Contact</th>
                <th className="  p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver._id} className="border-white hover:bg-gray-700 transition-all">
                  <td className="p-3 text-center  ">
                    <Image
                      src={driver.profileImage || "/images/default-driver.jpg"}
                      alt="Driver"
                      width={50}
                      height={50}
                      className="rounded-full object-cover mx-auto"
                      unoptimized
                    />
                  </td>
                  <td className=" p-3 text-white">{driver.name}</td>
                  <td className=" p-3 text-white">{driver.email}</td>
                  <td className=" p-3 text-white">{driver.adharNo}</td>
                  <td className=" p-3 text-white">{driver.licenseNo}</td>
                  <td className=" p-3 text-white">{driver.phone}</td>
                  <td className=" p-3 text-white text-center">
                    <button onClick={() => handleEdit(driver)} className="text-yellow-500 hover:text-yellow-700 mx-2">
                      <FiEdit size={20} />
                    </button>
                    <button onClick={() => handleDelete(driver._id)} className="text-red-500 hover:text-red-700 mx-2">
                      <FiTrash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isEditMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-gray-800 text-white rounded-md w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-300 hover:text-white transition-all duration-300"
              onClick={() => setIsEditMode(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-semibold mb-4">Edit Driver</h2>
            <div className="space-y-4">
              {[
                { label: "Driver Name", field: "name" },
                { label: "Email", field: "email", type: "email" },
                { label: "Aadhar No", field: "adharNo" },
                { label: "Driving License", field: "licenseNo", disabled: true },
                { label: "Contact", field: "phone" },
              ].map(({ label, field, type = "text", disabled = false }) => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1">{label}</label>
                  <input
                    type={type}
                    value={formData[field] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field]: e.target.value })
                    }
                    className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white transition-all duration-300 hover:scale-105"
                    disabled={disabled}
                  />
                  {errors[field] && <p className="text-red-500">{errors[field]}</p>}
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsEditMode(false)}
                className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
        
        )}
      </div>
    </div>
  );
}
