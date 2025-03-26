

"use client";

import { useState, useEffect } from "react";
import Sidebar from "../slidebar/page";
import { FiUser, FiMail, FiLock, FiPhone, FiCreditCard, FiFileText, FiImage } from "react-icons/fi";
import { motion } from "framer-motion";

const AddDriver = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        licenseNo: "",
        adharNo: "",
        addedBy: "",
    });

    const [profileImage, setProfileImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [newDriver, setNewDriver] = useState(null);

    useEffect(() => {
        const adminId = localStorage.getItem("id");
        if (adminId) {
            setFormData((prev) => ({ ...prev, addedBy: adminId }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleImageChange = (e) => {
        setProfileImage(e.target.files[0]);
        setErrors({ ...errors, profileImage: "" });
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.password.trim()) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Phone must be 10 digits";
        if (!formData.licenseNo.trim()) newErrors.licenseNo = "License No is required";
        if (!formData.adharNo.trim()) newErrors.adharNo = "Aadhar No is required";
        if (!formData.addedBy) newErrors.addedBy = "Admin ID is missing";
        if (!profileImage) newErrors.profileImage = "Profile image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setSuccess("");

        try {
            const formDataToSend = new FormData();
            Object.keys(formData).forEach((key) => {
                formDataToSend.append(key, formData[key]);
            });
            formDataToSend.append("profileImage", profileImage);

            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                body: formDataToSend,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await response.json();

            console.log("API Response:", data);

            if (response.ok) {
                setSuccess("✅ Driver added successfully!");
                setFormData({
                    name: "",
                    email: "",
                    password: "",
                    phone: "",
                    licenseNo: "",
                    adharNo: "",
                    addedBy: localStorage.getItem("id") || "",
                });
                setProfileImage(null);
                document.getElementById("fileInput").value = "";
            } else {
                setErrors({ apiError: data.error || "❌ Something went wrong" });
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            setErrors({ apiError: "❌ Server error, try again later" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="flex min-h-screen bg-gradient-to-r from-gray-900 text-white"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.8 }}
        >
            <Sidebar />
            <div className="flex flex-1 bg-gray-800 justify-center items-center p-6">
                <motion.div 
                    className="  border border-[#00000] hover:border hover:border-blue-400 rounded-lg p-8 w-full max-w-3xl shadow-2xl"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-3xl font-semibold text-center text-white mb-6">Add Driver</h2>
                    {success && <p className="text-green-500 text-center mb-4">{success}</p>}
                    {errors.apiError && <p className="text-red-500 text-center mb-4">{errors.apiError}</p>}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
    {["name", "email", "password", "phone", "licenseNo", "adharNo"].map((field, index) => (
        <div key={index} className="relative">
            <span className="absolute left-3 top-3 text-gray-400">
                {field === "name" && <FiUser />}
                {field === "email" && <FiMail />}
                {field === "password" && <FiLock />}
                {field === "phone" && <FiPhone />}
                {field === "licenseNo" && <FiCreditCard />}
                {field === "adharNo" && <FiFileText />}
            </span>
            <input
                type={field === "password" ? "password" : "text"}
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="w-full p-3 pl-10 bg-gray-700 text-white border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-400"
                onChange={handleChange}
                value={formData[field]}
            />
            {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
        </div>
    ))}

    <div className="col-span-1 md:col-span-2 relative">
        <span className="absolute left-3 top-3 text-gray-400"><FiImage /></span>
        <input
            type="file"
            id="fileInput"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 pl-10 bg-gray-700 text-white border border-gray-500 rounded-lg focus:ring-2 focus:ring-purple-400"
        />
    </div>

    <button 
        type="submit" 
        className="w-full col-span-1 md:col-span-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-300 mt-1" 
        disabled={loading}
    >
        {loading ? "Adding..." : "Add Driver"}
    </button>
</form>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AddDriver;

