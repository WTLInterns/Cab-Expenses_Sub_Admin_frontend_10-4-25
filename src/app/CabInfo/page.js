'use client';

import { useState } from 'react';
import Sidebar from '../slidebar/page';
import Image from 'next/image';

const CabSearch = () => {
  const [cabNumber, setCabNumber] = useState('');
  const [cabDetails, setCabDetails] = useState(null);

  // Mock Data (Sample Cab Info)
  const mockData = {
    'MH12AB1234': {
      tripDate: '2025-03-04',
      toFrom: 'Mumbai to Pune',
      fuelDetails: { image: '/images/fuel.jpg', paymentMethod: 'Card', amount: 2500 },
      fastTag: { image: '/images/fuel.jpg', paymentMethod: 'Cash', amount: 500 },
      tyrePuncture: 'No issues reported',
      driver: {
        name: 'John Doe',
        contact: '+91 9876543210',
        email: 'john.doe@example.com',
        aadhar: '1234-5678-9012',
        drivingLicense: 'DL1234567890',
        image: '/images/driver.jpg',
      },
    },
  };

  // Search Function
  const handleSearch = () => {
    if (mockData[cabNumber]) {
      setCabDetails(mockData[cabNumber]);
    } else {
      setCabDetails(null);
      alert('Cab details not found');
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-4">Cab Search</h1>

        {/* Search Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter Cab Number"
            value={cabNumber}
            onChange={(e) => setCabNumber(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded">
            Search
          </button>
        </div>

        {/* Display Cab Details */}
        {cabDetails && (
          <div className="bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-semibold">Cab Details</h2>
            <p><strong>Trip Date:</strong> {cabDetails.tripDate}</p>
            <p><strong>To & From:</strong> {cabDetails.toFrom}</p>

            {/* Fuel Details */}
            <div className="mt-4">
              <h3 className="font-semibold">Fuel Details</h3>
              <Image src={cabDetails.fuelDetails.image} alt="Fuel" width={128} height={128} className="rounded" />
              <p><strong>Payment:</strong> {cabDetails.fuelDetails.paymentMethod}</p>
              <p><strong>Amount:</strong> ₹{cabDetails.fuelDetails.amount}</p>
            </div>

            {/* Fast Tag Details */}
            <div className="mt-4">
              <h3 className="font-semibold">Fast Tag</h3>
              <Image src={cabDetails.fastTag.image} alt="Fast Tag" width={128} height={128} className="rounded" />
              <p><strong>Payment:</strong> {cabDetails.fastTag.paymentMethod}</p>
              <p><strong>Amount:</strong> ₹{cabDetails.fastTag.amount}</p>
            </div>

            <p className="mt-4"><strong>Tyre Puncture Details:</strong> {cabDetails.tyrePuncture}</p>

            {/* Driver Profile */}
            <div className="mt-4">
              <h3 className="font-semibold">Driver Profile</h3>
              <Image src={cabDetails.driver.image} alt="Driver" width={128} height={128} className="rounded" />
              <p><strong>Name:</strong> {cabDetails.driver.name}</p>
              <p><strong>Contact:</strong> {cabDetails.driver.contact}</p>
              <p><strong>Email:</strong> {cabDetails.driver.email}</p>
              <p><strong>Aadhar No:</strong> {cabDetails.driver.aadhar}</p>
              <p><strong>Driving License:</strong> {cabDetails.driver.drivingLicense}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CabSearch;
