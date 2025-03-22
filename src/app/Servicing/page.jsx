"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../slidebar/page";

const CabService = () => {
  const [cabs, setCabs] = useState([]);
  const [error, setError] = useState(null);

  // ✅ Fetch Cabs with Total Distance > 10,000 KM from Backend
  useEffect(() => {
    const fetchCabs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/cabs/list", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setCabs(data.data); // ✅ Use API response directly
      } catch (error) {
        setError(error.message);
        console.error("Error fetching cab data:", error);
      }
    };

    fetchCabs();
  }, []);

  // ✅ Forward Cab for Servicing
  const handleForwardForServicing = async (cabNumber) => {
    try {
      await fetch(`http://localhost:5000/api/cabs/${cabNumber}/forward-for-servicing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      // ✅ Update the local state to reflect the change
      setCabs((prevCabs) =>
        prevCabs.map((cab) =>
          cab.cabNumber === cabNumber ? { ...cab, isServicing: true } : cab
        )
      );

      alert("Cab forwarded for servicing successfully!");
    } catch (error) {
      console.error("Error forwarding cab for servicing:", error);
      alert("Failed to forward cab for servicing");
    }
  };

  return (
    <div className="flex h-screen bg-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-4 text-white">Cabs with Distance &gt; 10,000 KM</h1>

        {error && <p className="text-red-600 mb-4">Error: {error}</p>}

        <div className="bg-gray-700 shadow-lg rounded-lg p-4 overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-800 text-white">
                <th className="p-3 border bg-gray-600">#</th>
                <th className="p-3 border bg-gray-600">Cab Number</th>
                <th className="p-3 border bg-gray-600">Total Distance (KM)</th>
                <th className="p-3 border bg-gray-600">Servicing Status</th>
                <th className="p-3 border bg-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cabs.length > 0 ? (
                cabs.map((cab, index) => (
                  <tr key={cab.cabNumber} className="text-gray-800 bg-gray-100 hover:bg-gray-200">
                    <td className="p-3 border text-center">{index + 1}</td>
                    <td className="p-3 border">{cab.cabNumber}</td>
                    <td className="p-3 border">{cab.totalDistance} km</td>
                    <td className="p-3 border">
                      {cab.isServicing ? (
                        <span className="text-green-500 font-bold">Forwarded</span>
                      ) : (
                        <span className="text-red-500 font-bold">Not Forwarded</span>
                      )}
                    </td>
                    <td className="p-3 border text-center">
                      {!cab.isServicing && (
                        <button
                          onClick={() => handleForwardForServicing(cab.cabNumber)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-all duration-300"
                        >
                          Forward for Servicing
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-white">
                    No cabs found with kilometers &gt; 10,000
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CabService;