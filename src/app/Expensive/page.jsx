"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../slidebar/page";

const CabExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // ✅ Fetch expenses (All or Filtered)
  const fetchExpenses = async (cabNumber = "") => {
    try {
      const url = cabNumber
        ? `http://localhost:5000/api/cabs/cabExpensive?cabNumber=${cabNumber}`
        : `http://localhost:5000/api/cabs/cabExpensive`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      console.log(data);
      if (response.ok) {
        setExpenses(data.data);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  useEffect(() => {
    fetchExpenses(); // Fetch all expenses on mount
  }, []);

  // ✅ Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    fetchExpenses(searchQuery.trim());
  };

  return (
    <div className="flex bg-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="p-6 flex-1 text-white">
        <h1 className="text-2xl font-bold mb-4">Cab Expenses</h1>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Cab Number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border p-2 rounded w-64"
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Search
          </button>
        </form>

        {/* Expenses Table */}
        <div className="bg-gray-600 shadow-lg rounded-lg p-4 overflow-x-auto  ">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden  ">
            <thead>
              <tr className="bg-gray-700 text-white ">
                <th className="p-3 border">Cab Number</th>
                <th className="p-3 border">Breakdown</th>
                <th className="p-3 border">Total Expense (₹)</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length > 0 ? (
                expenses.map((cab) => (
                  <tr key={cab.cabNumber} className="text-white bg-gray-600 hover:bg-gray-500">
                    <td className="p-3 border">{cab.cabNumber}</td>
                    <td className="p-3 border text-sm">
                      <ul>
                        <li>Fuel: ₹{cab.breakdown?.fuel || 0}</li>
                        <li>FastTag: ₹{cab.breakdown?.fastTag || 0}</li>
                        <li>Tyre Repair: ₹{cab.breakdown?.tyrePuncture || 0}</li>
                        <li>Other: ₹{cab.breakdown?.otherProblems || 0}</li>
                      </ul>
                    </td>
                    <td className="p-3 border">₹{cab.totalExpense}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-4 text-center text-gray-600">
                    No expenses found
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

export default CabExpenses;