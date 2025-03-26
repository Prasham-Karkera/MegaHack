"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as THREE from "three";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig";
import { useUser } from "@clerk/nextjs";
import { useSos } from "@/components/context/SosContext";
import { useRouter } from "next/navigation";
import { useZerodha } from "@/components/context/ZerodhaContext";
import { BellOff, BellRing } from "lucide-react";

const PhantomVoiceInterface = () => {
  const [command, setCommand] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const streamRef = useRef(null);
  const threeContainerRef = useRef(null);
  const sceneRef = useRef(null);
  const recognitionRef = useRef(null);
  const { user, isLoaded } = useUser();
  const { setSos } = useSos();
  const router = useRouter();
  const { setZerodha } = useZerodha();
  const [start, setStart] = useState(false);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isLoadingSos, setIsLoadingSos] = useState(false);
  const [isLoadingZerodha, setIsLoadingZerodha] = useState(false);

  useEffect(() => {
    if (!threeContainerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    threeContainerRef.current.appendChild(renderer.domElement);

    const cityGroup = new THREE.Group();

    for (let i = 0; i < 100; i++) {
      const width = Math.random() * 3 + 0.5;
      const height = Math.random() * 15 + 2;
      const depth = Math.random() * 3 + 0.5;

      const geometry = new THREE.BoxGeometry(width, height, depth);

      const color = new THREE.Color();
      const hue = Math.random() * 0.1 + 0.6;
      const sat = 0.5;
      const light = Math.random() * 0.2 + 0.1;
      color.setHSL(hue, sat, light);

      const material = new THREE.MeshBasicMaterial({ color });
      const building = new THREE.Mesh(geometry, material);

      const spread = 60;
      building.position.x = Math.random() * spread - spread / 2;
      building.position.y = height / 2 - 5;
      building.position.z = Math.random() * -40 - 10;

      if (Math.random() > 0.3) {
        const windowGeometry = new THREE.PlaneGeometry(
          width * 0.8,
          height * 0.8
        );
        const windowMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random(), 1, 0.8),
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        });

        const windows = new THREE.Mesh(windowGeometry, windowMaterial);
        windows.position.z = depth / 2 + 0.01;
        building.add(windows);
      }

      cityGroup.add(building);
    }

    scene.add(cityGroup);

    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.1,
      side: THREE.DoubleSide,
    });

    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -5;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(200, 50, 0xff00ff, 0x00ffff);
    gridHelper.position.y = -5;
    scene.add(gridHelper);

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;

    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50 - 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;

      const hue = Math.random() * 0.2 + 0.5;
      const color = new THREE.Color().setHSL(hue, 1, 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    scene.fog = new THREE.FogExp2(0x000000, 0.02);

    camera.position.z = 15;
    camera.position.y = 5;
    camera.lookAt(0, 0, -10);

    const animate = () => {
      requestAnimationFrame(animate);

      camera.position.y = 5 + Math.sin(Date.now() * 0.0005) * 0.5;

      particles.rotation.y += 0.0005;

      if (isListening && audioLevel > 0) {
        cityGroup.children.forEach((building, index) => {
          if (index % 3 === 0) {
            building.scale.y = 1 + audioLevel * 2;
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    sceneRef.current = { scene, renderer };

    return () => {
      window.removeEventListener("resize", handleResize);
      if (threeContainerRef.current && renderer.domElement) {
        threeContainerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isListening, audioLevel]);

  const setupSpeechRecognition = () => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      console.error("Speech recognition not supported in this browser");
      return null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          setCommand((prev) => prev + " " + finalTranscript);
        } else {
          interimTranscript += transcript;
        }
      }
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    return recognition;
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = setupSpeechRecognition();
    }

    if (recognitionRef.current) {
      recognitionRef.current.start();
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        streamRef.current = stream;
        const audioContext = new (window.AudioContext ||
          window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;

        const audioSource = audioContext.createMediaStreamSource(stream);
        audioSource.connect(analyser);

        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        setIsListening(true);

        const checkAudioLevel = () => {
          if (!isListening) return;

          analyser.getByteFrequencyData(dataArrayRef.current);

          let sum = 0;
          for (let i = 0; i < dataArrayRef.current.length; i++) {
            sum += dataArrayRef.current[i];
          }

          const avgLevel = sum / dataArrayRef.current.length / 255;
          setAudioLevel(avgLevel);

          requestAnimationFrame(checkAudioLevel);
        };

        checkAudioLevel();
      })
      .catch((err) => {
        console.error("Error accessing microphone:", err);
      });
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsListening(false);
    setAudioLevel(0);
  };

  const sendCommand = async () => {
    if (!command.trim()) return;
    if (!isLoaded || !user) {
      console.error("User not authenticated or still loading");
      return;
    }

    // Set loading state before API call
    setIsTransmitting(true);

    const payload = {
      command: command.trim(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      email: user.emailAddresses?.[0].emailAddress || "no-email",
      username: user.username || user.firstName || "Unknown",
    };

    try {
      const response = await fetch("/api/com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to send command");
      }

      const data = await response.json();
      console.log("Response:", data);

      try {
        const userDocRef = doc(db, "user_history", user.id);

        await setDoc(
          userDocRef,
          {
            userId: user.id,
            email: user.emailAddresses?.[0].emailAddress || "no-email",
            username: user.username || user.firstName || "Unknown",
            history: arrayUnion({
              command: command.trim(),
              timestamp: new Date().toISOString(),
              tool_name: data.tool_name || null,
            }),
          },
          { merge: true }
        );

        console.log("Command history saved to Firestore");
      } catch (firestoreError) {
        console.error("Error saving to Firestore:", firestoreError);
      }

      setCommand("");
    } catch (error) {
      console.error("Error sending command:", error);
    } finally {
      // Always reset loading state when done, whether successful or error
      setIsTransmitting(false);
    }
  };

  const fetchSOS = async () => {
    setIsLoadingSos(true);
    try {
      const response = await fetch("/api/sos");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      console.log("SOS data from Next.js API route:", data);
      setSos(data);
      router.push("/location");
    } catch (error) {
      console.error("Error fetching sos:", error);
    } finally {
      setIsLoadingSos(false);
    }
  };

  const fetchZerodha = async () => {
    setIsLoadingZerodha(true);
    try {
      const response = await fetch("/api/zerodha");
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Zerodha data from Next.js API route:", data);
      setZerodha(data);
      router.push("/zerodha");
    } catch (error) {
      console.error("Error fetching zerodha:", error);
    } finally {
      setIsLoadingZerodha(false);
    }
  };

  const fetchfmd = async () => {
    try {
      setStart((prevState) => !prevState);

      const endpoint = !start ? "/api/start" : "/api/stop";

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      console.log(`Successfully called ${endpoint}`);
    } catch (error) {
      console.error(
        `Error fetching from ${!start ? "/api/start" : "/api/stop"}:`,
        error
      );
    }
  };

  const clearCommand = () => {
    setCommand("");
  };

  const GlitchText = ({ text, className }) => {
    const containerRef = useRef(null);

    useEffect(() => {
      if (!containerRef.current) return;

      const tl = gsap.timeline();

      tl.fromTo(
        containerRef.current.querySelectorAll(".gsap-letter"),
        {
          opacity: 0,
          y: (i) => Math.random() * 200 - 100,
          x: (i) => Math.random() * 100 - 50,
          scale: () => Math.random() * 3,
          rotationX: () => Math.random() * 360,
          rotationY: () => Math.random() * 360,
        },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          stagger: {
            each: 0.05,
            from: "random",
          },
          ease: "power3.out",
          duration: 0.7,
        }
      );

      const letters = containerRef.current.querySelectorAll(".gsap-letter");

      letters.forEach((letter, index) => {
        const glitchInterval = setInterval(() => {
          if (Math.random() > 0.7) {
            gsap.to(letter, {
              x: Math.random() * 10 - 5,
              y: Math.random() * 10 - 5,
              skewX: Math.random() * 20 - 10,
              color: Math.random() > 0.5 ? "#00ffff" : "#ff00ff",
              textShadow: `0 0 ${Math.random() * 10 + 5}px ${
                Math.random() > 0.5
                  ? "rgba(0,255,255,0.8)"
                  : "rgba(255,0,255,0.8)"
              }`,
              duration: 0.1,
              ease: "power4.inOut",
              onComplete: () => {
                gsap.to(letter, {
                  x: 0,
                  y: 0,
                  skewX: 0,
                  color: "#00ffff",
                  textShadow:
                    "0 0 10px rgba(0,255,255,0.8), 0 0 20px rgba(0,255,255,0.4)",
                  duration: 0.2,
                  ease: "power4.out",
                });
              },
            });
          }
        }, 1000 + index * 100);

        return () => clearInterval(glitchInterval);
      });

      tl.fromTo(
        ".subtitle",
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
        },
        "-=0.3"
      );

      return () => {
        tl.kill();
      };
    }, []);

    return (
      <div ref={containerRef} className={`relative ${className}`}>
        <div className="relative z-20 flex justify-center">
          {text.split("").map((char, index) => (
            <motion.span
              key={index}
              className="gsap-letter relative inline-block"
              initial={{ color: "#ffffff" }}
              animate={{
                color: "#00ffff",
                textShadow:
                  "0 0 10px rgba(0,255,255,0.8), 0 0 20px rgba(0,255,255,0.4)",
              }}
              transition={{ delay: 0.8 + index * 0.04 }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black">
      <div
        ref={threeContainerRef}
        className="absolute top-0 left-0 w-full h-full overflow-hidden z-0"
      />

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-900/20" />
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(transparent 50%, rgba(255,255,255,0.05) 50%)",
            backgroundSize: "100% 4px",
          }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="absolute bottom-0 h-px w-full bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />
        <div className="absolute left-0 w-px h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent opacity-50" />
        <div className="absolute right-0 w-px h-full bg-gradient-to-b from-transparent via-pink-500 to-transparent opacity-50" />
      </div>

      <div className="relative z-20 h-full flex flex-col items-center justify-center max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <GlitchText
            text="PHANTOM LINK"
            className="text-6xl lg:text-8xl font-black tracking-widest"
          />
          <motion.div
            className="subtitle text-sm lg:text-lg font-mono text-cyan-400 mt-2 uppercase tracking-widest"
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0.6, 1, 0.6],
              textShadow: [
                "0 0 5px rgba(0,255,255,0.5)",
                "0 0 15px rgba(0,255,255,0.8)",
                "0 0 5px rgba(0,255,255,0.5)",
              ],
              x: [0, 1, -1, 2, -2, 0],
            }}
            transition={{
              opacity: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              },
              textShadow: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
              },
              x: {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
          >
            Neural Interface v2.7.7
          </motion.div>
        </div>

        <div className="w-full max-w-4xl bg-gray-900/65 backdrop-blur-sm border border-cyan-500/50 rounded-md p-6 shadow-lg shadow-cyan-900/30">
          <div className="flex flex-col space-y-2">
            <div className="text-xs font-mono text-pink-500 uppercase tracking-wider mb-1">
              NEURAL COMMAND INPUT
            </div>

            <div className="flex items-center gap-3 w-full">
              <div className="flex-1 border border-cyan-700/50 rounded">
                <Input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Speak or type your command..."
                  className="bg-black/70 text-cyan-300 border-none focus:ring-1 focus:ring-pink-500/50 h-12 font-mono"
                  onKeyPress={(e) => e.key === "Enter" && sendCommand()}
                />
              </div>

              <div
                className={`relative cursor-pointer ${
                  isListening ? "animate-pulse" : ""
                }`}
                onClick={toggleListening}
              >
                <div className="w-12 h-12 bg-gray-900 border-2 border-cyan-500 rounded-md flex items-center justify-center overflow-hidden">
                  <div className="flex h-8 items-end space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-gradient-to-t from-pink-600 to-cyan-400"
                        style={{
                          height: `${Math.max(
                            10,
                            audioLevel * 100 * (0.5 + Math.sin(i * 0.8) * 0.5)
                          )}%`,
                          transition: "height 0.1s ease",
                        }}
                      />
                    ))}
                  </div>

                  <svg
                    viewBox="0 0 24 24"
                    className="absolute inset-0 w-full h-full p-3 text-white opacity-80"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <path d="M12 19v4" />
                    <path d="M8 23h8" />
                  </svg>
                </div>

                {isListening && (
                  <div className="absolute inset-0 rounded-md border border-cyan-400 shadow-lg shadow-cyan-500/50 animate-pulse" />
                )}
              </div>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="text-xs font-mono text-cyan-400/80">
                {isListening
                  ? `STATUS: CONNECTED // AUDIO LEVEL: ${Math.floor(
                      audioLevel * 100
                    )}%`
                  : "STATUS: STANDBY // TAP MIC TO INITIALIZE"}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={fetchfmd}
                  className="bg-black border hover:cursor-pointer border-pink-600 text-pink-500 hover:text-white hover:bg-yellow-900/30 transition-colors font-mono uppercase tracking-wider px-4 text-xs h-8 animate-pulse"
                >
                  {start ? <BellRing /> : <BellOff />}
                </Button>
                <Button
                  onClick={fetchZerodha}
                  className="bg-black border hover:cursor-pointer border-orange-600 text-orange-500 hover:text-white hover:bg-yellow-900/30 transition-colors font-mono uppercase tracking-wider px-4 text-xs h-8 animate-pulse"
                  disabled={isLoadingZerodha}
                >
                  {isLoadingZerodha ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-orange-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      LOADING
                    </span>
                  ) : (
                    "Zerodha"
                  )}
                </Button>
                <Button
                  onClick={fetchSOS}
                  className="bg-black border hover:cursor-pointer border-yellow-500 text-yellow-500 hover:text-white hover:bg-yellow-900/30 transition-colors font-mono uppercase tracking-wider px-4 text-xs h-8 animate-pulse"
                  disabled={isLoadingSos}
                >
                  {isLoadingSos ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-yellow-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      SENDING
                    </span>
                  ) : (
                    "SOS"
                  )}
                </Button>

                <Button
                  onClick={clearCommand}
                  className="bg-black border hover:cursor-pointer border-red-500 text-red-500 hover:text-white hover:bg-red-900/30 transition-colors font-mono uppercase tracking-wider px-4 text-xs h-8"
                >
                  CLEAR
                </Button>

                <Button
                  onClick={sendCommand}
                  className="bg-black border hover:cursor-pointer border-pink-500 text-pink-500 hover:text-white hover:bg-pink-900/30 transition-colors font-mono uppercase tracking-wider px-4 text-xs h-8"
                  disabled={!command.trim() || isTransmitting}
                >
                  {isTransmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin mr-2 h-3 w-3 text-pink-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      SENDING
                    </span>
                  ) : (
                    "TRANSMIT"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-4xl grid grid-cols-3 gap-4 mt-4">
          <div className="bg-black/40 border border-cyan-900/50 rounded-sm p-3">
            <div className="text-xs font-mono text-cyan-500/70 uppercase">
              SYSTEM
            </div>
            <div className="text-xs font-mono text-white/80">
              PHANTOM OS v7.9.3
            </div>
          </div>
          <div className="bg-black/40 border border-cyan-900/50 rounded-sm p-3">
            <div className="text-xs font-mono text-cyan-500/70 uppercase">
              NEURAL LINK
            </div>
            <div className="text-xs font-mono text-white/80">
              {isListening ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>
          <div className="bg-black/40 border border-cyan-900/50 rounded-sm p-3">
            <div className="text-xs font-mono text-cyan-500/70 uppercase">
              SECURITY
            </div>
            <div className="text-xs font-mono text-white/80">ENCRYPTED</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhantomVoiceInterface;
