'use client';

import { useState, useEffect } from 'react';
import Sidebar from '../slidebar/page';
import axios from 'axios';

const CabSearch = () => {
  const [cabNumber, setCabNumber] = useState('');
  const [cabDetails, setCabDetails] = useState([]);
  const [filteredCabs, setFilteredCabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeModal, setActiveModal] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    const fetchAssignedCabs = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/assigncab', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
        });
        setCabDetails(res.data);
        setFilteredCabs(res.data);
      } catch (err) {
        setError('Failed to fetch assigned cabs');
        setCabDetails([]);
        setFilteredCabs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedCabs();
  }, []);

  const handleSearch = () => {
    setError(null);
    if (!cabNumber) {
      setError('Please enter a cab number');
      return;
    }

    const filtered = cabDetails.filter((item) =>
      item.cab?.cabNumber?.toLowerCase().includes(cabNumber.toLowerCase())
    );

    setFilteredCabs(filtered);
    if (filtered.length === 0) setError('Cab details not found');
  };

  const handleDateFilter = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError('To date must be after From date');
      return;
    }

    const filtered = cabDetails.filter((item) => {
      const assignedDate = new Date(item.assignedAt).toISOString().split('T')[0];
      const startDate = fromDate || '1970-01-01';
      const endDate = toDate || '2100-01-01';

      return assignedDate >= startDate && assignedDate <= endDate;
    });

    setFilteredCabs(filtered);
    if (filtered.length === 0) setError('No cabs found in the selected date range');
  };

  const openModal = (type, data) => {
    setSelectedDetail({ type, data });
    setActiveModal('Details');
  };

  const closeModal = () => {
    setActiveModal('');
    setSelectedDetail(null);
  };

  return (
    <div className="flex min-h-screen  bg-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-20 sm:mt-0 text-white  transition-all duration-300">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Cab Search</h1>

        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search by Cab Number */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter Cab Number"
              value={cabNumber}
              onChange={(e) => setCabNumber(e.target.value)}
              className="border p-2 rounded w-full text-white"
            />
            <button
              onClick={handleSearch}
              className="bg-indigo-600  hover:bg-indigo-700 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Filter by Date */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex flex-col sm:flex-row gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border p-2 rounded text-white w-full"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border p-2 rounded text-white w-full"
              />
            </div>
            <button 
              onClick={handleDateFilter} 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
            >
              Filter by Date
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Loading State */}
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-700 h-16 rounded-md"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-gray-700 shadow-lg rounded-lg overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Cab No</th>
                    <th className="p-3 text-left">Driver</th>
                    <th className="p-3 text-left">Assigned Date</th>
                    <th className="p-3 text-left">Route</th>
                    <th className="p-3 text-left">Distance</th>
                    <th className="p-3 text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCabs.length > 0 ? (
                    filteredCabs.map((item, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-600 transition-colors">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">{item.cab?.cabNumber || 'N/A'}</td>
                        <td className="p-3">{item.driver?.name || 'N/A'}</td>
                        <td className="p-3">{item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : 'N/A'}</td>
                        <td className="p-3">{item.cab?.location?.from || 'N/A'} → {item.cab?.location?.to || 'N/A'}</td>
                        <td className="p-3">{item.cab?.location?.totalDistance || '0'} KM</td>
                        <td className="p-3">
                          <select
                            className="border p-1 rounded bg-gray-800 text-white"
                            onChange={(e) => e.target.value && openModal(e.target.value, item.cab[e.target.value])}
                          >
                            <option value="">Select</option>
                            <option value="fuel">Fuel</option>
                            <option value="fastTag">FastTag</option>
                            <option value="tyrePuncture">Tyre</option>
                            <option value="vehicleServicing">Servicing</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="p-4 text-center">No results found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {filteredCabs.length > 0 ? (
                filteredCabs.map((item, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg shadow">
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-gray-400 text-sm">Cab No</p>
                        <p className="font-medium">{item.cab?.cabNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Driver</p>
                        <p>{item.driver?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Assigned Date</p>
                        <p>{item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Distance</p>
                        <p>{item.cab?.location?.totalDistance || '0'} KM</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm">Route</p>
                      <p>{item.cab?.location?.from || 'N/A'} → {item.cab?.location?.to || 'N/A'}</p>
                    </div>
                    <select
                      className="w-full border p-2 rounded bg-gray-800 text-white mb-2"
                      onChange={(e) => e.target.value && openModal(e.target.value, item.cab[e.target.value])}
                    >
                      <option value="">View Details</option>
                      <option value="fuel">Fuel Details</option>
                      <option value="fastTag">FastTag Details</option>
                      <option value="tyrePuncture">Tyre Details</option>
                      <option value="vehicleServicing">Servicing Details</option>
                    </select>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-gray-700 rounded-lg">
                  No results found
                </div>
              )}
            </div>
          </>
        )}

        {/* Details Modal */}
        {activeModal && selectedDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 capitalize">{selectedDetail.type} Details</h2>

              {typeof selectedDetail.data === 'object' ? (
                <div className="space-y-3">
                  {Object.entries(selectedDetail.data).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-700 pb-2">
                      <p className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</p>
                      {typeof value === 'string' && value.match(/\.(jpeg|jpg|gif|png)$/) ? (
                        <div className="mt-2">
                          <img
                            src={value} 
                            alt={key} 
                            className="w-full h-auto rounded border border-gray-600" 
                          />
                        </div>
                      ) : (
                        <p className="text-white break-words">{value || 'N/A'}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white">No details available.</p>
              )}

              <button 
                onClick={closeModal}
                className="w-full mt-4 bg-indigo-600  hover:bg-indigo-700 text-white py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


export default CabSearch;