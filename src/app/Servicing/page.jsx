"use client";

import { useState, useEffect } from "react";
import Sidebar from "../slidebar/page";
import axios from "axios";
import { motion } from "framer-motion";

export default function CabService() {
  const [drivers, setDrivers] = useState([]);
  const [cabs, setCabs] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedCab, setSelectedCab] = useState("");
  const [message, setMessage] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptImage, setReceiptImage] = useState("");

  const token = typeof window !== "undefined" && localStorage.getItem("token");
  const assignedBy = typeof window !== "undefined" && localStorage.getItem("id");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [driversRes, cabsRes, servicesRes] = await Promise.all([
        axios.get("http://localhost:5000/api/driver/profile", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/cabDetails", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/servicing/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setDrivers(driversRes.data);
      setCabs(cabsRes.data);
      setServices(servicesRes.data.services);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const handleAssignServicing = async () => {
    if (!selectedCab || !selectedDriver) {
      return alert("Select both cab and driver.");
    }

    try {
      await axios.post(
        "http://localhost:5000/api/servicing/assign",
        {
          cabId: selectedCab,
          driverId: selectedDriver,
          assignedBy,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Servicing assigned successfully");
      setShowAssignModal(false);
      setSelectedCab("");
      setSelectedDriver("");
      fetchInitialData(); // refresh list
    } catch (error) {
      console.error("Error assigning servicing:", error);
      alert("Failed to assign servicing.");
    }
  };

  return (
    <div className="flex bg-gray-900 min-h-screen text-white">
      <Sidebar />
      <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Servicing Assignments</h2>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Assign Servicing
          </button>
        </div>

        {/* ✅ Servicing Data Table */}
        <div className="bg-gray-800 rounded shadow p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700 text-white">
                <th className="p-2">#</th>
                <th className="p-2">Cab No</th>
                <th className="p-2">Driver</th>
                <th className="p-2">Status</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv, i) => (
                <tr key={srv._id} className="text-center border-b border-gray-600">
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2">{srv?.cab?.cabNumber}</td>
                  <td className="p-2">{srv?.driver?.name}</td>
                  <td className="p-2 capitalize">{srv.status}</td>
                  <td className="p-2">{srv.servicingAmount ? `₹${srv.servicingAmount}` : "-"}</td>
                  <td className="p-2">
                    {srv.receiptImage ? (
                      <button
                        onClick={() => {
                          setReceiptImage(srv.receiptImage);
                          setShowReceiptModal(true);
                        }}
                        className="text-blue-400 underline hover:text-blue-300"
                      >
                        View
                      </button>
                    ) : (
                      "-"
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ✅ Assign Servicing Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-gradient-to-b bg-black/50 to-transparent backdrop-blur-md bg-opacity-50 flex justify-center items-center z-50 p-4">
            <motion.div
              className="bg-gray-800 p-6 rounded-lg w-full max-w-md"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-lg font-bold mb-4">Assign Servicing</h3>

              <label className="block mb-2">Select Driver:</label>
              <select
                className="w-full p-2 mb-4 rounded bg-gray-700"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
              >
                <option value="">-- Select Driver --</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name}
                  </option>
                ))}
              </select>

              <label className="block mb-2">Select Cab:</label>
              <select
                className="w-full p-2 mb-4 rounded bg-gray-700"
                value={selectedCab}
                onChange={(e) => setSelectedCab(e.target.value)}
              >
                <option value="">-- Select Cab --</option>
                {cabs.map((cab) => (
                  <option key={cab._id} value={cab._id}>
                    {cab.cabNumber}
                  </option>
                ))}
              </select>

              <div className="flex justify-between gap-3">
                <button
                  onClick={handleAssignServicing}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 w-full"
                >
                  Assign
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showReceiptModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
            <div className="bg-white p-4 rounded-lg shadow-lg relative w-full max-w-md">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Receipt Image</h3>
              <img
                src={receiptImage}
                alt="Receipt"
                className="w-full h-auto rounded border"
              />
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setReceiptImage("");
                }}
                className="absolute top-2 right-2 text-red-500 text-xl font-bold hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
