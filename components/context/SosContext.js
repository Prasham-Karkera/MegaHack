"use client";
import React, { createContext, useContext, useState } from "react";

const SosContext = createContext();

export const SosProvider = ({ children }) => {
  const [sos, setSos] = useState(null);
  return (
    <SosContext.Provider value={{ sos, setSos }}>
      {children}
    </SosContext.Provider>
  );
};

export const useSos = () => useContext(SosContext);
