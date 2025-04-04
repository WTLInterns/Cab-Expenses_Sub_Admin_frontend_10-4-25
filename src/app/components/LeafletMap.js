
"use client"

import { useEffect, useState } from "react"
import "leaflet/dist/leaflet.css"
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet"
import L from "leaflet"

// Define city coordinates for routing
const cityLocations = {
  Delhi: [28.6139, 77.209],
  Mumbai: [19.076, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Hyderabad: [17.385, 78.4867],
}

// Custom cab icon
const createCabIcon = () => {
  return L.divIcon({
    html: `<div class="cab-marker">
      <div class="cab-icon-container">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17h4V5H2v12h3m10 0h7.5c.8 0 1.5-.7 1.5-1.5v-3c0-.8-.7-1.5-1.5-1.5H17V5h-3"/>
          <circle cx="7.5" cy="17.5" r="2.5"/>
          <circle cx="17.5" cy="17.5" r="2.5"/>
        </svg>
      </div>
    </div>`,
    className: "cab-marker-container",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

const LeafletMap = ({ location, driverName, cabNumber, routeFrom, routeTo }) => {
  const [mapPosition, setMapPosition] = useState([location?.latitude || 28.6139, location?.longitude || 77.209])
  const [routePoints, setRoutePoints] = useState([])

  useEffect(() => {
    // Update map position when location changes
    if (location?.latitude && location?.longitude) {
      setMapPosition([location.latitude, location.longitude])
    }

    // Create route line if route information is available
    if (routeFrom && routeTo && cityLocations[routeFrom] && cityLocations[routeTo]) {
      const fromCoords = cityLocations[routeFrom]
      const toCoords = cityLocations[routeTo]
      setRoutePoints([fromCoords, toCoords])
    }
  }, [location, routeFrom, routeTo])

  // We need to handle the case where the component might be rendered on the server
  if (typeof window === "undefined") {
    return <div>Loading map...</div>
  }

  return (
    <div className="h-[60vh] w-full rounded-lg overflow-hidden border border-gray-600">
      <MapContainer
        center={mapPosition}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
        key={`${mapPosition[0]}-${mapPosition[1]}`}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Origin and Destination markers if route info available */}
        {routeFrom && cityLocations[routeFrom] && (
          <Marker
            position={cityLocations[routeFrom]}
            icon={L.divIcon({
              html: `<div class="origin-marker">
                <div class="origin-icon-container">📍</div>
              </div>`,
              className: "origin-marker-container",
              iconSize: [25, 25],
              iconAnchor: [12, 25],
            })}
          >
            <Popup>Origin: {routeFrom}</Popup>
          </Marker>
        )}

        {routeTo && cityLocations[routeTo] && (
          <Marker
            position={cityLocations[routeTo]}
            icon={L.divIcon({
              html: `<div class="destination-marker">
                <div class="destination-icon-container">🏁</div>
              </div>`,
              className: "destination-marker-container",
              iconSize: [25, 25],
              iconAnchor: [12, 25],
            })}
          >
            <Popup>Destination: {routeTo}</Popup>
          </Marker>
        )}

        {/* Route line */}
        {routePoints.length > 0 && (
          <Polyline positions={routePoints} color="#3B82F6" weight={3} opacity={0.7} dashArray="5, 10" />
        )}

        {/* Current driver position */}
        <Marker position={mapPosition} icon={createCabIcon()}>
          <Popup>
            <div>
              <p className="font-bold">{driverName || "Driver"}</p>
              <p>Cab: {cabNumber || "N/A"}</p>
              <p>
                Route: {routeFrom || "N/A"} → {routeTo || "N/A"}
              </p>
              <p className="text-xs mt-1">
                Lat: {location?.latitude?.toFixed(6) || "N/A"}, Lng: {location?.longitude?.toFixed(6) || "N/A"}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}

export default LeafletMap

