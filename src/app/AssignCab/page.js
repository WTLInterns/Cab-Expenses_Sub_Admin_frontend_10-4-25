"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../slidebar/page";
import { motion } from "framer-motion";

const AssignCab = () => {
    const [drivers, setDrivers] = useState([]);
    const [cabs, setCabs] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState("");
    const [selectedCab, setSelectedCab] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setMessage("⚠️ Authentication token missing.");
                    return;
                }

                const [driversRes, cabsRes] = await Promise.all([
                    axios.get("http://localhost:5000/api/driver/profile", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get("http://localhost:5000/api/cabs", {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setDrivers(driversRes.data || []);
                setCabs(cabsRes.data || []);
            } catch (error) {
                console.error("Error fetching data:", error);
                setMessage("❌ Failed to load drivers and cabs.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleAssign = async () => {
        if (!selectedDriver || !selectedCab) {
            setMessage("⚠️ Please select both driver and cab.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const assignedBy = localStorage.getItem("id");

            if (!token || !assignedBy) {
                setMessage("⚠️ Authentication failed. Please log in again.");
                return;
            }

            const response = await axios.post(
                "http://localhost:5000/api/assigncab/",
                {
                    driverId: selectedDriver,
                    cabNumber: selectedCab,
                    assignedBy,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMessage("✅ Cab assigned successfully!");
            setSelectedDriver("");
            setSelectedCab("");

            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error assigning cab:", error.response?.data || error);
            setMessage(`❌ ${error.response?.data?.message || "Error assigning cab."}`);
        }
    };

    return (
        <motion.div 
            className="bg-gradient-to-r from-gray-900 flex min-h-screen text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            <Sidebar />
            <div className="flex-1 flex flex-col justify-center items-center p-6">
                <motion.div 
                    className="bg-gray-800 border border-[#00000] hover:border hover:border-blue-400 rounded-lg p-8 w-full max-w-2xl shadow-2xl"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="text-2xl font-bold text-center text-white mb-6"> Assign Cab</h2>
                    {loading ? (
                        <p className="text-center text-gray-300">Loading...</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block font-semibold mb-1 text-white "> Driver:</label>
                                    <select
                                        className="border p-3 w-full bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#143D60]"
                                        value={selectedDriver}
                                        onChange={(e) => setSelectedDriver(e.target.value)}
                                    >
                                        <option value="">Choose Driver</option>
                                        {drivers.length > 0 ? (
                                            drivers.map((driver) => (
                                                <option key={driver._id} value={driver._id}>
                                                    {driver.name} - {driver.licenseNumber}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No drivers available</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-semibold mb-1 text-white "> Cab:</label>
                                    <select
                                        className="border p-3 w-full bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-[#143D60]"
                                        value={selectedCab}
                                        onChange={(e) => setSelectedCab(e.target.value)}
                                    >
                                        <option value="">Choose Cab</option>
                                        {cabs.length > 0 ? (
                                            cabs.map((cab) => (
                                                <option key={cab._id} value={cab._id}>
                                                    {cab.cabNumber} - {cab.model}
                                                </option>
                                            ))
                                        ) : (
                                            <option disabled>No cabs available</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleAssign}
                                className=" w-full jsx-ec59cb17e9a40e66 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all duration-300"
                            >
                                 Assign Cab
                            </button>
                            {message && (
                                <p className="mt-4 text-center font-semibold text-lg text-[#143D60]">
                                    {message}
                                </p>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AssignCab;