"use client";
import React, { createContext, useContext, useState } from "react";

const ZerodhaContext = createContext();

export const ZerodhaProvider = ({ children }) => {
  const [zerodha, setZerodha] = useState(null);
  return (
    <ZerodhaContext.Provider value={{ zerodha, setZerodha }}>
      {children}
    </ZerodhaContext.Provider>
  );
};

export const useZerodha = () => useContext(ZerodhaContext);
