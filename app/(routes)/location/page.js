"use client";
import React, { useState, useEffect, useRef } from "react";
import { useSos } from "@/components/context/SosContext";
import { Battery, BatteryCharging, MapPin, Signal } from "lucide-react";

const LocationPage = () => {
  const { sos } = useSos();

  const [timeNow, setTimeNow] = useState("");
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  const defaultLat = 40.7128;  
  const defaultLng = -74.0060;
  
  const latitude = sos?.latitude ? parseFloat(sos.latitude) : defaultLat;
  const longitude = sos?.longitude ? parseFloat(sos.longitude) : defaultLng;
  
  const isValidCoordinate = !isNaN(latitude) && !isNaN(longitude);
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      setTimeNow(timeString);
    };
    
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cleanupMap = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapLoaded(false); 
      }
    };
  
    if (!mapRef.current || typeof window === 'undefined' || !isValidCoordinate) {
      return cleanupMap;
    }
  
    cleanupMap();
  
    const loadMap = async () => {
      try {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const linkElement = document.createElement('link');
          linkElement.rel = 'stylesheet';
          linkElement.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css';
          document.head.appendChild(linkElement);
        }
  
        const L = await import('leaflet');
  
        const map = L.map(mapRef.current).setView([latitude, longitude], 15);
        mapInstanceRef.current = map;
  
        // Changed the tile layer to a light theme
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          maxZoom: 19
        }).addTo(map);
  
        const marker = L.circleMarker([latitude, longitude], {
          radius: 8,
          color: '#00ccff',
          fillColor: '#00ccff',
          fillOpacity: 0.8,
          weight: 2,
        }).addTo(map);
  
        const pulseMarker = L.circleMarker([latitude, longitude], {
          radius: 20,
          color: '#00ccff',
          fillColor: '#00ccff',
          fillOpacity: 0.2,
          weight: 1,
        }).addTo(map);
  
        let animationFrameId;
        const pulseAnimation = () => {
          let radius = 20;
          let opacity = 0.2;
          const animate = () => {
            radius += 1;
            opacity -= 0.01;
  
            if (radius > 50) {
              radius = 20;
              opacity = 0.2;
            }
  
            pulseMarker.setRadius(radius);
            pulseMarker.setStyle({ fillOpacity: opacity });
            animationFrameId = requestAnimationFrame(animate);
          };
          animationFrameId = requestAnimationFrame(animate);
  
          return () => {
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
          };
        };
  
        const cleanupAnimation = pulseAnimation();
        setMapLoaded(true);
  
        return () => {
          cleanupAnimation();
        };
      } catch (error) {
        console.error("Error loading map:", error);
      }
    };
  
    loadMap();
  
    return cleanupMap;
  }, [latitude, longitude, isValidCoordinate]);
  

  return (
    <div className="bg-gray-900 min-h-screen text-gray-200 font-mono">
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header with time */}
        <div className="flex justify-between items-center mb-6 border-b border-blue-800 pb-4">
          <h1 className="text-2xl font-bold text-cyan-400">SOS TRACKER</h1>
          <div className="text-xl font-bold text-cyan-300">{timeNow}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-blue-900 shadow-md">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {sos?.charging_status === "Charging" ? (
                <BatteryCharging size={24} className="text-green-400" />
              ) : (
                <Battery size={24} className={sos?.battery_level && parseInt(sos.battery_level) < 20 ? "text-red-400" : "text-cyan-400"} />
              )}
              <div>
                <div className="text-xs text-gray-400">POWER</div>
                <div className="text-lg text-cyan-300">{sos?.battery_level || "0"}% {sos?.charging_status || "Unknown"}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Signal size={24} className="text-cyan-400" />
              <div>
                <div className="text-xs text-gray-400">STATUS</div>
                <div className="text-lg text-cyan-300">{isValidCoordinate ? "ONLINE" : "ERROR"}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden mb-6 border border-blue-900 shadow-md">
          <div className="bg-blue-900 px-4 py-2 text-lg font-bold flex items-center text-cyan-300">
            <MapPin className="mr-2" /> LOCATION COORDINATES
          </div>
          <div className="p-6 relative">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900 rounded p-3 border border-blue-800">
                <div className="text-xs text-gray-400">LATITUDE</div>
                <div className="text-xl text-cyan-400">{isValidCoordinate ? latitude.toFixed(6) : "Invalid"}</div>
              </div>
              <div className="bg-gray-900 rounded p-3 border border-blue-800">
                <div className="text-xs text-gray-400">LONGITUDE</div>
                <div className="text-xl text-cyan-400">{isValidCoordinate ? longitude.toFixed(6) : "Invalid"}</div>
              </div>
            </div>
            
            <div className="relative h-64 rounded-lg overflow-hidden border border-blue-800">
              {!isValidCoordinate && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-30">
                  <div className="text-red-400 font-bold text-center">
                    <div>COORDINATES ERROR</div>
                    <div className="text-sm mt-2">Valid location data not available</div>
                  </div>
                </div>
              )}
              
              <div ref={mapRef} className="absolute inset-0 w-full h-full z-10"></div>
              
              <div className="absolute inset-0 z-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 opacity-60"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500 opacity-60"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500 opacity-60"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 opacity-60"></div>
                
                <div className="absolute inset-0">
                  <div className="w-full h-full grid grid-cols-8 grid-rows-6">
                    {Array(8).fill(0).map((_, i) => (
                      <div key={`col-${i}`} className="border-r border-cyan-900 opacity-30"></div>
                    ))}
                    {Array(6).fill(0).map((_, i) => (
                      <div key={`row-${i}`} className="border-b border-cyan-900 opacity-30"></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-2 right-2 text-xs bg-blue-900 bg-opacity-90 text-cyan-300 p-1 rounded z-30 font-bold shadow-sm border border-blue-700">
                {isValidCoordinate ? "LIVE TRACK" : "OFFLINE"}
              </div>
            </div>
            
            <div className="mt-4 bg-gray-900 p-3 rounded font-mono text-xs text-gray-300 border border-blue-800 shadow-inner">
              <div className="text-gray-400"> SOS_SIGNAL_ACTIVE: {isValidCoordinate ? "YES" : "NO"}</div>
              <div className="text-gray-400"> COORDINATES_LOCKED: {isValidCoordinate ? `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : "INVALID"}</div>
              <div className="text-gray-400"> POWER_SUPPLY: {sos?.charging_status || "Unknown"}</div>
              <div className="text-gray-400"> BATTERY_REMAINING: {sos?.battery_level || "0"}%</div>
              <div className={isValidCoordinate ? "text-cyan-400 font-bold" : "text-red-400 font-bold"}> 
                {isValidCoordinate ? "LOCATION_TRACKING_ENABLED" : "LOCATION_TRACKING_ERROR"}
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-blue-800 hover:bg-blue-700 text-cyan-300 py-2 px-4 rounded border border-blue-700 transition duration-300 shadow-md">
            SEND BACKUP
          </button>
          <button className="bg-gray-800 hover:bg-gray-700 text-cyan-400 py-2 px-4 rounded border border-blue-900 transition duration-300 shadow-md">
            REFRESH DATA
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPage;