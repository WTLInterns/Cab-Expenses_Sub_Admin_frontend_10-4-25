// 'use client';

// import { useState, useEffect } from 'react';
// import Sidebar from '../slidebar/page';
// import axios from 'axios';
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import InvoicePDF from "../components/InvoicePDF";


// const CabSearch = () => {
//   const [cabNumber, setCabNumber] = useState('');
//   const [cabDetails, setCabDetails] = useState([]);
//   const [filteredCabs, setFilteredCabs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [fromDate, setFromDate] = useState('');
//   const [toDate, setToDate] = useState('');
//   const [activeModal, setActiveModal] = useState('');
//   const [selectedDetail, setSelectedDetail] = useState(null);

//   useEffect(() => {
//     const fetchAssignedCabs = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get('http://localhost:5000/api/assigncab', {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
//         });
//         setCabDetails(res.data);
//         setFilteredCabs(res.data);
//       } catch (err) {
//         setError('Failed to fetch assigned cabs');
//         setCabDetails([]);
//         setFilteredCabs([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAssignedCabs();
//   }, []);

//   const handleSearch = () => {
//     setError(null);
//     if (!cabNumber) {
//       setError('Please enter a cab number');
//       return;
//     }

//     const filtered = cabDetails.filter((item) =>
//       item.cab?.cabNumber?.toLowerCase().includes(cabNumber.toLowerCase())
//     );

//     setFilteredCabs(filtered);
//     if (filtered.length === 0) setError('Cab details not found');
//   };

//   const handleDateFilter = () => {
//     if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
//       setError('To date must be after From date');
//       return;
//     }

//     const filtered = cabDetails.filter((item) => {
//       const assignedDate = new Date(item.assignedAt).toISOString().split('T')[0];
//       const startDate = fromDate || '1970-01-01';
//       const endDate = toDate || '2100-01-01';

//       return assignedDate >= startDate && assignedDate <= endDate;
//     });

//     setFilteredCabs(filtered);
//     if (filtered.length === 0) setError('No cabs found in the selected date range');
//   };

//   const openModal = (type, data) => {
//     setSelectedDetail({ type, data });
//     setActiveModal('Details');
//   };

//   const closeModal = () => {
//     setActiveModal('');
//     setSelectedDetail(null);
//   };

//   return (
//     <div className="flex min-h-screen  bg-gray-800">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 p-4 md:p-6 mt-20 sm:mt-0 text-white  transition-all duration-300">
//         <h1 className="text-xl md:text-2xl font-bold mb-4">Cab Search</h1>

//         {/* Search and Filter Section */}
//         <div className="space-y-4 mb-6">
//           {/* Search by Cab Number */}
//           <div className="flex flex-col sm:flex-row gap-2">
//             <input
//               type="text"
//               placeholder="Enter Cab Number"
//               value={cabNumber}
//               onChange={(e) => setCabNumber(e.target.value)}
//               className="border p-2 rounded w-full text-white"
//             />
//             <button
//               onClick={handleSearch}
//               className="bg-indigo-600  hover:bg-indigo-700 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
//               disabled={loading}
//             >
//               {loading ? 'Searching...' : 'Search'}
//             </button>
//           </div>

//           {/* Filter by Date */}
//           <div className="flex flex-col sm:flex-row gap-2">
//             <div className="flex-1 flex flex-col sm:flex-row gap-2">
//               <input
//                 type="date"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//                 className="border p-2 rounded text-white w-full"
//               />
//               <input
//                 type="date"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//                 className="border p-2 rounded text-white w-full"
//               />
//             </div>
//             <button
//               onClick={handleDateFilter}
//               className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
//             >
//               Filter by Date
//             </button>
//           </div>
//         </div>

//         {error && <p className="text-red-500 mb-4">{error}</p>}

