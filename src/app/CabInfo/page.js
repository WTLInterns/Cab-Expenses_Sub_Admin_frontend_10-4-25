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

  // ✅ Fetch assigned cabs on load
  useEffect(() => {
    const fetchAssignedCabs = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/assigncab',
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        setCabDetails(res.data);
        setFilteredCabs(res.data);
        console.log(res.data)
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

  // ✅ Search by Cab Number
  const handleSearch = () => {
    setError(null);
    if (!cabNumber) {
      setError('Please enter a cab number');
      return;
    }

    const filtered = cabDetails.filter((item) =>
      item.cab.cabNumber.toLowerCase().includes(cabNumber.toLowerCase())
    );

    setFilteredCabs(filtered);
    if (filtered.length === 0) setError('Cab details not found');
  };

  // ✅ Apply Date Filter
  const handleDateFilter = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError('To date must be after From date');
      return;
    }

    const filtered = cabDetails.filter((item) => {
      const assignedDate = new Date(item.assignedAt).toISOString().split('T')[0];
      const startDate = new Date(fromDate).toISOString().split('T')[0];
      const endDate = new Date(toDate).toISOString().split('T')[0];

      return assignedDate >= startDate && assignedDate <= endDate;
    });

    setFilteredCabs(filtered);
    if (filtered.length === 0) setError('No cabs found in the selected date range');
  };

  // ✅ Open Modal
  const openModal = (type, data) => {
    setSelectedDetail({ type, data });
    setActiveModal('Details');
  };

  // ✅ Close Modal
  const closeModal = () => {
    setActiveModal('');
    setSelectedDetail(null);
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="p-6 flex-1 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold mb-4">Cab Search</h1>

        {/* ✅ Search by Cab Number */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter Cab Number"
            value={cabNumber}
            onChange={(e) => setCabNumber(e.target.value)}
            className="border p-2 rounded w-full sm:w-1/2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* ✅ Filter by Date */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border p-2 rounded"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border p-2 rounded"
          />
          <button onClick={handleDateFilter} className="bg-green-500 text-white px-4 py-2 rounded">
            Filter
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* ✅ Display Cabs */}
        <table className="w-full mt-6 border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className='p-2'>#</th>
              <th className='p-2'>Cab No</th>
              <th className='p-2'>Driver Name</th>
              <th className='p-2'>Assigned Date</th>
              <th className='p-2'>From → To</th>
              <th className='p-2'>Distance</th>
              <th className='p-2'>Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredCabs.length > 0 ? (
              filteredCabs.map((item, index) => (
                <tr key={index} className="border-b text-center bg-gray-600">
                  <td className='p-2'>{index + 1}</td>
                  <td className='p-2'>{item?.cab?.cabNumber}</td>
                  <td className='p-2'>{item?.driver?.name}</td>
                  <td className='p-2'>{new Date(item?.assignedAt).toLocaleDateString()}</td>
                  <td className='p-2'>{item.cab.location.from} → {item.cab.location.to}</td>
                  <td className='p-2'>{item.cab.location.totalDistance} KM</td>
                  <td className='p-2'>
                    <select
                      className="border p-1 rounded bg-gray-600"
                      onChange={(e) => openModal(e.target.value, item.cab[e.target.value])}
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
                <td colSpan="7" className="text-center p-4">No results found</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Modal for Showing Details */}
        {activeModal && selectedDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-lg font-bold mb-4">{selectedDetail.type} Details</h2>

              {typeof selectedDetail.data === 'object' ? (
                <div className="space-y-2">
                  {Object.entries(selectedDetail.data).map(([key, value]) => (
                    <div key={key} className="border-b pb-2">
                      <strong className="capitalize">{key}:</strong>
                      {typeof value === 'string' && (value.includes('.jpg') || value.includes('.png')) ? (
                        <img src={value} alt={key} className="mt-2 w-full h-40 object-cover rounded" />
                      ) : (
                        <span className="ml-2">{value}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No details available.</p>
              )}

              <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 rounded mt-4 w-full">
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