"use client";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const Metrics = () => {
  const [isClient, setIsClient] = useState(false);
  const [activeComponent, setActiveComponent] = useState("CPU");
  const [metricsData, setMetricsData] = useState(null);
  const canvasRef = useRef(null);
  const [componentConfig, setComponentConfig] = useState({
    CPU: {
      x: 66,
      y: 3,
      cardX: 57,
      cardY: 4,
      cardWidth: 22,
      cardHeight: 54,
      arrowStartX: 1030,
      arrowStartY: 55,
      arrowEndX: 180,
      arrowEndY: 325,
    },
    GPU: {
      x: 50,
      y: 32,
      cardX: 41,
      cardY: 65,
      cardWidth: 21,
      cardHeight: 26,
      arrowStartX: 770,
      arrowStartY: 500,
      arrowEndX: 200,
      arrowEndY: 340,
    },
    BAT: {
      x: 40,
      y: 13.5,
      cardX: 31,
      cardY: 26,
      cardWidth: 24,
      cardHeight: 26,
      arrowStartX: 620,
      arrowStartY: 220,
      arrowEndX: 140,
      arrowEndY: 390,
    },
  });

  useEffect(() => {
    if (!isClient || !canvasRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000814, 1);

    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5;

      colors[i * 3] = 0.05 + Math.random() * 0.1;
      colors[i * 3 + 1] = 0.3 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.5 + Math.random() * 0.5;

      sizes[i] = Math.random() * 5;
    }

    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particleGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
    particleGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    camera.position.z = 5;

    const animate = () => {
      requestAnimationFrame(animate);

      particles.rotation.x += 0.0003;
      particles.rotation.y += 0.0005;

      const positions = particles.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 2] += 0.003;
        if (positions[i3 + 2] > 5) {
          positions[i3 + 2] = -5;
        }
      }
      particles.geometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      scene.remove(particles);
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [isClient]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/metrics.json");
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        console.log("Metrics data from Next.js API route:", data);
        setMetricsData(data);
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchMetrics();
  }, [metricsData]);

  useEffect(() => {
    console.log("Updated metricsData state:", metricsData);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getArrowPath = (component) => {
    const { arrowStartX, arrowStartY, arrowEndX, arrowEndY } =
      componentConfig[component];

    const midX1 = arrowStartX + (arrowEndX - arrowStartX) * 0.33;
    const midY1 = arrowStartY - 60;

    const midX2 = arrowStartX + (arrowEndX - arrowStartX) * 0.66;
    const midY2 = arrowStartY + 40;

    return `M ${arrowStartX} ${arrowStartY} 
            C ${midX1} ${midY1}, 
              ${midX2} ${midY2}, 
              ${arrowEndX} ${arrowEndY}`;
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days}d ${hours % 24}h ${minutes % 60}m`;
  };

  const renderComponentCard = (component) => {
    if (!metricsData) return null;
    const { cardX, cardY, cardWidth, cardHeight } = componentConfig[component];

    return (
      <div
        key={`card-${component}`}
        className="absolute bg-gray-900 bg-opacity-90 rounded-lg p-4 border-l-4 border-cyan-500 shadow-lg"
        style={{
          left: `${cardX}vw`,
          top: `${cardY}vh`,
          width: `${cardWidth}vw`,
          height: `${cardHeight}vh`,
          zIndex: 5,
        }}
        onClick={() => setActiveComponent(component)}
      >
        <h3 className="text-cyan-400 text-lg font-bold mb-2">
          {component} Metrics
        </h3>

        {component === "CPU" && (
          <div className="text-white text-sm">
            <div className="mb-1">
              Load:{" "}
              <span className="text-cyan-400">
                {metricsData["CPU Metrics"].Load.join(" | ")}
              </span>
            </div>
            <div className="mb-1">
              Time Range:{" "}
              <span className="text-cyan-400">
                {metricsData["CPU Metrics"]["CPU Usage"].Details["Time Range"]}
              </span>
            </div>
            <div className="mb-1">
              From:{" "}
              <span className="text-cyan-400">
                {metricsData["CPU Metrics"]["CPU Usage"].From}
              </span>
            </div>
            <div className="mb-1">
              To:{" "}
              <span className="text-cyan-400">
                {metricsData["CPU Metrics"]["CPU Usage"].To}
              </span>
            </div>

            <div className="mt-2 mb-1 font-semibold text-cyan-400">
              Top Processes:
            </div>

            {Object.entries(
              metricsData["CPU Metrics"]["CPU Usage"].Details.Processes
            ).map(([process, data], index) => (
              <div key={index} className="pl-2 mb-2 border-l-2 border-cyan-800">
                <div className="font-medium text-cyan-300">
                  {process.split("/")[1]}
                </div>
                <div className="flex justify-between">
                  <span>
                    User: <span className="text-cyan-400">{data.User}</span>
                  </span>
                  <span>
                    Kernel: <span className="text-cyan-400">{data.Kernel}</span>
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  {/* <span>
                    Minor Faults:{" "}
                    {
                      metricsData["CPU Metrics"]["CPU Usage"].Details.Processes[
                        "1564/system_server"
                      ]["Faults"].Minor
                    }
                  </span> */}
                  {/* <span>
                    Major Faults:{" "}
                    {
                      metricsData["CPU Metrics"]["CPU Usage"].Details.Processes[
                        "1564/system_server"
                      ]["Faults"].Major
                    }
                  </span> */}
                  <span>Minor Faults: {data.Faults.Minor}</span>
                  <span>Major Faults: {data.Faults.Major}</span>
                </div>
              </div>
            ))}

            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-cyan-400 h-2 rounded-full"
                style={{
                  width: "45%",
                }}
              ></div>
            </div>
          </div>
        )}

        {component === "GPU" && (
          <div className="text-white text-sm">
            <div className="mb-1">
              Uptime:{" "}
              <span className="text-cyan-400">
                {formatTime(metricsData["GPU Metrics"].Uptime)}
              </span>
            </div>
            <div className="mb-1">
              Realtime:{" "}
              <span className="text-cyan-400">
                {formatTime(metricsData["GPU Metrics"].Realtime)}
              </span>
            </div>
            <div className="mb-1">
              Active App:{" "}
              <span className="text-cyan-400">
                {metricsData["GPU Metrics"]["Graphics Info"].App}
              </span>
            </div>
            <div className="mb-1">
              PID:{" "}
              <span className="text-cyan-400">
                {metricsData["GPU Metrics"]["Graphics Info"].PID}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-cyan-400 h-2 rounded-full"
                style={{ width: "42%" }}
              ></div>
            </div>
          </div>
        )}

        {component === "BAT" && (
          <div className="text-white text-sm">
            <div className="mb-1 text-lg">Power Sources:</div>
            <div className="flex flex-wrap gap-2 mb-2">
              <div
                className={`px-2 py-1 rounded-lg text-xs ${
                  !metricsData["Battery Metrics"][
                    "Current Battery Service State"
                  ]["AC Powered"]
                    ? "bg-gray-800 text-gray-400"
                    : "bg-cyan-800 text-white"
                }`}
              >
                AC:{" "}
                {metricsData["Battery Metrics"][
                  "Current Battery Service State"
                ]["AC Powered"]
                  ? "ON"
                  : "OFF"}
              </div>
              <div
                className={`px-2 py-1 rounded-lg text-xs ${
                  !metricsData["Battery Metrics"][
                    "Current Battery Service State"
                  ]["USB Powered"]
                    ? "bg-gray-800 text-gray-400"
                    : "bg-cyan-800 text-white"
                }`}
              >
                USB:{" "}
                {metricsData["Battery Metrics"][
                  "Current Battery Service State"
                ]["USB Powered"]
                  ? "ON"
                  : "OFF"}
              </div>
              <div
                className={`px-2 py-1 rounded-lg text-xs ${
                  !metricsData["Battery Metrics"][
                    "Current Battery Service State"
                  ]["Wireless Powered"]
                    ? "bg-gray-800 text-gray-400"
                    : "bg-cyan-800 text-white"
                }`}
              >
                Wireless:{" "}
                {metricsData["Battery Metrics"][
                  "Current Battery Service State"
                ]["Wireless Powered"]
                  ? "ON"
                  : "OFF"}
              </div>
              <div
                className={`px-2 py-1 rounded-lg text-xs ${
                  !metricsData["Battery Metrics"][
                    "Current Battery Service State"
                  ]["Dock Powered"]
                    ? "bg-gray-800 text-gray-400"
                    : "bg-cyan-800 text-white"
                }`}
              >
                Dock:{" "}
                {metricsData["Battery Metrics"][
                  "Current Battery Service State"
                ]["Dock Powered"]
                  ? "ON"
                  : "OFF"}
              </div>
            </div>
            <div className="mb-1">
              Status:{" "}
              <span className="text-cyan-400">
                {!metricsData["Battery Metrics"][
                  "Current Battery Service State"
                ]["AC Powered"] &&
                !metricsData["Battery Metrics"][
                  "Current Battery Service State"
                ]["USB Powered"] &&
                !metricsData["Battery Metrics"][
                  "Current Battery Service State"
                ]["Wireless Powered"] &&
                !metricsData["Battery Metrics"][
                  "Current Battery Service State"
                ]["Dock Powered"]
                  ? "Discharging"
                  : "Charging"}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-cyan-400 h-2 rounded-full"
                style={{ width: "40%" }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderComponentMarker = (component) => {
    const { x, y } = componentConfig[component];
    const isActive = component === activeComponent;

    return (
      <div
        key={`marker-${component}`}
        style={{
          position: "absolute",
          left: `${x}vw`,
          top: `${y}vw`,
          width: "24px",
          height: "24px",
          zIndex: 20,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: isActive ? "#06B6D4" : "#334155",
          borderRadius: "50%",
        }}
        onClick={() => setActiveComponent(component)}
      >
        <span className="text-white text-xs font-bold">
          {component.substring(0, 3)}
        </span>
      </div>
    );
  };

  return (
    <div className="relative bg-transparent text-white">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      <div className="relative w-full top-7 min-h-[calc(100vh-40px)]">
        {isClient && metricsData && (
          <>
            <div
              className="absolute"
              style={{
                left: "205px",
                top: "43px",
                width: "300px",
                height: "600px",
              }}
            >
              <div className="flex items-center justify-center h-full text-gray-500">
                <Image
                  src="/idc1.png"
                  width={500}
                  height={300}
                  alt="idc"
                  className="scale-[3]"
                />
              </div>
            </div>

            {Object.keys(componentConfig).map((component) =>
              renderComponentCard(component)
            )}

            <svg
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                zIndex: 10,
                pointerEvents: "none",
              }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill="#01fefa" />
                </marker>
              </defs>

              {Object.keys(componentConfig).map((component) => (
                <path
                  key={`arrow-${component}`}
                  d={getArrowPath(component)}
                  fill="none"
                  stroke={component === activeComponent ? "#01fefa" : "#1E3A5F"}
                  strokeWidth={component === activeComponent ? "2" : "1"}
                  strokeDasharray={
                    component === activeComponent ? "none" : "5,5"
                  }
                  markerEnd="url(#arrowhead)"
                />
              ))}
            </svg>

            {Object.keys(componentConfig).map((component) =>
              renderComponentMarker(component)
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Metrics;
