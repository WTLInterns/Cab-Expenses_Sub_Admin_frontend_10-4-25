"use client"

import { useState, useEffect } from "react"
import {
  FiEdit,
  FiTrash2,
  FiUserPlus,
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiCreditCard,
  FiFileText,
  FiImage,
  FiX,
} from "react-icons/fi"
import Sidebar from "../slidebar/page"
import Image from "next/image"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import axios from "axios"
import { motion } from "framer-motion"

export default function Driver() {
  // Driver list state
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    adharNo: "",
    licenseNo: "",
    phone: "",
  })
  const [errors, setErrors] = useState({})

  // Add driver form state
  const [addDriverFormData, setAddDriverFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    licenseNo: "",
    adharNo: "",
    addedBy: "",
  })
  const [profileImage, setProfileImage] = useState(null)
  const [addDriverErrors, setAddDriverErrors] = useState({})
  const [addDriverLoading, setAddDriverLoading] = useState(false)

  useEffect(() => {
    fetchDrivers()

    // Set admin ID for add driver form
    const adminId = localStorage.getItem("id")
    if (adminId) {
      setAddDriverFormData((prev) => ({ ...prev, addedBy: adminId }))
    }
  }, [])

  const fetchDrivers = async () => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast.error("Authentication token missing!")
      return
    }

    try {
      setLoading(true)
      const res = await axios.get("http://localhost:5000/api/driver/profile", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setDrivers(res.data)
    } catch (error) {
      console.error("Error fetching driver data:", error)
      toast.error("Failed to fetch driver data.")
    } finally {
      setLoading(false)
    }
  }

  // Edit driver handlers
  const handleEdit = (driver) => {
    setEditFormData({ ...driver })
    setIsEditMode(true)
    setSelectedDriver(driver)
    setErrors({})
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return

    try {
      await axios.delete(`http://localhost:5000/api/driver/profile/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      setDrivers((prevDrivers) => prevDrivers.filter((driver) => driver._id !== id))
      toast.success("Driver deleted successfully!")
    } catch (error) {
      console.error("Error deleting driver:", error)
      toast.error("Failed to delete driver.")
    }
  }

  const handleEditSubmit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/driver/profile/${editFormData._id}`, editFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })

      setDrivers((prevDrivers) => prevDrivers.map((d) => (d._id === editFormData._id ? editFormData : d)))

      setIsEditMode(false)
      setSelectedDriver(null)
      toast.success("Driver details updated successfully!")
    } catch (error) {
      console.error("Error updating driver:", error)
      toast.error("Failed to update driver.")
    }
  }

  // Add driver handlers
  const handleAddDriverChange = (e) => {
    setAddDriverFormData({ ...addDriverFormData, [e.target.name]: e.target.value })
    setAddDriverErrors({ ...addDriverErrors, [e.target.name]: "" })
  }

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0])
    setAddDriverErrors({ ...addDriverErrors, profileImage: "" })
  }

  const validateAddDriverForm = () => {
    const newErrors = {}
    if (!addDriverFormData.name.trim()) newErrors.name = "Name is required"
    if (!addDriverFormData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(addDriverFormData.email)) newErrors.email = "Invalid email format"
    if (!addDriverFormData.password.trim()) newErrors.password = "Password is required"
    else if (addDriverFormData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
    if (!addDriverFormData.phone.trim()) newErrors.phone = "Phone is required"
    else if (!/^\d{10}$/.test(addDriverFormData.phone)) newErrors.phone = "Phone must be 10 digits"
    if (!addDriverFormData.licenseNo.trim()) newErrors.licenseNo = "License No is required"
    if (!addDriverFormData.adharNo.trim()) newErrors.adharNo = "Aadhar No is required"
    if (!addDriverFormData.addedBy) newErrors.addedBy = "Admin ID is missing"
    if (!profileImage) newErrors.profileImage = "Profile image is required"

    setAddDriverErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddDriverSubmit = async (e) => {
    e.preventDefault()
    if (!validateAddDriverForm()) return

    setAddDriverLoading(true)

    try {
      const formDataToSend = new FormData()
      Object.keys(addDriverFormData).forEach((key) => {
        formDataToSend.append(key, addDriverFormData[key])
      })
      formDataToSend.append("profileImage", profileImage)

      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        body: formDataToSend,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Reset form
        setAddDriverFormData({
          name: "",
          email: "",
          password: "",
          phone: "",
          licenseNo: "",
          adharNo: "",
          addedBy: localStorage.getItem("id") || "",
        })
        setProfileImage(null)
        if (document.getElementById("fileInput")) {
          document.getElementById("fileInput").value = ""
        }

        // Close modal and refresh driver list
        setIsAddDriverModalOpen(false)
        fetchDrivers()
        toast.success("Driver added successfully!")
      } else {
        setAddDriverErrors({ apiError: data.error || "❌ Something went wrong" })
      }
    } catch (error) {
      console.error("Fetch Error:", error)
      setAddDriverErrors({ apiError: "❌ Server error, try again later" })
    } finally {
      setAddDriverLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen  bg-gray-800">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 mt-20 sm:mt-0 transition-all duration-300">
        <ToastContainer />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Driver Details</h1>
          <button
            onClick={() => setIsAddDriverModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            <FiUserPlus size={18} />
            <span className="hidden md:inline">Add Driver</span>
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-700 h-16 rounded-md"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-gray-600 shadow-lg rounded-lg overflow-x-auto">
              <table className="min-w-full table-auto border-collapse">
                <thead className="bg-gray-700 text-white">
                  <tr>
                    <th className="p-3">Image</th>
                    <th className="p-3">Driver Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Aadhar No</th>
                    <th className="p-3">License</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr key={driver._id} className="border-white hover:bg-gray-700 transition-all">
                      <td className="p-3 text-center">
                        <Image
                          src={driver.profileImage || "/images/default-driver.jpg"}
                          alt="Driver"
                          width={50}
                          height={50}
                          className="rounded-full object-cover mx-auto"
                          unoptimized
                        />
                      </td>
                      <td className="p-3 text-white">{driver.name}</td>
                      <td className="p-3 text-white">{driver.email}</td>
                      <td className="p-3 text-white">{driver.adharNo}</td>
                      <td className="p-3 text-white">{driver.licenseNo}</td>
                      <td className="p-3 text-white">{driver.phone}</td>
                      <td className="p-3 text-white text-center">
                        <button onClick={() => handleEdit(driver)} className="bg-blue-600 p-2 rounded-full mx-2">
                          <FiEdit size={20} />
                        </button>
                        <button onClick={() => handleDelete(driver._id)} className="bg-red-500 p-2 rounded-full mx-2">
                          <FiTrash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {drivers.map((driver) => (
                <div key={driver._id} className="bg-gray-700 p-4 rounded-lg shadow">
                  <div className="flex items-center space-x-4 mb-3">
                    <Image
                      src={driver.profileImage || "/images/default-driver.jpg"}
                      alt="Driver"
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                      unoptimized
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{driver.name}</h3>
                      <p className="text-gray-300">{driver.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Aadhar No</p>
                      <p className="text-white">{driver.adharNo}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">License</p>
                      <p className="text-white">{driver.licenseNo}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Contact</p>
                      <p className="text-white">{driver.phone}</p>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2 mt-3">
                    <button onClick={() => handleEdit(driver)} className="p-2 bg-blue-600 rounded-full text-white">
                      <FiEdit size={16} />
                    </button>
                    <button onClick={() => handleDelete(driver._id)} className="p-2 bg-red-600 rounded-full text-white">
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Edit Driver Modal */}
        {isEditMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-gray-800 text-white rounded-md w-full max-w-md p-6 relative">
              <button
                className="absolute top-3 right-3 text-gray-300 hover:text-white transition-all duration-300"
                onClick={() => setIsEditMode(false)}
              >
                &times;
              </button>
              <h2 className="text-xl md:text-2xl font-semibold mb-4">Edit Driver</h2>
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
                      value={editFormData[field] || ""}
                      onChange={(e) => setEditFormData({ ...editFormData, [field]: e.target.value })}
                      className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white"
                      disabled={disabled}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Driver Modal */}
        {isAddDriverModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div
              className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-3xl shadow-2xl overflow-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-700">
                <h2 className="text-2xl font-semibold text-white">Add Driver</h2>
                <button
                  onClick={() => setIsAddDriverModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="p-6">
                {addDriverErrors.apiError && (
                  <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-200">
                    {addDriverErrors.apiError}
                  </div>
                )}

                <form onSubmit={handleAddDriverSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {[
                    { name: "name", icon: FiUser, placeholder: "Name" },
                    { name: "email", icon: FiMail, placeholder: "Email", type: "email" },
                    { name: "password", icon: FiLock, placeholder: "Password", type: "password" },
                    { name: "phone", icon: FiPhone, placeholder: "Phone" },
                    { name: "licenseNo", icon: FiCreditCard, placeholder: "License No" },
                    { name: "adharNo", icon: FiFileText, placeholder: "Aadhar No" },
                  ].map((field) => (
                    <div key={field.name} className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">
                        <field.icon />
                      </span>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        placeholder={field.placeholder}
                        className="w-full p-3 pl-10 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                        onChange={handleAddDriverChange}
                        value={addDriverFormData[field.name]}
                      />
                      {addDriverErrors[field.name] && (
                        <p className="text-red-400 text-sm mt-1">{addDriverErrors[field.name]}</p>
                      )}
                    </div>
                  ))}

                  <div className="col-span-1 md:col-span-2 relative">
                    <span className="absolute left-3 top-3 text-gray-400">
                      <FiImage />
                    </span>
                    <input
                      type="file"
                      id="fileInput"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full p-3 pl-10 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-400"
                    />
                    {addDriverErrors.profileImage && (
                      <p className="text-red-400 text-sm mt-1">{addDriverErrors.profileImage}</p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddDriverModalOpen(false)}
                      className="px-4 py-2 border border-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-300"
                      disabled={addDriverLoading}
                    >
                      {addDriverLoading ? "Adding..." : "Add Driver"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

