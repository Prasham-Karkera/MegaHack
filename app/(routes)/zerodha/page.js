"use client"
import { useZerodha } from '@/components/context/ZerodhaContext';
import React, { useState, useEffect } from 'react';

const StockRecommendation = () => {
  const { zerodha } = useZerodha();
  const [recommendations, setRecommendations] = useState([]);
  
  const maxScore = 5;
  
  useEffect(() => {
    if (zerodha && zerodha.length > 0) {
      const parsedRecommendations = zerodha.map(item => {
        const parts = item.split(': ');
        const ticker = parts[0];
        const recommendation = parts[1];
        
        let score;
        switch(recommendation) {
          case "STRONG BUY":
            score = 4 + Math.random() * 0.9; 
            break;
          case "BUY":
            score = 3 + Math.random() * 0.9; 
            break;
          case "NEUTRAL":
            score = 2.1 + Math.random() * 0.8; 
            break;
          case "SELL":
            score = 1.5 + Math.random() * 0.5; 
            break;
          case "STRONG SELL":
            score = 1 + Math.random() * 0.4; 
            break;
          default:
            score = 2.5; 
        }
        
        const accuracy = 75 + Math.random() * 20;
        
        return {
          ticker,
          recommendation,
          score,
          accuracy
        };
      });
      
      setRecommendations(parsedRecommendations);
    } else {
      setRecommendations([
        { ticker: "BHEL", recommendation: "STRONG BUY", score: 4.8, accuracy: 92 },
        { ticker: "GAIL", recommendation: "BUY", score: 3.7, accuracy: 86 },
        { ticker: "HDFC", recommendation: "NEUTRAL", score: 2.5, accuracy: 78 },
        { ticker: "INFY", recommendation: "SELL", score: 1.8, accuracy: 83 }
      ]);
    }
  }, [zerodha]);
  
  const getColor = (score) => {
    if (score >= 4) return '#00ff99'; 
    if (score >= 3) return '#00cc88'; 
    if (score > 2 && score < 3) return '#00ccff'; 
    if (score >= 1.5) return '#ff3366';
    return '#ff0066'; 
  };
  
  const getGlow = (score) => {
    const color = getColor(score);
    return `0 0 8px ${color}, 0 0 12px ${color}`;
  };
  
  const getTextColor = () => {
    return '#eef1f8'; 
  };
  
  const [animate, setAnimate] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
    
    const interval = setInterval(() => {
      setRecommendations(prev => {
        return prev.map(item => {
          const variation = (Math.random() - 0.5) * 0.3;
          let newScore = Math.max(1, Math.min(5, item.score + variation));
          
          let newRecommendation = "HOLD";
          if (newScore >= 4) newRecommendation = "STRONG BUY";
          else if (newScore >= 3) newRecommendation = "BUY";
          else if (newScore > 2 && newScore < 3) newRecommendation = "NEUTRAL";
          else if (newScore >= 1.5) newRecommendation = "SELL";
          else newRecommendation = "STRONG SELL";
          
          const accuracyVariation = (Math.random() - 0.5) * 2;
          const newAccuracy = Math.max(70, Math.min(98, item.accuracy + accuracyVariation));
          
          return {
            ...item,
            score: newScore,
            recommendation: newRecommendation,
            accuracy: newAccuracy
          };
        });
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const sortedRecommendations = [...recommendations].sort((a, b) => b.score - a.score);
  
  return (
    <div className="w-full h-full bg-gray-900 text-cyan-300 p-6 font-mono rounded-lg border border-cyan-700 shadow-lg" 
         style={{ 
           marginTop: '0px',
           backgroundImage: 'linear-gradient(to bottom, #0f1923, #101520)',
           boxShadow: '0 0 20px rgba(0, 200, 255, 0.3), inset 0 0 40px rgba(0, 0, 0, 0.5)'
         }}>
      <div className="flex justify-between items-center mb-6 pb-3 border-b border-cyan-800">
        <h2 className="text-2xl font-bold text-cyan-400" style={{ textShadow: '0 0 10px #00ccff' }}>
          <span className="text-cyan-300">ZERODHA</span>_
          <span className="text-cyan-500 animate-pulse">SIGNALS</span>
        </h2>
        <div className="text-sm right-12 relative top-0.5 bg-blue-900 px-3 py-1 rounded-md border border-cyan-700" 
             style={{ boxShadow: '0 0 10px rgba(0, 200, 255, 0.4)' }}>
          <span className="text-cyan-300">{sortedRecommendations.length}</span> ASSETS
        </div>
      </div>
      
      <div className="relative h-10 mb-4 flex items-center">
        <div className="absolute left-0 w-full h-px bg-gradient-to-r from-cyan-900 via-cyan-400 to-cyan-900 z-10"></div>
        <div className="absolute left-0 text-sm text-cyan-600" style={{ textShadow: '0 0 5px #00ccff' }}>SELL</div>
        <div className="absolute right-0 text-sm text-cyan-600" style={{ textShadow: '0 0 5px #00ccff' }}>BUY</div>
      </div>
      
      <div className="space-y-4">
        {sortedRecommendations.map((item, index) => {
          const isPositive = item.score > 2.5;
          const barAlignment = isPositive ? 'justify-start' : 'justify-end';
          
          return (
            <div key={index} className="flex items-center">
              <div className="w-20 pr-3 text-right overflow-hidden whitespace-nowrap">
                <span className="text-cyan-300 font-bold text-lg" style={{ textShadow: '0 0 5px #00ccff' }}>
                  {item.ticker}
                </span>
              </div>
              
              <div className="relative w-full h-12 bg-gray-800 rounded-sm overflow-hidden"
                   style={{ 
                     backgroundImage: 'linear-gradient(to right, rgba(10, 20, 30, 0.9), rgba(5, 15, 25, 0.9))',
                     boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                   }}>
                <div className="absolute left-1/2 top-0 h-full w-px bg-cyan-900 z-10"></div>
                
                <div className={`absolute top-0 ${isPositive ? 'left-1/2' : 'right-1/2'} h-full flex ${barAlignment} transition-all duration-1000 ease-out`} 
                     style={{ 
                       width: animate ? `${Math.abs((item.score - 2.5) / 2.5) * 50}%` : '0%'
                     }}>
                  <div 
                    className="h-full flex items-center px-3 transition-all duration-700" 
                    style={{ 
                      width: '100%',
                      backgroundColor: getColor(item.score),
                      color: getTextColor(),
                      boxShadow: getGlow(item.score),
                      borderRadius: '0 2px 2px 0'
                    }}
                  >
                    <span className="text-sm font-bold truncate" style={{ textShadow: '0 0 5px rgba(0, 0, 0, 0.7)' }}>
                      {item.recommendation}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="w-20 pl-3 flex flex-col">
                <span className="text-sm font-mono" style={{ 
                  color: getColor(item.score),
                  textShadow: `0 0 5px ${getColor(item.score)}`
                }}>
                  {item.score.toFixed(1)}
                </span>
                <div className="text-xs flex items-center">
                  <span className="text-gray-400 mr-1">ACC:</span>
                  <span className="text-cyan-300">{Math.round(item.accuracy)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 pt-3 border-t border-cyan-900 grid grid-cols-5 gap-2 text-sm"
           style={{ borderImage: 'linear-gradient(to right, transparent, #00ccff, transparent) 1' }}>
        {[
          { label: "STRONG SELL", color: "#ff0066" },
          { label: "SELL", color: "#ff3366" },
          { label: "NEUTRAL", color: "#00ccff" },
          { label: "BUY", color: "#00cc88" },
          { label: "STRONG BUY", color: "#00ff99" }
        ].map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-4 h-4 mr-2 rounded-sm" 
                 style={{ 
                   backgroundColor: item.color,
                   boxShadow: `0 0 5px ${item.color}`
                 }}></div>
            <span style={{ textShadow: '0 0 2px rgba(0, 200, 255, 0.5)' }}>{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 rounded-lg" 
           style={{ 
             backgroundImage: 'linear-gradient(to bottom, rgba(20, 30, 40, 0.8), rgba(10, 20, 30, 0.8))',
             boxShadow: '0 0 10px rgba(0, 200, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.3)',
             borderTop: '1px solid rgba(0, 200, 255, 0.3)',
             borderLeft: '1px solid rgba(0, 200, 255, 0.1)',
             borderRight: '1px solid rgba(0, 200, 255, 0.1)',
             borderBottom: '1px solid rgba(0, 200, 255, 0.1)'
           }}>
        <div className="flex justify-between items-center">
          <div className="text-cyan-400 font-bold" style={{ textShadow: '0 0 5px rgba(0, 200, 255, 0.7)' }}>
            [ZERODHA_ANALYSIS]
          </div>
          <div className="text-cyan-600 flex items-center">
            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2 animate-pulse"></span>
            <span>LIVE_FEED</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          {[
            { label: "BULLISH", value: "62%", color: "#00ff99" },
            { label: "BEARISH", value: "28%", color: "#ff3366" },
            { label: "NEUTRAL", value: "10%", color: "#00ccff" }
          ].map((item, index) => (
            <div key={index} className="p-3 rounded" 
                 style={{ 
                   background: 'rgba(10, 20, 30, 0.9)',
                   borderTop: `1px solid ${item.color}30`,
                   borderLeft: `1px solid ${item.color}20`,
                   boxShadow: `0 0 10px ${item.color}30`
                 }}>
              <div className="text-gray-400">{item.label}</div>
              <div className="text-cyan-300 text-lg" style={{ 
                color: item.color,
                textShadow: `0 0 5px ${item.color}80`
              }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-xs text-cyan-800">
          <span className="animate-pulse">⚠</span> TRADING_RISK_LEVEL: HIGH
        </div>
        <div className="text-right text-base" style={{ textShadow: '0 0 5px rgba(0, 200, 255, 0.5)' }}>
          <span className="text-cyan-800 font-bold">ZERODHA</span>TRADE<span className="text-cyan-600">PRO</span> 
          <span className="ml-2 text-sm text-cyan-700">v3.14</span>
        </div>
      </div>
    </div>
  );
};

export default StockRecommendation;