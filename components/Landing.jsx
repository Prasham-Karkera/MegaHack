"use client";
import React, { Suspense, useState, useRef, useMemo, useEffect } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import PhantomLinkText from "./PhantomLinkText";

function CyberSphere() {
  const meshRef = useRef();

  const points = useMemo(() => {
    const count = 2000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const phi = Math.random() * Math.PI * 2;
      const costheta = Math.random() * 2 - 1;
      const theta = Math.acos(costheta);
      const r = 4;

      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      colors[i * 3] = 0;
      colors[i * 3 + 1] = 0;
      colors[i * 3 + 2] = 0.3;
    }

    return { positions, colors };
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
      meshRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.positions.length / 3}
          array={points.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={points.colors.length / 3}
          array={points.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        blending={THREE.AdditiveBlending}
        transparent={true}
        opacity={0.7}
      />
    </points>
  );
}

function RobotModel() {
  const gltf = useLoader(GLTFLoader, "/untitled1.glb");

  return <primitive object={gltf.scene} scale={1} position={[-1, -1, 0]} />;
}

export default function Landing() {
  const [cameraPosition, setCameraPosition] = useState({
    x: -0.5,
    y: 0.5,
    z: 5,
  });
  const orbitControlsRef = useRef(null);
  const lastCameraPosition = useRef(new THREE.Vector3(-0.5, 0.5, 5));
  const lastInteractionTime = useRef(Date.now());

  const RESET_TIMEOUT = 1000;
  const INITIAL_CAMERA_POSITION = { x: -0.5, y: 0.5, z: 5 };

  const smoothResetCamera = () => {
    if (orbitControlsRef.current) {
      const controls = orbitControlsRef.current;
      const camera = controls.object;

      const startPosition = camera.position.clone();
      const targetPosition = new THREE.Vector3(
        INITIAL_CAMERA_POSITION.x,
        INITIAL_CAMERA_POSITION.y,
        INITIAL_CAMERA_POSITION.z
      );

      const duration = 1000;
      const startTime = Date.now();

      const animateReset = () => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easedProgress = 1 - Math.pow(1 - progress, 3);
        camera.position.lerpVectors(
          startPosition,
          targetPosition,
          easedProgress
        );

        controls.update();

        if (progress < 1) {
          requestAnimationFrame(animateReset);
        } else {
          setCameraPosition(INITIAL_CAMERA_POSITION);
          lastCameraPosition.current.copy(
            new THREE.Vector3(
              INITIAL_CAMERA_POSITION.x,
              INITIAL_CAMERA_POSITION.y,
              INITIAL_CAMERA_POSITION.z
            )
          );
        }
      };

      animateReset();
    }
  };

  const handleCameraChange = (e) => {
    if (orbitControlsRef.current) {
      const camera = orbitControlsRef.current.object;
      const currentPosition = camera.position.clone();

      lastInteractionTime.current = Date.now();

      setCameraPosition({
        x: currentPosition.x,
        y: currentPosition.y,
        z: currentPosition.z,
      });
      lastCameraPosition.current.copy(currentPosition);
    }
  };

  useEffect(() => {
    const inactivityCheck = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastInteractionTime.current >= RESET_TIMEOUT) {
        smoothResetCamera();
      }
    }, 1000);

    return () => {
      clearInterval(inactivityCheck);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <Canvas
        camera={{
          position: [cameraPosition.x, cameraPosition.y, cameraPosition.z],
          fov: 50,
        }}
        gl={{
          antialias: true,
          alpha: true,
          clearColor: 0x000000,
        }}
      >
        <color attach="background" args={["black"]} />
        <CyberSphere />
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <Suspense fallback={null}>
          <RobotModel />
        </Suspense>
        <OrbitControls
          ref={orbitControlsRef}
          enableZoom={false}
          enablePan={true}
          onChange={handleCameraChange}
        />
      </Canvas>
      <div
        style={{
          transform: `
            rotate(-23deg) 
            translateX(${-cameraPosition.x * 100}px) 
            translateY(${-cameraPosition.y * 100}px)
          `,
          position: "absolute",
          top: "98vh",
          left: "37vw",
        }}
        className=""
      >
        <PhantomLinkText />
      </div>
    </div>
  );
}