//         {/* Loading State */}
//         {loading ? (
//           <div className="animate-pulse space-y-4">
//             {[...Array(5)].map((_, i) => (
//               <div key={i} className="bg-gray-700 h-16 rounded-md"></div>
//             ))}
//           </div>
//         ) : (
//           <>
//             {/* Desktop Table View */}
//             <div className="hidden md:block bg-gray-700 shadow-lg rounded-lg overflow-x-auto">
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-800 text-white">
//                     <th className="p-3 text-left">#</th>
//                     <th className="p-3 text-left">Cab No</th>
//                     <th className="p-3 text-left">Driver</th>
//                     <th className="p-3 text-left">Assigned Date</th>
//                     <th className="p-3 text-left">Route</th>
//                     <th className="p-3 text-left">Distance</th>
//                     <th className="p-3 text-left">Details</th>
//                     <th className='p-2'>Invoice</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredCabs.length > 0 ? (
//                     filteredCabs.map((item, index) => (
//                       <tr key={index} className="border-b border-gray-600 hover:bg-gray-600 transition-colors">
//                         <td className="p-3">{index + 1}</td>
//                         <td className="p-3 font-medium">{item.cab?.cabNumber || 'N/A'}</td>
//                         <td className="p-3">{item.driver?.name || 'N/A'}</td>
//                         <td className="p-3">{item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : 'N/A'}</td>
//                         <td className="p-3">{item.cab?.location?.from || 'N/A'} → {item.cab?.location?.to || 'N/A'}</td>
//                         <td className="p-3">{item.cab?.location?.totalDistance || '0'} KM</td>
//                         <td className="p-3">
//                           <select
//                             className="border p-1 rounded bg-gray-800 text-white"
//                             onChange={(e) => e.target.value && openModal(e.target.value, item.cab[e.target.value])}
//                           >
//                             <option value="">Select</option>
//                             <option value="fuel">Fuel</option>
//                             <option value="fastTag">FastTag</option>
//                             <option value="tyrePuncture">Tyre</option>
//                             <option value="vehicleServicing">Servicing</option>
//                           </select>
//                         </td>
//                         <td className='p-2'>
//                           <PDFDownloadLink document={<InvoicePDF trip={item} />} fileName={`Invoice-${item?.cab?.cabNumber}.pdf`}>
//                             {({ loading }) => (
//                               <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
//                                 {loading ? "Generating PDF..." : "Download Invoice"}
//                               </button>
//                             )}
//                           </PDFDownloadLink>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="7" className="p-4 text-center">No results found</td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Mobile Card View */}
//             <div className="md:hidden space-y-3">
//               {filteredCabs.length > 0 ? (
//                 filteredCabs.map((item, index) => (
//                   <div key={index} className="bg-gray-700 p-4 rounded-lg shadow">
//                     <div className="grid grid-cols-2 gap-2 mb-3">
//                       <div>
//                         <p className="text-gray-400 text-sm">Cab No</p>
//                         <p className="font-medium">{item.cab?.cabNumber || 'N/A'}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400 text-sm">Driver</p>
//                         <p>{item.driver?.name || 'N/A'}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400 text-sm">Assigned Date</p>
//                         <p>{item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : 'N/A'}</p>
//                       </div>
//                       <div>
//                         <p className="text-gray-400 text-sm">Distance</p>
//                         <p>{item.cab?.location?.totalDistance || '0'} KM</p>
//                       </div>
//                     </div>
//                     <div className="mb-3">
//                       <p className="text-gray-400 text-sm">Route</p>
//                       <p>{item.cab?.location?.from || 'N/A'} → {item.cab?.location?.to || 'N/A'}</p>
//                     </div>
//                     <select
//                       className="w-full border p-2 rounded bg-gray-800 text-white mb-2"
//                       onChange={(e) => e.target.value && openModal(e.target.value, item.cab[e.target.value])}
//                     >
//                       <option value="">View Details</option>
//                       <option value="fuel">Fuel Details</option>
//                       <option value="fastTag">FastTag Details</option>
//                       <option value="tyrePuncture">Tyre Details</option>
//                       <option value="vehicleServicing">Servicing Details</option>
//                     </select>
//                   </div>
//                 ))
//               ) : (
//                 <div className="p-4 text-center bg-gray-700 rounded-lg">
//                   No results found
//                 </div>
//               )}
//             </div>
//           </>
//         )}

//         {/* Details Modal */}
//         {activeModal && selectedDetail && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
//             <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
//               <h2 className="text-xl font-bold mb-4 capitalize">{selectedDetail.type} Details</h2>

