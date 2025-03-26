"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
  CalendarIcon,
  SearchIcon,
  TrashIcon,
  ZapIcon,
  Terminal,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  PhoneIcon,
  MessageSquareIcon,
  CloudIcon,
  ShoppingCartIcon,
  MapPinIcon,
  MusicIcon,
  MoreVerticalIcon,
  RepeatIcon,
  CopyIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserHistoryPage() {
  const { user, isLoaded } = useUser();
  const [historyData, setHistoryData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [expandedCommands, setExpandedCommands] = useState({});
  const [highlightedItem, setHighlightedItem] = useState(null);

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      /* Cyberpunk Scrollbar Styling */
      .cyber-scrollbar::-webkit-scrollbar {
        width: 12px;
        height: 12px;
      }
      
      .cyber-scrollbar::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.3);
        border-left: 1px solid rgba(0, 200, 255, 0.2);
        box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
      }
      
      .cyber-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, rgba(0, 255, 255, 0.7), rgba(0, 100, 200, 0.7));
        border-radius: 0;
        box-shadow: 
          0 0 0 1px rgba(0, 0, 0, 0.8),
          inset 0 0 3px rgba(255, 255, 255, 0.5);
      }
      
      .cyber-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(180deg, rgba(0, 255, 255, 1), rgba(255, 50, 50, 0.8));
        box-shadow: 
          0 0 0 1px #000,
          inset 0 0 5px rgba(255, 255, 255, 0.8);
      }
      
      /* Flame animation effect */
      .cyber-scrollbar::-webkit-scrollbar-thumb:active {
        background: linear-gradient(180deg, #ff3, #f50);
        box-shadow: 
          0 0 3px 1px rgba(255, 100, 0, 0.6),
          inset 0 0 10px rgba(255, 200, 0, 0.8);
      }
      
      /* Enhanced cyberpunk panel glow */
      .cyber-panel {
        box-shadow: 
          0 0 5px rgba(0, 200, 255, 0.3),
          0 0 10px rgba(0, 150, 255, 0.1),
          inset 0 0 2px rgba(0, 200, 255, 0.4);
        transition: all 0.3s ease;
      }
      
      .cyber-panel:hover {
        box-shadow: 
          0 0 8px rgba(0, 200, 255, 0.5),
          0 0 15px rgba(0, 150, 255, 0.3),
          inset 0 0 3px rgba(0, 200, 255, 0.6);
      }
      
      /* Glitch animation for elements */
      @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }
      
      .cyber-glitch:hover {
        animation: glitch 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        text-shadow: 
          0 0 5px rgba(0, 255, 255, 0.7),
          0 0 10px rgba(0, 200, 255, 0.5),
          0 0 15px rgba(0, 150, 255, 0.3);
      }
      
      /* Neon edges for items */
      .neon-edge {
        position: relative;
        overflow: hidden;
      }
      
      .neon-edge::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(to right, 
          transparent 0%, 
          rgba(0, 200, 255, 0) 20%, 
          rgba(0, 200, 255, 0.8) 50%, 
          rgba(0, 200, 255, 0) 80%, 
          transparent 100%);
        filter: blur(1px);
        animation: neon-flow 3s infinite linear;
      }
      
      @keyframes neon-flow {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!isLoaded || !user) return;

      try {
        const userEmail = user.emailAddresses?.[0]?.emailAddress;
        const q = query(
          collection(db, "user_history"),
          where("email", "==", userEmail)
        );
        const snapshot = await getDocs(q);

        let processedData = {
          user_id: user.id,
          name: user.fullName || "Unknown User",
          email: userEmail,
          history: [],
        };

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.history && Array.isArray(data.history)) {
            data.history.forEach((item) => {
              const command = item.command || "Unknown Command";
              const timestamp = item.timestamp || new Date().toISOString();

              const subCommands = [];
              if (item.tool_name) {
                subCommands.push({
                  id: `subcmd-${processedData.history.length}-1`,
                  command: `Initialize ${item.tool_name}`,
                  timestamp: timestamp,
                  status: "success",
                });

                subCommands.push({
                  id: `subcmd-${processedData.history.length}-2`,
                  command: `Execute ${command}`,
                  timestamp: timestamp,
                  status: "success",
                });
              } else {
                subCommands.push({
                  id: `subcmd-${processedData.history.length}-1`,
                  command: "Process command",
                  timestamp: timestamp,
                  status: "success",
                });
              }

              processedData.history.push({
                id: `cmd-${processedData.history.length + 1}`.padStart(7, "0"),
                command: command,
                timestamp: timestamp,
                subCommands: subCommands,
                status: "success",
                tool_name: item.tool_name || "Unknown Tool",
              });
            });
          }
        });

        setHistoryData(processedData);
      } catch (error) {
        console.error("Error fetching user history:", error);
      }
    };

    fetchHistory();
  }, [isLoaded, user]);

  const sendCommand = async (commandText) => {
    const commandToSend = commandText || command?.trim();

    if (!commandToSend) return;
    if (!isLoaded || !user) {
      console.error("User not authenticated or still loading");
      return;
    }

    const payload = {
      command: commandToSend,
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
              command: commandToSend,
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
    } catch (error) {
      console.error("Error sending command:", error);
    }
  };

  const highlightRandomItem = () => {
    if (
      !historyData ||
      !historyData.history ||
      historyData.history.length === 0
    )
      return;

    const randomParentIndex = Math.floor(
      Math.random() * historyData.history.length
    );
    const randomParent = historyData.history[randomParentIndex];
    setHighlightedItem(randomParent.id);

    setTimeout(() => setHighlightedItem(null), 700);
  };

  useEffect(() => {
    if (!historyData) return;

    const interval = setInterval(highlightRandomItem, 5000);
    return () => clearInterval(interval);
  }, [historyData,highlightRandomItem]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="">
          <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
          <div className="flex flex-col items-center relative">
            <Terminal className="h-16 w-16 text-cyan-400 animate-pulse mb-4" />
            <div className="text-cyan-400 text-xl font-mono border border-cyan-800 p-4 bg-black">
              <span className="inline-block animate-pulse">Initializing</span>
              <span className="inline-block animate-ping delay-100">.</span>
              <span className="inline-block animate-ping delay-200">.</span>
              <span className="inline-block animate-ping delay-300">.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-red-500 text-xl font-mono border border-red-800 p-4 bg-black">
          <span className="inline-block">ACCESS DENIED</span>
          <span className="inline-block animate-ping delay-100">.</span>
          <span className="inline-block animate-ping delay-200">.</span>
          <span className="inline-block animate-ping delay-300">.</span>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateForComparison = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatSelectedDateDisplay = (date) => {
    if (!date) return "Filter by date";

    return date.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const toggleExpand = (id) => {
    setExpandedCommands((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getCommandIcon = (command) => {
    if (command.toLowerCase().includes("call"))
      return <PhoneIcon className="h-4 w-4 mr-2" />;
    if (command.toLowerCase().includes("message"))
      return <MessageSquareIcon className="h-4 w-4 mr-2" />;
    if (command.toLowerCase().includes("weather"))
      return <CloudIcon className="h-4 w-4 mr-2" />;
    if (
      command.toLowerCase().includes("order") ||
      command.toLowerCase().includes("food")
    )
      return <ShoppingCartIcon className="h-4 w-4 mr-2" />;
    if (
      command.toLowerCase().includes("navigate") ||
      command.toLowerCase().includes("coffee")
    )
      return <MapPinIcon className="h-4 w-4 mr-2" />;
    if (
      command.toLowerCase().includes("music") ||
      command.toLowerCase().includes("play")
    )
      return <MusicIcon className="h-4 w-4 mr-2" />;
    return <ZapIcon className="h-4 w-4 mr-2" />;
  };

  const filteredHistory =
    historyData && selectedDate
      ? historyData.history.filter((item) => {
          const itemDate = new Date(item.timestamp).toISOString().split("T")[0];
          return itemDate === formatDateForComparison(selectedDate);
        })
      : historyData?.history || [];

  return (
    <div className="min-h-screen w-full bg-black overflow-hidden text-cyan-300 p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,200,255,0.1)_0,rgba(0,0,0,0)_70%)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0),rgba(0,200,255,0.05),rgba(0,0,0,0))]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,30,40,0.8)_100%)]"></div>

      <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.2),rgba(0,0,0,0.2)_1px,transparent_1px,transparent_2px)] opacity-20 pointer-events-none"></div>

      <div className="max-w-full relative z-10">
        <header className="mb-8 border-b border-cyan-900/70 pb-4 relative pl-4">
          <div className="absolute -left-4 -top-2 h-12 w-1 bg-cyan-500 animate-pulse"></div>
          <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent relative cyber-glitch">
            USER::HISTORY
            <span className="absolute top-14 right-0 text-xs text-cyan-500 font-mono animate-pulse">
              [SYS.42]
            </span>
          </h1>
          <div className="flex items-center mt-2">
            <div className="h-1 w-4 bg-cyan-500 mr-2 animate-pulse"></div>
            <p className="text-cyan-500 font-mono text-sm">
              <span className="text-cyan-400">{">"}</span> DISPLAYING{" "}
              {filteredHistory.length} OF {historyData?.history?.length || 0}{" "}
              COMMAND SEQUENCES
            </p>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="border-cyan-700 bg-black/70 hover:bg-cyan-950/70 text-cyan-300 flex items-center gap-2 group relative overflow-hidden neon-edge"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-900/20 to-transparent group-hover:translate-x-full transition-all duration-700 ease-in-out"></div>
                <CalendarIcon className="h-4 w-4" />
                {formatSelectedDateDisplay(selectedDate)}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-black/95 border-cyan-700 text-cyan-300 p-0 backdrop-blur-lg cyber-panel">
              <div className="bg-black/90 p-3 w-full">
                <div className="flex justify-between items-center mb-3">
                  <button
                    className="text-cyan-400 hover:text-cyan-300 bg-black/50 border border-cyan-900/50 px-2 py-1 cyber-glitch"
                    onClick={() => {
                      const newDate = new Date(selectedDate || new Date());
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    &lt;
                  </button>

                  <div className="flex gap-2">
                    <select
                      className="bg-black border border-cyan-700 text-cyan-300 p-1 rounded-none cyber-panel text-xs"
                      value={
                        selectedDate
                          ? selectedDate.getMonth()
                          : new Date().getMonth()
                      }
                      onChange={(e) => {
                        const newDate = new Date(selectedDate || new Date());
                        newDate.setMonth(parseInt(e.target.value));
                        setSelectedDate(newDate);
                      }}
                    >
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ].map((month, i) => (
                        <option key={i} value={i}>
                          {month}
                        </option>
                      ))}
                    </select>

                    <select
                      className="bg-black border border-cyan-700 text-cyan-300 p-1 rounded-none cyber-panel text-xs"
                      value={
                        selectedDate
                          ? selectedDate.getFullYear()
                          : new Date().getFullYear()
                      }
                      onChange={(e) => {
                        const newDate = new Date(selectedDate || new Date());
                        newDate.setFullYear(parseInt(e.target.value));
                        setSelectedDate(newDate);
                      }}
                    >
                      {[2024, 2025, 2026].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    className="text-cyan-400 hover:text-cyan-300 bg-black/50 border border-cyan-900/50 px-2 py-1 cyber-glitch"
                    onClick={() => {
                      const newDate = new Date(selectedDate || new Date());
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                    }}
                  >
                    &gt;
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                    <div
                      key={i}
                      className="text-center text-cyan-400 text-xs font-mono"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {(() => {
                    const currentDate = selectedDate || new Date();
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();

                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);

                    const days = [];

                    for (let i = 0; i < firstDay.getDay(); i++) {
                      days.push(
                        <div key={`empty-${i}`} className="h-7 w-7"></div>
                      );
                    }

                    for (let i = 1; i <= lastDay.getDate(); i++) {
                      const dayDate = new Date(year, month, i);
                      const isSelected =
                        selectedDate &&
                        dayDate.getDate() === selectedDate.getDate() &&
                        dayDate.getMonth() === selectedDate.getMonth() &&
                        dayDate.getFullYear() === selectedDate.getFullYear();

                      days.push(
                        <button
                          key={i}
                          className={`h-7 w-7 text-center text-xs font-mono hover:bg-cyan-900/50 border ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-900/30 text-cyan-300"
                              : "border-cyan-900/30 text-cyan-500"
                          } cyber-glitch`}
                          onClick={() => {
                            const newDate = new Date(year, month, i);
                            setSelectedDate(newDate);
                            setIsCalendarOpen(false);
                          }}
                        >
                          {i}
                        </button>
                      );
                    }

                    return days;
                  })()}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {selectedDate && (
            <Button
              variant="outline"
              className="border-cyan-700 bg-black/70 hover:bg-cyan-950/70 text-cyan-300 flex items-center gap-2 group relative overflow-hidden neon-edge"
              onClick={() => setSelectedDate(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-900/20 to-transparent group-hover:translate-x-full transition-all duration-700 ease-in-out"></div>
              <TrashIcon className="h-4 w-4" />
              CLEAR FILTER
            </Button>
          )}
        </div>

        {!historyData || filteredHistory.length === 0 ? (
          <div className="bg-slate-900/30 backdrop-blur-sm border border-cyan-900/50 rounded-lg p-8 text-center cyber-panel">
            <SearchIcon className="mx-auto h-12 w-12 text-cyan-700 mb-4 animate-pulse" />
            <h3 className="text-xl font-semibold text-cyan-400 mb-2 font-mono cyber-glitch">
              NO DATA FOUND
            </h3>
            <p className="text-cyan-600 font-mono">
              SYSTEM SCAN COMPLETE :: NO COMMANDS LOGGED FOR SELECTED TIMEFRAME
            </p>
          </div>
        ) : (
          <div className="bg-slate-900/30 backdrop-blur-sm border border-cyan-900/50 rounded-lg divide-y divide-cyan-900/50 max-h-[calc(100vh-220px)] overflow-y-auto cyber-scrollbar cyber-panel">
            {filteredHistory.map((item) => (
              <div key={item.id} className="relative">
                <div
                  className={`px-4 py-3 cursor-pointer hover:bg-cyan-900/10 flex items-center transition-all duration-200 ${
                    highlightedItem === item.id ? "bg-cyan-900/30" : ""
                  } neon-edge`}
                >
                  <div
                    className={`absolute left-0 top-0 w-1 h-full ${
                      item.status === "success"
                        ? "bg-emerald-500/70"
                        : "bg-red-500/70"
                    }`}
                  ></div>

                  <div
                    className="mr-2 transition-transform duration-300 ease-in-out"
                    onClick={() => toggleExpand(item.id)}
                  >
                    {expandedCommands[item.id] ? (
                      <ChevronDownIcon className="h-5 w-5 text-cyan-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-cyan-400" />
                    )}
                  </div>

                  <div className="flex-1" onClick={() => toggleExpand(item.id)}>
                    <div className="flex items-center">
                      {getCommandIcon(item.command)}
                      <span className="font-mono text-cyan-300 cyber-glitch">
                        {item.command}
                      </span>
                      {item.tool_name && (
                        <Badge className="ml-2 bg-blue-900/50 text-blue-300 border border-blue-700/50 font-mono text-xs">
                          {item.tool_name}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="ml-2 flex items-center gap-4">
                    <span className="text-xs text-cyan-500 font-mono">
                      {formatDate(item.timestamp)}
                    </span>
                    <Badge
                      className={`${
                        item.status === "success"
                          ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700/50"
                          : "bg-red-900/50 text-red-300 border border-red-700/50"
                      } uppercase font-mono text-xs`}
                    >
                      {item.status}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-950/50"
                        >
                          <MoreVerticalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/95 border-cyan-700 text-cyan-300 backdrop-blur-lg cyber-panel">
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-cyan-900/50 focus:bg-cyan-900/50 font-mono text-sm cyber-glitch"
                          onClick={() => sendCommand(item.command)}
                        >
                          <RepeatIcon className="h-4 w-4 mr-2" />
                          Re-execute Command
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer hover:bg-cyan-900/50 focus:bg-cyan-900/50 font-mono text-sm cyber-glitch"
                          onClick={() => {
                            navigator.clipboard.writeText(item.command);
                          }}
                        >
                          <CopyIcon className="h-4 w-4 mr-2" />
                          Copy Command
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    expandedCommands[item.id] ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="bg-black/70 border-t border-cyan-900/30 pl-8 pr-4 py-2">
                    <div className="text-xs text-cyan-600 mb-2 font-mono">
                      EXECUTION DETAILS:
                    </div>
                    <div className="space-y-2">
                      {item.subCommands &&
                        item.subCommands.map((subCmd) => (
                          <div
                            key={subCmd.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            {subCmd.status === "success" ? (
                              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircleIcon className="h-4 w-4 text-red-500" />
                            )}
                            <span className="font-mono text-cyan-400">
                              {subCmd.command}
                            </span>
                            <span className="text-xs text-cyan-600 ml-auto font-mono">
                              {new Date(subCmd.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
