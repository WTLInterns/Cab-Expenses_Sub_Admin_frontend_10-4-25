"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "../slidebar/page";
import axios from "axios";
import { PDFDownloadLink } from "@react-pdf/renderer";
import InvoicePDF from "../components/InvoicePDF";
import { MapPin, X } from "lucide-react";

// Create a driver location storage
const driverLocations = {};

const CabSearch = () => {
  const [cabNumber, setCabNumber] = useState("");
  const [cabDetails, setCabDetails] = useState([]);
  const [filteredCabs, setFilteredCabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeModal, setActiveModal] = useState("");
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [cab, setcab] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [signature, setSignature] = useState("");
  const [companyInfo, setCompanyInfo] = useState("");
  const [subCompanyName, setCompanyName] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const adminId = useRef(`admin-${Date.now()}`);
  const [showMap, setShowMap] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [notification, setNotification] = useState("");
  const [routeCoordinates, setRouteCoordinates] = useState({});
  const [driverRoutes, setDriverRoutes] = useState({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(0);
  const [remainingDistance, setRemainingDistance] = useState(0);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);

  // Track location update interval
  const locationIntervalRef = useRef(null);
  // Map reference for Leaflet
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const routeMarkersRef = useRef([]);

  // Load Leaflet when component mounts
  useEffect(() => {
    if (typeof window !== "undefined" && !window.L) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        setMapLoaded(true);
        console.log("Leaflet loaded successfully");
      };
      document.body.appendChild(script);
    } else if (typeof window !== "undefined" && window.L) {
      setMapLoaded(true);
    }
  }, []);

  // const generateInvoiceNumber = (companyName) => {
  //   const prefix = derivePrefix(companyName);
  //   const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
  //   const date = new Date();
  //   const month = date.getMonth() + 1;
  //   const year = date.getFullYear().toString().slice(-2);
  //   return `${prefix}${month}${year}-${randomNum}`;
  // };

  // const derivePrefix = (name) => {
  //   if (!name) return "INV";
  //   const nameParts = name.trim().split(" ");
  //   return nameParts.map(part => part.charAt(0).toUpperCase()).join('').replace(/[^A-Z]/g, '').slice(0, 3);
  // };

  const generateInvoiceNumber = (companyName) => {
    const prefix = derivePrefix(companyName);        // e.g. "REP"
    const finYear = getFinancialYear();              // e.g. "2526"
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    return `${prefix}${finYear}-${randomNum}`;
  };

  const derivePrefix = (name) => {
    if (!name) return "INV";
    const nameParts = name.trim().split(" ");
    return nameParts
      .map(part => part.charAt(0).toUpperCase())
      .join('')
      .replace(/[^A-Z]/g, '')
      .slice(0, 3); // e.g. "REP" from "R K Enterprise"
  };

  const getFinancialYear = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 0-based index, so +1
    const currentYear = now.getFullYear();

    const fyStart = currentMonth >= 4 ? currentYear : currentYear - 1;
    const fyEnd = fyStart + 1;

    const fyStartShort = fyStart.toString().slice(-2); // "25"
    const fyEndShort = fyEnd.toString().slice(-2);     // "26"

    return `${fyStartShort}${fyEndShort}`; // "2526"
  };



  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const id = localStorage.getItem("id");
        const res = await axios.get("http://localhost:5000/api/admin/getAllSubAdmins");
        const admin = res.data.subAdmins.find((el) => el._id === id);

        if (admin) {
          setCompanyLogo(admin.companyLogo);
          setSignature(admin.signature);
          setCompanyName(admin.name);
          setCompanyInfo(admin.companyInfo);
          setInvoiceNumber(generateInvoiceNumber(admin.name));
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      }
    };

    fetchAdminData();
  }, []);


  useEffect(() => {
    const fetchAssignedCabs = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/api/assigncab", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setCabDetails(res.data);
        setFilteredCabs(res.data);

        // Fetch route coordinates for all cabs
        const routes = {};
        const driverRoutesMap = {};

        for (const cab of res.data) {
          if (cab.cab?.location?.from && cab.cab?.location?.to) {
            const routeData = await fetchRouteCoordinates(
              cab.cab.location.from,
              cab.cab.location.to
            );
            if (routeData) {
              routes[cab.cab.cabNumber] = routeData;

              // Map driver ID to their assigned route
              if (cab.driver?.id) {
                driverRoutesMap[cab.driver.id] = {
                  cabNumber: cab.cab.cabNumber,
                  route: routeData,
                  from: cab.cab.location.from,
                  to: cab.cab.location.to,
                  totalDistance: cab.cab.location.totalDistance || "0",
                };
              }
            }
          }
        }

        setRouteCoordinates(routes);
        setDriverRoutes(driverRoutesMap);
      } catch (err) {
        setError("Failed to fetch assigned cabs");
        setCabDetails([]);
        setFilteredCabs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedCabs();
  }, []);

  // Fetch route coordinates using OpenStreetMap Nominatim API
  const fetchRouteCoordinates = async (from, to) => {
    try {
      // Fetch coordinates for origin
      const fromRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          from
        )},India&format=json&limit=1`
      );

      // Fetch coordinates for destination
      const toRes = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          to
        )},India&format=json&limit=1`
      );

      if (fromRes.data.length > 0 && toRes.data.length > 0) {
        return {
          from: {
            lat: Number.parseFloat(fromRes.data[0].lat),
            lng: Number.parseFloat(fromRes.data[0].lon),
            name: from,
          },
          to: {
            lat: Number.parseFloat(toRes.data[0].lat),
            lng: Number.parseFloat(toRes.data[0].lon),
            name: to,
          },
        };
      }
      return null;
    } catch (error) {
      console.error("Error fetching route coordinates:", error);
      return null;
    }
  };

  // Calculate distance between two points in kilometers
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket("ws://localhost:5000");

        ws.onopen = () => {
          console.log("WebSocket Connected");
          setWsConnected(true);
          showNotification("WebSocket Connected");

          const registerMessage = {
            type: "register",
            driverId: adminId.current,
            role: "admin",
          };
          ws.send(JSON.stringify(registerMessage));
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);

            if (data.type === "register_confirmation") {
              console.log(data.message);
            }

            if (data.type === "location_update") {
              // Store the driver's location
              driverLocations[data.driverId] = data.location;

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
                    : cab
                )
              );

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
                    : cab
                )
              );

              if (
                showMap &&
                selectedDriver &&
                selectedDriver.driver?.id?.toString() ===
                data.driverId.toString()
              ) {
                setSelectedDriver((prev) => ({
                  ...prev,
                  driver: {
                    ...prev.driver,
                    location: data.location,
                  },
                }));

                // Update map marker if using Leaflet directly
                if (markerRef.current && mapRef.current) {
                  updateMapMarker(data.location);
                }

                // Update distance calculations
                updateDistanceCalculations(data.driverId, data.location);
              }

              showNotification(`Location updated for driver ${data.driverId}`);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onclose = (event) => {
          console.log("WebSocket Disconnected", event);
          setWsConnected(false);
          setTimeout(connectWebSocket, 3000);
        };

        ws.onerror = (error) => {
          console.error("WebSocket Error:", error);
          setWsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        setWsConnected(false);
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.close();
        } catch (error) {
          console.error("Error closing WebSocket:", error);
        }
      }

      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }

      // Clean up map if it exists
      cleanupMap();
    };
  }, []);

  // Initialize map when showing it and Leaflet is loaded
  useEffect(() => {
    if (showMap && selectedDriver && mapLoaded) {
      initializeMap();
    }
  }, [showMap, selectedDriver, mapLoaded]);

  // Calculate position along the route based on progress
  const calculatePositionAlongRoute = (from, to, progress) => {
    const latitude = from.lat + (to.lat - from.lat) * progress;
    const longitude = from.lng + (to.lng - from.lng) * progress;

    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude)
    // return {
    // latitude: from.lat + (to.lat - from.lat) * progress,
    // longitude: from.lng + (to.lng - from.lng) * progress,
    // timestamp: new Date().toISOString(),
    return {
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    };


    // };
  };

  // Update distance calculations based on current location
  const updateDistanceCalculations = (driverId, location) => {
    const driverRoute = driverRoutes[driverId];
    if (!driverRoute || !driverRoute.route) return;

    const route = driverRoute.route;

    // Calculate distance traveled from origin
    const distanceFromOrigin = calculateDistance(
      route.from.lat,
      route.from.lng,
      location.latitude,
      location.longitude
    );

    // Calculate remaining distance to destination
    const distanceToDestination = calculateDistance(
      location.latitude,
      location.longitude,
      route.to.lat,
      route.to.lng
    );

    // Calculate total route distance
    const totalRouteDistance = calculateDistance(
      route.from.lat,
      route.from.lng,
      route.to.lat,
      route.to.lng
    );

    // Update state with the calculated distances
    setCurrentDistance(distanceFromOrigin.toFixed(2));
    setRemainingDistance(distanceToDestination.toFixed(2));

    console.log("From:", route.from.lat, route.from.lng);
    console.log("Current Location:", location.latitude, location.longitude);
    console.log("To:", route.to.lat, route.to.lng);

    // Update the driver's route with the new distance information
    setDriverRoutes((prev) => ({
      ...prev,
      [driverId]: {
        ...prev[driverId],
        currentDistance: distanceFromOrigin.toFixed(2),
        remainingDistance: distanceToDestination.toFixed(2),
        totalRouteDistance: totalRouteDistance.toFixed(2),
      },
    }));
  };

  // Generate driver location based on assigned route
  const getDriverLocation = (cab, driverId) => {
    // Get the driver's assigned route
    const driverRoute = driverRoutes[driverId];
    const cabNumber = cab?.cabNumber;

    // First check if we have a specific route for this driver
    const route = driverRoute ? driverRoute.route : routeCoordinates[cabNumber];

    // If we don't have route data, return a default location
    if (!route) {
      return {
        latitude: 28.6139, // Default to Delhi
        longitude: 77.209,
        timestamp: new Date().toISOString(),
      };
    }

    // If we already have a stored location for this driver, use it with some movement
    if (driverLocations[driverId]) {
      const currentLoc = driverLocations[driverId];
      const fromCoords = route.from;
      const toCoords = route.to;

      // Find how far along the route we are (0 to 1)
      const totalDistance = Math.sqrt(
        Math.pow(toCoords.lat - fromCoords.lat, 2) +
        Math.pow(toCoords.lng - fromCoords.lng, 2)
      );

      const currentDistance = Math.sqrt(
        Math.pow(currentLoc.latitude - fromCoords.lat, 2) +
        Math.pow(currentLoc.longitude - fromCoords.lng, 2)
      );

      let progress = currentDistance / totalDistance;

      // Add some small movement along the route (0.5% to 2% progress)
      progress += Math.random() * 0.015 + 0.005;

      // If we've gone past the destination, reset to start
      if (progress >= 1) {
        progress = 0;
      }

      // Calculate new position
      const newLocation = calculatePositionAlongRoute(
        fromCoords,
        toCoords,
        progress
      );

      // Update distance calculations for this new location
      updateDistanceCalculations(driverId, newLocation);

      return newLocation;
    }

    // If no stored location, start at the origin with a small random offset
    const initialLocation = {
      latitude: route.from.lat + (Math.random() * 0.01 - 0.005),
      longitude: route.from.lng + (Math.random() * 0.01 - 0.005),
      timestamp: new Date().toISOString(),
    };

    // Initialize distance calculations
    updateDistanceCalculations(driverId, initialLocation);

    return initialLocation;
  };

  // Clean up map resources
  const cleanupMap = () => {
    if (mapRef.current) {
      // Remove all markers
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      // Remove route layer
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }

      // Remove all route markers
      if (routeMarkersRef.current.length > 0) {
        routeMarkersRef.current.forEach((marker) => {
          if (marker) marker.remove();
        });
        routeMarkersRef.current = [];
      }

      // Remove the map
      mapRef.current.remove();
      mapRef.current = null;

      // Clear the container reference
      const mapContainer = document.getElementById("map-container");
      if (mapContainer) {
        mapContainer._leaflet_id = null;
      }
    }
  };

  // Initialize map using Leaflet
  // const initializeMap = () => {
  //   if (typeof window === "undefined" || !window.L) {
  //     console.log("Leaflet not loaded yet");
  //     return;
  //   }

  //   const L = window.L;
  //   const mapContainer = document.getElementById("map-container");

  //   if (!mapContainer) {
  //     console.error("Map container not found");
  //     return;
  //   }

  //   // Clean up any existing map
  //   cleanupMap();

  //   try {
  //     // Get the driver ID
  //     const driverId = selectedDriver.driver?.id;

  //     // Get the assigned route for this driver
  //     const driverRoute = driverRoutes[driverId];
  //     const cabNumber = selectedDriver.cab?.cabNumber;

  //     // First check if we have a specific route for this driver
  //     const route = driverRoute
  //       ? driverRoute.route
  //       : routeCoordinates[cabNumber];

  //     // Get driver location
  //     let driverLocation = { lat: 28.6139, lng: 77.209 }; // Default to Delhi

  //     if (selectedDriver.driver?.location) {
  //       driverLocation = {
  //         lat: selectedDriver.driver.location.latitude,
  //         lng: selectedDriver.driver.location.longitude,
  //       };
  //     } else if (route) {
  //       // Use the route origin
  //       driverLocation = {
  //         lat: route.from.lat,
  //         lng: route.from.lng,
  //       };
  //     }

  //     // Create map using Leaflet
  //     const map = L.map("map-container").setView(
  //       [driverLocation.lat, driverLocation.lng],
  //       10
  //     );

  //     // Add OpenStreetMap tiles
  //     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  //       attribution:
  //         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //     }).addTo(map);

  //     // Create custom marker icon
  //     const customIcon = L.icon({
  //       iconUrl:
  //         "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png",
  //       iconSize: [32, 32],
  //       iconAnchor: [16, 32],
  //       popupAnchor: [0, -32],
  //     });

  //     // Create marker for the driver's current position
  //     const marker = L.marker([driverLocation.lat, driverLocation.lng], {
  //       icon: customIcon,
  //     }).addTo(map);

  //     // Add popup with driver and route information
  //     marker
  //       .bindPopup(
  //         `
  //       <div style="color: #333; padding: 5px;">
  //         <strong>${selectedDriver.driver?.name || "Driver"}</strong><br>
  //         Cab: ${selectedDriver.cab?.cabNumber || "N/A"}<br>
  //         Route: ${driverRoute
  //           ? driverRoute.from
  //           : selectedDriver.cab?.location?.from || "N/A"
  //         } → 
  //                ${driverRoute
  //           ? driverRoute.to
  //           : selectedDriver.cab?.location?.to || "N/A"
  //         }<br>
  //         Distance: ${driverRoute
  //           ? driverRoute.totalDistance
  //           : selectedDriver.cab?.location?.totalDistance || "0"
  //         } KM
  //       </div>
  //     `
  //       )
  //       .openPopup();

  //     // Draw route if available
  //     if (route) {
  //       // Create a polyline for the route
  //       const routeLayer = L.polyline(
  //         [
  //           [route.from.lat, route.from.lng],
  //           [route.to.lat, route.to.lng],
  //         ],
  //         {
  //           color: "blue",
  //           weight: 4,
  //           opacity: 0.7,
  //           dashArray: "10, 10",
  //         }
  //       ).addTo(map);

  //       // Add markers for origin and destination with custom icons
  //       const originIcon = L.divIcon({
  //         className: "origin-marker",
  //         html: `<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
  //         iconSize: [12, 12],
  //         iconAnchor: [6, 6],
  //       });

  //       const destIcon = L.divIcon({
  //         className: "destination-marker",
  //         html: `<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
  //         iconSize: [12, 12],
  //         iconAnchor: [6, 6],
  //       });

  //       const originMarker = L.marker([route.from.lat, route.from.lng], {
  //         icon: originIcon,
  //       }).addTo(map);

  //       const destMarker = L.marker([route.to.lat, route.to.lng], {
  //         icon: destIcon,
  //       }).addTo(map);

  //       // Add tooltips to the markers
  //       originMarker.bindTooltip(route.from.name);
  //       destMarker.bindTooltip(route.to.name);

  //       // Store route markers for cleanup
  //       routeMarkersRef.current.push(originMarker, destMarker);

  //       // Add waypoints along the route (optional)
  //       addWaypointsAlongRoute(route, map, L);

  //       // Fit map to show the entire route with padding
  //       map.fitBounds(
  //         [
  //           [route.from.lat, route.from.lng],
  //           [route.to.lat, route.to.lng],
  //         ],
  //         { padding: [50, 50] }
  //       );

  //       routeLayerRef.current = routeLayer;
  //     }

  //     // Save references
  //     mapRef.current = map;
  //     markerRef.current = marker;

  //     // Force a resize to ensure the map renders correctly
  //     setTimeout(() => {
  //       if (mapRef.current) {
  //         mapRef.current.invalidateSize();
  //       }
  //     }, 100);
  //   } catch (error) {
  //     console.error("Error initializing map:", error);
  //     showNotification("Error initializing map");
  //   }
  // };

  const initializeMap = () => {
    if (typeof window === "undefined" || !window.L) {
      console.log("Leaflet not loaded yet");
      return;
    }
  
    const L = window.L;
    const mapContainer = document.getElementById("map-container");
  
    if (!mapContainer) {
      console.error("Map container not found");
      return;
    }
  
    // Clean up any existing map
    cleanupMap();
  
    try {
      // Get the driver ID
      const driverId = selectedDriver.driver?.id;
  
      // Get the assigned route for this driver
      const driverRoute = driverRoutes[driverId];
      const cabNumber = selectedDriver.cab?.cabNumber;
  
      // First check if we have a specific route for this driver
      const route = driverRoute
        ? driverRoute.route
        : routeCoordinates[cabNumber];
  
      // Get driver location
      let driverLocation = { lat: 28.6139, lng: 77.209 }; // Default to Delhi
  
      if (selectedDriver.driver?.location) {
        driverLocation = {
          lat: selectedDriver.driver.location.latitude,
          lng: selectedDriver.driver.location.longitude,
        };
      } else if (route) {
        // Use the route origin
        driverLocation = {
          lat: route.from.lat,
          lng: route.from.lng,
        };
      }
  
      // Create map using Leaflet
      const map = L.map("map-container").setView(
        [driverLocation.lat, driverLocation.lng],
        10
      );
  
      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);
  
      // Add click event listener to the map
      map.on('click', function(e) {
        const { lat, lng } = e.latlng;
        console.log(`Clicked at latitude: ${lat}, longitude: ${lng}`);
      });
  
      // Create custom marker icon
      const customIcon = L.icon({
        iconUrl:
          "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });
  
      // Create marker for the driver's current position
      const marker = L.marker([driverLocation.lat, driverLocation.lng], {
        icon: customIcon,
      }).addTo(map);
  
      // Add popup with driver and route information
      marker
        .bindPopup(
          `
          <div style="color: #333; padding: 5px;">
            <strong>${selectedDriver.driver?.name || "Driver"}</strong><br>
            Cab: ${selectedDriver.cab?.cabNumber || "N/A"}<br>
            Route: ${driverRoute
              ? driverRoute.from
              : selectedDriver.cab?.location?.from || "N/A"
            } → 
                   ${driverRoute
              ? driverRoute.to
              : selectedDriver.cab?.location?.to || "N/A"
            }<br>
            Distance: ${driverRoute
              ? driverRoute.totalDistance
              : selectedDriver.cab?.location?.totalDistance || "0"
            } KM
          </div>
        `
        )
        .openPopup();
  
      // Draw route if available
      if (route) {
        // Create a polyline for the route
        const routeLayer = L.polyline(
          [
            [route.from.lat, route.from.lng],
            [route.to.lat, route.to.lng],
          ],
          {
            color: "blue",
            weight: 4,
            opacity: 0.7,
            dashArray: "10, 10",
          }
        ).addTo(map);
  
        // Add markers for origin and destination with custom icons
        const originIcon = L.divIcon({
          className: "origin-marker",
          html: `<div style="background-color: green; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
  
        const destIcon = L.divIcon({
          className: "destination-marker",
          html: `<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });
  
        const originMarker = L.marker([route.from.lat, route.from.lng], {
          icon: originIcon,
        }).addTo(map);
  
        const destMarker = L.marker([route.to.lat, route.to.lng], {
          icon: destIcon,
        }).addTo(map);
  
        // Add tooltips to the markers
        originMarker.bindTooltip(route.from.name);
        destMarker.bindTooltip(route.to.name);
  
        // Store route markers for cleanup
        routeMarkersRef.current.push(originMarker, destMarker);
  
        // Add waypoints along the route (optional)
        addWaypointsAlongRoute(route, map, L);
  
        // Fit map to show the entire route with padding
        map.fitBounds(
          [
            [route.from.lat, route.from.lng],
            [route.to.lat, route.to.lng],
          ],
          { padding: [50, 50] }
        );
  
        routeLayerRef.current = routeLayer;
      }
  
      // Save references
      mapRef.current = map;
      markerRef.current = marker;
  
      // Force a resize to ensure the map renders correctly
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 100);
    } catch (error) {
      console.error("Error initializing map:", error);
      showNotification("Error initializing map");
    }
  };

  // Add waypoints along the route to make it more detailed
  const addWaypointsAlongRoute = (route, map, L) => {
    if (!route || !map || !L) return;

    const fromPoint = [route.from.lat, route.from.lng];
    const toPoint = [route.to.lat, route.to.lng];

    // Calculate distance between points
    const distance = Math.sqrt(
      Math.pow(toPoint[0] - fromPoint[0], 2) +
      Math.pow(toPoint[1] - fromPoint[1], 2)
    );

    // Determine number of waypoints based on distance
    const numWaypoints = Math.min(Math.ceil(distance * 100), 10); // Max 10 waypoints

    if (numWaypoints <= 1) return; // No need for waypoints if distance is small

    // Create waypoints
    for (let i = 1; i < numWaypoints; i++) {
      const progress = i / numWaypoints;
      const waypointLat = fromPoint[0] + (toPoint[0] - fromPoint[0]) * progress;
      const waypointLng = fromPoint[1] + (toPoint[1] - fromPoint[1]) * progress;

      // Create a small marker for the waypoint
      const waypointIcon = L.divIcon({
        className: "waypoint-marker",
        html: `<div style="background-color: #3388ff; width: 6px; height: 6px; border-radius: 50%; border: 1px solid white;"></div>`,
        iconSize: [6, 6],
        iconAnchor: [3, 3],
      });

      const waypointMarker = L.marker([waypointLat, waypointLng], {
        icon: waypointIcon,
      }).addTo(map);

      // Store waypoint markers for cleanup
      routeMarkersRef.current.push(waypointMarker);
    }
  };

  // Update map marker position
  const updateMapMarker = (location) => {
    if (!markerRef.current || !mapRef.current) return;

    const newPosition = [location.latitude, location.longitude];
    markerRef.current.setLatLng(newPosition);
    mapRef.current.panTo(newPosition);
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const handleLocationClick = (driver) => {
    if (!wsConnected) {
      showNotification("WebSocket not connected. Cannot track location.");
      return;
    }

    setSelectedDriver(driver);
    setShowMap(true);

    // Start continuous location updates for the selected driver
    startLocationTracking(driver);
  };

  const startLocationTracking = (driver) => {
    // Clear any existing interval
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }

    // Immediately fetch the first location
    fetchDriverLocation(driver);

    // Then set up regular updates every 5 seconds
    locationIntervalRef.current = setInterval(() => {
      fetchDriverLocation(driver);
    }, 5000);
  };

  const fetchDriverLocation = async (driver) => {
    try {
      if (!driver.driver?.id) {
        showNotification("Driver ID not found");
        return;
      }

      showNotification(`Fetching location for ${driver.driver?.name}...`);

      // Get location based on the assigned route
      const location = getDriverLocation(driver.cab, driver.driver.id);

      // Store the location
      driverLocations[driver.driver.id] = location;

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        const locationMessage = {
          type: "location",
          driverId: driver.driver?.id,
          role: "driver",
          location: location,
        };

        wsRef.current.send(JSON.stringify(locationMessage));

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
              : cab
          )
        );

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
              : cab
          )
        );

        // Also update the selected driver if this is the one being viewed
        if (selectedDriver && selectedDriver.driver?.id === driver.driver?.id) {
          setSelectedDriver((prev) => ({
            ...prev,
            driver: {
              ...prev.driver,
              location: location,
            },
          }));

          // Update map marker if using Leaflet directly
          if (markerRef.current && mapRef.current) {
            updateMapMarker(location);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching driver location:", error);
      showNotification("Error fetching driver location");
    }
  };

  const closeMap = () => {
    // Stop location tracking when map is closed
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    // Clean up map
    cleanupMap();
    setShowMap(false);
  };

  const handleSearch = () => {
    setError(null);
    if (!cabNumber) {
      setError("Please enter a cab number");
      return;
    }

    const filtered = cabDetails.filter((item) =>
      item.cab?.cabNumber?.toLowerCase().includes(cabNumber.toLowerCase())
    );

    setFilteredCabs(filtered);
    if (filtered.length === 0) setError("Cab details not found");
  };

  const handleDateFilter = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setError("To date must be after From date");
      return;
    }

    const filtered = cabDetails.filter((item) => {
      const assignedDate = new Date(item.assignedAt)
        .toISOString()
        .split("T")[0];
      const startDate = fromDate || "1970-01-01";
      const endDate = toDate || "2100-01-01";

      return assignedDate >= startDate && assignedDate <= endDate;
    });

    setFilteredCabs(filtered);
    if (filtered.length === 0)
      setError("No cabs found in the selected date range");
  };

  const openModal = (type, data) => {
    setSelectedDetail({ type, data });
    setActiveModal("Details");
  };

  const closeModal = () => {
    setActiveModal("");
    setSelectedDetail(null);
  };

  // Format date and time for display
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";

    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-800">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 md:ml-60 mt-20 sm:mt-0 text-white transition-all duration-300">
        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-md shadow-lg transition-all duration-300 animate-fadeIn">
              {notification}
            </div>
          </div>
        )}

        <h1 className="text-xl md:text-2xl font-bold mb-4">Cab Search</h1>

        {/* WebSocket Connection Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div
            className={`h-3 w-3 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"
              }`}
          ></div>
          <span className="text-sm">
            {wsConnected ? "WebSocket Connected" : "WebSocket Disconnected"}
          </span>
        </div>

        {/* Search and Filter Section */}
        <div className="space-y-4 mb-6">
          {/* Search by Cab Number */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Enter Cab Number"
              value={cabNumber}
              onChange={(e) => setCabNumber(e.target.value)}
              className="border p-2 rounded w-full bg-gray-700 text-white"
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
                className="border p-2 rounded bg-gray-700 text-white w-full"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border p-2 rounded bg-gray-700 text-white w-full"
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
                      <tr
                        key={index}
                        className="border-b border-gray-600 hover:bg-gray-600 transition-colors"
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">
                          {item.cab?.cabNumber || "N/A"}
                        </td>
                        <td className="p-3">{item.driver?.name || "N/A"}</td>
                        <td className="p-3">
                          {item.assignedAt
                            ? new Date(item.assignedAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="p-3">
                          {item.cab?.location?.from || "N/A"} →{" "}
                          {item.cab?.location?.to || "N/A"}
                        </td>
                        <td className="p-3">
                          {item.cab?.location?.totalDistance || "0"} KM
                        </td>
                        <td className="p-3">
                          <select
                            className="border p-1 rounded bg-gray-800 text-white"
                            onChange={(e) =>
                              e.target.value &&
                              openModal(
                                e.target.value,
                                item.cab[e.target.value]
                              )
                            }
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
                              className={`text-green-400 transition-all duration-300 hover:scale-110 hover:shadow-md ${item.driver?.location ? "animate-pulse" : ""
                                }`}
                              onClick={() => handleLocationClick(item)}
                              title="Track Location"
                              disabled={!wsConnected}
                            >
                              <MapPin size={16} />
                            </button>
                            {item.driver?.location && (
                              <span className="text-xs text-green-400">
                                Live
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          <PDFDownloadLink
                            document={
                              <InvoicePDF
                                trip={item}
                                companyLogo={companyLogo}
                                signature={signature}
                                companyPrefix={derivePrefix(subCompanyName)}
                                companyInfo={companyInfo}
                                companyName={subCompanyName}
                                invoiceNumber={invoiceNumber || `${derivePrefix(subCompanyName)}-${String(item.invoiceSerial).padStart(5, "0")}`}
                                invoiceDate={new Date().toLocaleDateString("en-IN")}
                              />
                            }
                            fileName={`Invoice-${item?.cab?.cabNumber}.pdf`}
                          >
                            {({ loading }) => (
                              <button className="w-full bg-green-600 text-white px-4 py-2 rounded">
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
                  <div
                    key={index}
                    className="bg-gray-700 p-4 rounded-lg shadow"
                  >
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-gray-400 text-sm">Cab No</p>
                        <p className="font-medium">
                          {item.cab?.cabNumber || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Driver</p>
                        <p>{item.driver?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Assigned Date</p>
                        <p>
                          {item.assignedAt
                            ? new Date(item.assignedAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Distance</p>
                        <p>{item.cab?.location?.totalDistance || "0"} KM</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-gray-400 text-sm">Route</p>
                      <p>
                        {item.cab?.location?.from || "N/A"} →{" "}
                        {item.cab?.location?.to || "N/A"}
                      </p>
                    </div>
                    <div className="flex gap-2 mb-2">
                      <select
                        className="w-full border p-2 rounded bg-gray-800 text-white"
                        onChange={(e) =>
                          e.target.value &&
                          openModal(e.target.value, item.cab[e.target.value])
                        }
                      >
                        <option value="">View Details</option>
                        <option value="fuel">Fuel Details</option>
                        <option value="fastTag">FastTag Details</option>
                        <option value="tyrePuncture">Tyre Details</option>
                        <option value="vehicleServicing">
                          Servicing Details
                        </option>
                      </select>
                      <button
                        className={`text-green-400 p-2 rounded border border-gray-600 ${item.driver?.location ? "animate-pulse" : ""
                          }`}
                        onClick={() => handleLocationClick(item)}
                        title="Track Location"
                        disabled={!wsConnected}
                      >
                        <MapPin size={16} />
                      </button>
                    </div>
                    <PDFDownloadLink
                      document={
                        <InvoicePDF
                          trip={item}
                          companyLogo={companyLogo}
                          signature={signature}
                          companyPrefix={derivePrefix(subCompanyName)}
                          companyInfo={companyInfo}
                          invoiceNumber={invoiceNumber || `${derivePrefix(subCompanyName)}-${String(item.invoiceSerial).padStart(5, "0")}`}
                          invoiceDate={new Date().toLocaleDateString("en-IN")}
                        />
                      }
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
              <h2 className="text-xl font-bold mb-4 capitalize">
                {selectedDetail.type} Details
              </h2>

              {typeof selectedDetail.data === "object" ? (
                <div className="space-y-3">
                  {Object.entries(selectedDetail.data).map(([key, value]) => (
                    <div key={key} className="border-b border-gray-700 pb-2">
                      <p className="text-gray-400 capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </p>
                      {typeof value === "string" &&
                        value.match(/\.(jpeg|jpg|gif|png)$/) ? (
                        <div className="mt-2">
                          <img
                            src={value || "https://via.placeholder.com/300"}
                            alt={key}
                            className="w-full h-auto rounded border border-gray-600"
                          />
                        </div>
                      ) : (
                        <p className="text-white break-words">
                          {value || "N/A"}
                        </p>
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
                  Location: {selectedDriver.driver?.name || "N/A"} (
                  {selectedDriver.cab?.cabNumber || "N/A"})
                </h3>
                <button
                  onClick={closeMap}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4">
                <div
                  id="map-container"
                  className="w-full h-[60vh] rounded-lg overflow-hidden"
                  style={{ background: "#242f3e" }}
                ></div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-700 p-3 rounded-lg col-span-1 md:col-span-2">
                    <h4 className="font-medium mb-2">Driver Information</h4>
                    <p>Name: {selectedDriver.driver?.name || "N/A"}</p>
                    <p>Cab: {selectedDriver.cab?.cabNumber || "N/A"}</p>
                    <p>
                      Route: {selectedDriver.cab?.location?.from || "N/A"} →{" "}
                      {selectedDriver.cab?.location?.to || "N/A"}
                    </p>
                  </div>
                  {/* <div className="bg-gray-700 p-3 rounded-lg">
                    <h4 className="font-medium mb-2">Location Details</h4>
                    {selectedDriver.driver?.location ? (
                      <>
                        <p>
                          Latitude:{" "}
                          {selectedDriver.driver.location.latitude?.toFixed(
                            6
                          ) || "N/A"}
                        </p>
                        <p>
                          Longitude:{" "}
                          {selectedDriver.driver.location.longitude?.toFixed(
                            6
                          ) || "N/A"}
                        </p>
                        <p>
                          Last Updated:{" "}
                          {selectedDriver.driver.location.timestamp
                            ? formatDateTime(
                              selectedDriver.driver.location.timestamp
                            )
                            : "N/A"}
                        </p>
                      </>
                    ) : (
                      <p className="text-gray-400">
                        Waiting for location data...
                      </p>
                    )}
                  </div> */}
                </div>
                <div className="mt-4 flex justify-end">

                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CabSearch;