//               {typeof selectedDetail.data === 'object' ? (
//                 <div className="space-y-3">
//                   {Object.entries(selectedDetail.data).map(([key, value]) => (
//                     <div key={key} className="border-b border-gray-700 pb-2">
//                       <p className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</p>
//                       {typeof value === 'string' && value.match(/\.(jpeg|jpg|gif|png)$/) ? (
//                         <div className="mt-2">
//                           <img
//                             src={value}
//                             alt={key}
//                             className="w-full h-auto rounded border border-gray-600"
//                           />
//                         </div>
//                       ) : (
//                         <p className="text-white break-words">{value || 'N/A'}</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-white">No details available.</p>
//               )}

//               <button
//                 onClick={closeModal}
//                 className="w-full mt-4 bg-indigo-600  hover:bg-indigo-700 text-white py-2 rounded transition-colors"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// export default CabSearch;






"use client"

import { useState, useEffect, useRef } from "react"
import Sidebar from "../slidebar/page"
import axios from "axios"
import { PDFDownloadLink } from "@react-pdf/renderer"
import InvoicePDF from "../components/InvoicePDF"
import { MapPin, X } from "lucide-react"
import dynamic from "next/dynamic"
// Dynamically import Leaflet components with no SSR
const LeafletMap = dynamic(() => import("../components/LeafletMap"), {
  ssr: false,
  loading: () => <div className="h-[60vh] flex items-center justify-center bg-gray-700">Loading map...</div>,
})

