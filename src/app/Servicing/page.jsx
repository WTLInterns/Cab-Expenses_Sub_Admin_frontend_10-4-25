"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../slidebar/page";

const CabService = () => {
  const [cabs, setCabs] = useState([]);
  const [error, setError] = useState(null);

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
        setCabs(data.data);
      } catch (error) {
        setError(error.message);
        console.error("Error fetching cab data:", error);
      }
    };

    fetchCabs();
  }, []);

  const handleForwardForServicing = async (cabNumber) => {
    try {
      await fetch(`http://localhost:5000/api/cabs/${cabNumber}/forward-for-servicing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

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
    <div className="flex min-h-screen  bg-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content - Adjusted for sidebar width changes */}
      <div className="flex-1 md:ml-60 p-4 md:p-6 text-white mt-20 sm:mt-0   transition-all duration-300">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Cabs with Distance &gt; 10,000 KM</h1>

        {error && <p className="text-red-500 mb-4">Error: {error}</p>}

        <div className="bg-gray-700 shadow-lg rounded-lg overflow-x-auto">
          {/* Responsive table container */}
          <div className="min-w-full">
            {/* Table - Stacked on mobile, normal on larger screens */}
            <table className="w-full">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="p-2 md:p-3 border-b border-gray-600 text-left">#</th>
                  <th className="p-2 md:p-3 border-b border-gray-600 text-left">Cab Number</th>
                  <th className="p-2 md:p-3 border-b border-gray-600 text-left hidden sm:table-cell">Distance (KM)</th>
                  <th className="p-2 md:p-3 border-b border-gray-600 text-left">Status</th>
                  <th className="p-2 md:p-3 border-b border-gray-600 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cabs.length > 0 ? (
                  cabs.map((cab, index) => (
                    <tr 
                      key={cab.cabNumber} 
                      className="border-b border-gray-600 hover:bg-gray-600 transition-colors"
                    >
                      <td className="p-2 md:p-3 text-left">{index + 1}</td>
                      <td className="p-2 md:p-3 text-left font-medium">{cab.cabNumber}</td>
                      <td className="p-2 md:p-3 text-left hidden sm:table-cell">{cab.totalDistance} km</td>
                      <td className="p-2 md:p-3 text-left">
                        <span className={`font-medium ${cab.isServicing ? 'text-green-400' : 'text-red-400'}`}>
                          {cab.isServicing ? 'Forwarded' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-2 md:p-3 text-left">
                        {!cab.isServicing && (
                          <button
                            onClick={() => handleForwardForServicing(cab.cabNumber)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm md:text-base px-3 py-1 md:px-4 md:py-2 rounded transition-all"
                          >
                            Forward
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

        {/* Mobile cards view (hidden on larger screens) */}
        <div className="mt-4 sm:hidden space-y-3">
          {cabs.length > 0 ? (
            cabs.map((cab, index) => (
              <div key={cab.cabNumber} className="bg-gray-700 p-3 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">{cab.cabNumber}</p>
                    <p className="text-gray-300">{cab.totalDistance} km</p>
                  </div>
                  <span className={`text-sm ${cab.isServicing ? 'text-green-400' : 'text-red-400'}`}>
                    {cab.isServicing ? 'Forwarded' : 'Pending'}
                  </span>
                </div>
                {!cab.isServicing && (
                  <button
                    onClick={() => handleForwardForServicing(cab.cabNumber)}
                    className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded transition-all"
                  >
                    Forward for Servicing
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-white">
              No cabs found with kilometers &gt; 10,000
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CabService;