// Default locations for major Indian cities (for simulation)
const cityLocations = {
  Delhi: { lat: 28.6139, lng: 77.209 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Kolkata: { lat: 22.5726, lng: 88.3639 },
  Hyderabad: { lat: 17.385, lng: 78.4867 },
}

// Create a driver location storage
const driverLocations = {}

const CabSearch = () => {
  const [cabNumber, setCabNumber] = useState("")
  const [cabDetails, setCabDetails] = useState([])
  const [filteredCabs, setFilteredCabs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [activeModal, setActiveModal] = useState("")
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [cab, setcab] = useState('')

  // WebSocket and location tracking states
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef(null)
  const adminId = useRef(`admin-${Date.now()}`)
  const [showMap, setShowMap] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [notification, setNotification] = useState("")

  // Track location update interval
  const locationIntervalRef = useRef(null)

  useEffect(() => {
    const fetchAssignedCabs = async () => {
      setLoading(true)
      try {
        const res = await axios.get("http://localhost:5000/api/assigncab", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        setCabDetails(res.data)
        setFilteredCabs(res.data)
      } catch (err) {
        setError("Failed to fetch assigned cabs")
        setCabDetails([])
        setFilteredCabs([])
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedCabs()
  }, [])

  console.log(cabDetails)
  
  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("ws://localhost:5000")

        ws.onopen = () => {
          console.log("WebSocket Connected")
          setWsConnected(true)
          // showNotification("WebSocket Connected")

          const registerMessage = {
            type: "register",
            driverId: adminId.current,
            role: "admin",
          }
          ws.send(JSON.stringify(registerMessage))
        }

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)

            if (data.type === "register_confirmation") {
              console.log(data.message)
            }

            if (data.type === "location_update") {
              // Store the driver's location
              driverLocations[data.driverId] = data.location

              setCabDetails((prevCabs) =>
                prevCabs.map((cab) =>
                  cab.driver?.id?.toString() === data.driverId.toString()
                    ? {
                        ...cab,
                        driver: {
                          ...cab.driver,
                          location: data.location,
                        },
                      }
                    : cab,
                ),
              )

              setFilteredCabs((prevCabs) =>
                prevCabs.map((cab) =>
                  cab.driver?.id?.toString() === data.driverId.toString()
                    ? {
                        ...cab,
                        driver: {
                          ...cab.driver,
                          location: data.location,
                        },
                      }
                    : cab,
                ),
              )

              if (showMap && selectedDriver && selectedDriver.driver?.id?.toString() === data.driverId.toString()) {
                setSelectedDriver((prev) => ({
                  ...prev,
                  driver: {
                    ...prev.driver,
                    location: data.location,
                  },
                }))
              }

              showNotification(`Location updated for driver ${data.driverId}`)
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error)
          }
        }

        ws.onclose = (event) => {
          console.log("WebSocket Disconnected", event)
          setWsConnected(false)
          setTimeout(connectWebSocket, 3000)
        }

        ws.onerror = (error) => {
          console.error("WebSocket Error:", error)
          setWsConnected(false)
        }

        wsRef.current = ws
      } catch (error) {
        console.error("Error creating WebSocket:", error)
        setWsConnected(false)
        setTimeout(connectWebSocket, 5000)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close()
        } catch (error) {
          console.error("Error closing WebSocket:", error)
        }
      }

      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
    }
  }, [])

  // Calculate route coordinates based on assigned route
  const calculateRouteCoordinates = (from, to, progress) => {
    const fromCoords = cityLocations[from] || cityLocations["Delhi"]
    const toCoords = cityLocations[to] || cityLocations["Delhi"]

    // Calculate position along the route based on progress
    return {
      latitude: fromCoords.lat + (toCoords.lat - fromCoords.lat) * progress,
      longitude: fromCoords.lng + (toCoords.lng - fromCoords.lng) * progress,
      timestamp: new Date().toISOString(),
    }
  }

  // Generate more realistic driver location based on assigned route
  const getDriverLocation = (cab, driverId) => {
    // If we already have a stored location for this driver, use it with some movement
    if (driverLocations[driverId]) {
      const currentLoc = driverLocations[driverId]
      const fromCity = cab?.location?.from || "Delhi"
      const toCity = cab?.location?.to || "Delhi"

      // Calculate if we're still on the route or need to reset
      const fromCoords = cityLocations[fromCity] || cityLocations["Delhi"]
      const toCoords = cityLocations[toCity] || cityLocations["Delhi"]

      // Find how far along the route we are (0 to 1)
      const totalDistance = Math.sqrt(
        Math.pow(toCoords.lat - fromCoords.lat, 2) + Math.pow(toCoords.lng - fromCoords.lng, 2),
      )

      const currentDistance = Math.sqrt(
        Math.pow(currentLoc.latitude - fromCoords.lat, 2) + Math.pow(currentLoc.longitude - fromCoords.lng, 2),
      )

      let progress = currentDistance / totalDistance

      // Add some small movement along the route (0.5% to 2% progress)
      progress += Math.random() * 0.015 + 0.005

      // If we've gone past the destination, reset to start
      if (progress >= 1) {
        progress = 0
      }

      // Calculate new position
      return calculateRouteCoordinates(fromCity, toCity, progress)
    }

    // If no stored location, start at the origin city with a small random offset
    const fromCity = cab?.location?.from || "Delhi"
    const fromCoords = cityLocations[fromCity] || cityLocations["Delhi"]

    // Add a small random offset to starting position (within 0.01 degrees)
    return {
      latitude: fromCoords.lat + Math.random() * 0.01 - 0.005,
      longitude: fromCoords.lng + Math.random() * 0.01 - 0.005,
      timestamp: new Date().toISOString(),
    }
  }

  const showNotification = (msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(""), 3000)
  }

  const handleLocationClick = (driver) => {
    if (!wsConnected) {
      showNotification("WebSocket not connected. Cannot track location.")
      return
    }

    setSelectedDriver(driver)
    setShowMap(true)

    // Start continuous location updates for the selected driver
    startLocationTracking(driver)
  }

  const startLocationTracking = (driver) => {
    // Clear any existing interval
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
    }

    // Immediately fetch the first location
    fetchDriverLocation(driver)

    // Then set up regular updates every 5 seconds
    locationIntervalRef.current = setInterval(() => {
      fetchDriverLocation(driver)
    }, 5000)
  }

  const fetchDriverLocation = async (driver) => {
    try {
      if (!driver.driver?.id) {
        showNotification("Driver ID not found")
        return
      }

      showNotification(`Fetching location for ${driver.driver?.name}...`)

      // Get location based on the assigned route
      const location = getDriverLocation(driver.cab, driver.driver.id)

      // Store the location
      driverLocations[driver.driver.id] = location

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const locationMessage = {
          type: "location",
          driverId: driver.driver?.id,
          role: "driver",
          location: location,
        }

        wsRef.current.send(JSON.stringify(locationMessage))

        setCabDetails((prevCabs) =>
          prevCabs.map((cab) =>
            cab.driver?.id === driver.driver?.id
              ? {
                  ...cab,
                  driver: {
                    ...cab.driver,
                    location: location,
                  },
                }
              : cab,
          ),
        )

        setFilteredCabs((prevCabs) =>
          prevCabs.map((cab) =>
            cab.driver?.id === driver.driver?.id
              ? {
                  ...cab,
                  driver: {
                    ...cab.driver,
                    location: location,
                  },
                }
              : cab,
          ),
        )

        // Also update the selected driver if this is the one being viewed
        if (selectedDriver && selectedDriver.driver?.id === driver.driver?.id) {
          setSelectedDriver((prev) => ({
            ...prev,
            driver: {
              ...prev.driver,
              location: location,
            },
          }))
        }
      }
    } catch (error) {
      console.error("Error fetching driver location:", error)
      showNotification("Error fetching driver location")
    }
  }

  const closeMap = () => {
    // Stop location tracking when map is closed
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current)
      locationIntervalRef.current = null
    }

    setShowMap(false)
  }

  const handleSearch = () => {
    setError(null)
    if (!cabNumber) {
      setError("Please enter a cab number")
      return
    }

    const filtered = cabDetails.filter((item) => item.cab?.cabNumber?.toLowerCase().includes(cabNumber.toLowerCase()))

    setFilteredCabs(filtered)
    if (filtered.length === 0) setError("Cab details not found")
  }

  const handleDateFilter = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("To date must be after From date")
      return
    }

    const filtered = cabDetails.filter((item) => {
      const assignedDate = new Date(item.assignedAt).toISOString().split("T")[0]
      const startDate = fromDate || "1970-01-01"
      const endDate = toDate || "2100-01-01"

      return assignedDate >= startDate && assignedDate <= endDate
    })

    setFilteredCabs(filtered)
    if (filtered.length === 0) setError("No cabs found in the selected date range")
  }

  const openModal = (type, data) => {
    setSelectedDetail({ type, data })
    setActiveModal("Details")
  }

  const closeModal = () => {
    setActiveModal("")
    setSelectedDetail(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 mt-20 sm:mt-0 text-white transition-all duration-300">
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-lg transition-all duration-300 animate-fadeIn">
              {notification}
            </div>
          </div>
        )}

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
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded whitespace-nowrap transition-colors"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search"}
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
                    <th className="p-3 text-left">Location</th>
                    <th className="p-2">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCabs.length > 0 ? (
                    filteredCabs.map((item, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-600 transition-colors">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">{item.cab?.cabNumber || "N/A"}</td>
                        <td className="p-3">{item.driver?.name || "N/A"}</td>
                        <td className="p-3">
                          {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="p-3">
                          {item.cab?.location?.from || "N/A"} → {item.cab?.location?.to || "N/A"}
                        </td>
                        <td className="p-3">{item.cab?.location?.totalDistance || "0"} KM</td>
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
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button
                              className={`text-green-400 transition-all duration-300 hover:scale-110 hover:shadow-md ${item.driver?.location ? "animate-pulse" : ""}`}
                              onClick={() => handleLocationClick(item)}
                              title="Track Location"
                              disabled={!wsConnected}
                            >
                              <MapPin size={16} />
                            </button>
                            {item.driver?.location && <span className="text-xs text-green-400">Live</span>}
                          </div>
                        </td>
                        <td className="p-2">
                          <PDFDownloadLink
                            document={<InvoicePDF trip={item} />}
                            fileName={`Invoice-${item?.cab?.cabNumber}.pdf`}
                          >
                            {({ loading }) => (
                              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
                                {loading ? "Generating PDF..." : "Download Invoice"}
                              </button>
                            )}
                          </PDFDownloadLink>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="p-4 text-center">
                        No results found
                      </td>
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
                        <p className="font-medium">{item.cab?.cabNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Driver</p>
                        <p>{item.driver?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Assigned Date</p>
                        <p>{item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Distance</p>
                        <p>{item.cab?.location?.totalDistance || "0"} KM</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm">Route</p>
                      <p>
                        {item.cab?.location?.from || "N/A"} → {item.cab?.location?.to || "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <select
                        className="w-full border p-2 rounded bg-gray-800 text-white"
                        onChange={(e) => e.target.value && openModal(e.target.value, item.cab[e.target.value])}
                      >
                        <option value="">View Details</option>
                        <option value="fuel">Fuel Details</option>
                        <option value="fastTag">FastTag Details</option>
                        <option value="tyrePuncture">Tyre Details</option>
                        <option value="vehicleServicing">Servicing Details</option>
                      </select>
                      <button
                        className={`text-green-400 p-2 rounded border border-gray-600 ${item.driver?.location ? "animate-pulse" : ""}`}
                        onClick={() => handleLocationClick(item)}
                        title="Track Location"
                        disabled={!wsConnected}
                      >
                        <MapPin size={16} />
                      </button>
                    </div>
                    <PDFDownloadLink
                      document={<InvoicePDF trip={item} />}
                      fileName={`Invoice-${item?.cab?.cabNumber}.pdf`}
                    >
                      {({ loading }) => (
                        <button className="w-full bg-green-600 text-white px-4 py-2 rounded">
                          {loading ? "Generating PDF..." : "Download Invoice"}
                        </button>
                      )}
                    </PDFDownloadLink>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center bg-gray-700 rounded-lg">No results found</div>
              )}
            </div>
          </>
        )}

        {/* Details Modal */}
        {activeModal && selectedDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-800 p-4 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 capitalize">{selectedDetail.type} Details</h2>

              {typeof selectedDetail.data === "object" ? (
                <div className="space-y-3">
                  {Object.entries(selectedDetail.data).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-700 pb-2">
                      <p className="text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1").trim()}:</p>
                      {typeof value === "string" && value.match(/\.(jpeg|jpg|gif|png)$/) ? (
                        <div className="mt-2">
                          <img
                            src={value || "/placeholder.svg"}
                            alt={key}
                            className="w-full h-auto rounded border border-gray-600"
                          />
                        </div>
                      ) : (
                        <p className="text-white break-words">{value || "N/A"}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white">No details available.</p>
              )}

              <button
                onClick={closeModal}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMap && selectedDriver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="bg-gray-800 rounded-lg w-full max-w-4xl overflow-hidden shadow-2xl">
              <div className="p-4 flex items-center justify-between border-b border-gray-700">
                <h3 className="text-xl font-semibold">
                  Location: {selectedDriver.driver?.name || "N/A"} ({selectedDriver.cab?.cabNumber || "N/A"})
                </h3>
                <button onClick={closeMap} className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              <div className="p-4">
                <LeafletMap
                  location={
                    selectedDriver.driver?.location || getDriverLocation(selectedDriver.cab, selectedDriver.driver?.id)
                  }
                  driverName={selectedDriver.driver?.name}
                  cabNumber={selectedDriver.cab?.cabNumber}
                  routeFrom={selectedDriver.cab?.location?.from}
                  routeTo={selectedDriver.cab?.location?.to}
                />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Driver Information</h4>
                    <p>Name: {selectedDriver.driver?.name || "N/A"}</p>
                    <p>Cab: {selectedDriver.cab?.cabNumber || "N/A"}</p>
                    <p>
                      Route: {selectedDriver.cab?.location?.from || "N/A"} → {selectedDriver.cab?.location?.to || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Location Details</h4>
                    {selectedDriver.driver?.location ? (
                      <>
                        <p>Latitude: {selectedDriver.driver.location.latitude?.toFixed(6) || "N/A"}</p>
                        <p>Longitude: {selectedDriver.driver.location.longitude?.toFixed(6) || "N/A"}</p>
                        <p>
                          Last Updated:{" "}
                          {selectedDriver.driver.location.timestamp
                            ? new Date(selectedDriver.driver.location.timestamp).toLocaleString()
                            : "N/A"}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-400">Waiting for location data...</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => fetchDriverLocation(selectedDriver)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-all duration-300"
                    disabled={!wsConnected}
                  >
                    Refresh Location
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CabSearch
