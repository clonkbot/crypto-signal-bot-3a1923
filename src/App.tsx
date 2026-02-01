import { useState, useEffect, useCallback } from 'react'

// Types
interface XHandle {
  id: string
  handle: string
  displayName: string
  avatar: string
  isActive: boolean
}

interface DetectedTicker {
  id: string
  ticker: string
  handle: string
  timestamp: Date
  postContent: string
  confidence: number
  virality: number
  trend: number
  mentions: number
}

interface Trade {
  id: string
  ticker: string
  type: 'BUY' | 'SELL'
  amount: number
  price: number
  pnl: number
  timestamp: Date
}

interface TradingSettings {
  autoTradeEnabled: boolean
  maxPositionSize: number
  confidenceThreshold: number
  stopLoss: number
  takeProfit: number
}

// Mock data generators
const mockHandles: XHandle[] = [
  { id: '1', handle: '@cobie', displayName: 'Cobie', avatar: '🦁', isActive: true },
  { id: '2', handle: '@inversebrah', displayName: 'inversebrah', avatar: '📊', isActive: true },
  { id: '3', handle: '@0xSisyphus', displayName: 'Sisyphus', avatar: '🪨', isActive: true },
  { id: '4', handle: '@CryptoKaleo', displayName: 'Kaleo', avatar: '🎯', isActive: false },
  { id: '5', handle: '@TheCryptoDog', displayName: 'The Crypto Dog', avatar: '🐕', isActive: true },
]

const tickerOptions = ['$BTC', '$ETH', '$SOL', '$PEPE', '$WIF', '$BONK', '$ARB', '$OP', '$DOGE', '$AVAX', '$MATIC', '$LINK']

const postTemplates = [
  'Just loaded up on {ticker}. This setup is beautiful.',
  '{ticker} looking absolutely primed for a move here',
  'The {ticker} chart is speaking to me rn',
  'If you\'re not paying attention to {ticker}, you\'re ngmi',
  '{ticker} breakout imminent. NFA.',
  'Accumulating more {ticker} at these levels',
  'The {ticker} narrative is just getting started',
  '{ticker} to new ATH? 👀',
]

function generateMockTicker(): DetectedTicker {
  const ticker = tickerOptions[Math.floor(Math.random() * tickerOptions.length)]
  const handle = mockHandles[Math.floor(Math.random() * mockHandles.length)]
  const template = postTemplates[Math.floor(Math.random() * postTemplates.length)]
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    ticker,
    handle: handle.handle,
    timestamp: new Date(),
    postContent: template.replace('{ticker}', ticker),
    confidence: Math.floor(Math.random() * 40) + 60,
    virality: Math.floor(Math.random() * 100),
    trend: Math.floor(Math.random() * 100),
    mentions: Math.floor(Math.random() * 5000) + 100,
  }
}

function generateMockTrade(ticker: string): Trade {
  const isBuy = Math.random() > 0.3
  return {
    id: Math.random().toString(36).substr(2, 9),
    ticker,
    type: isBuy ? 'BUY' : 'SELL',
    amount: Math.floor(Math.random() * 1000) + 100,
    price: Math.random() * 1000 + 10,
    pnl: (Math.random() - 0.4) * 500,
    timestamp: new Date(),
  }
}

// Components
function ConfidenceGauge({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (value / 100) * circumference
  
  const getColor = (v: number) => {
    if (v >= 80) return '#10b981'
    if (v >= 60) return '#06b6d4'
    if (v >= 40) return '#f59e0b'
    return '#ef4444'
  }
  
  return (
    <div className="relative w-32 h-32">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={getColor(value)}
          strokeWidth="8"
          strokeLinecap="round"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            filter: `drop-shadow(0 0 10px ${getColor(value)})`
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold font-mono" style={{ color: getColor(value) }}>
          {value}%
        </span>
        <span className="text-xs text-slate-500 uppercase tracking-wider">Confidence</span>
      </div>
    </div>
  )
}

function ProgressBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${value}%`, 
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
            boxShadow: `0 0 10px ${color}66`
          }}
        />
      </div>
    </div>
  )
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        enabled 
          ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
          : 'bg-slate-700'
      }`}
      style={{ boxShadow: enabled ? '0 0 20px rgba(6, 182, 212, 0.4)' : 'none' }}
    >
      <div
        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
          enabled ? 'left-8' : 'left-1'
        }`}
        style={{ boxShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
      />
    </button>
  )
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
      </div>
      <span className="text-xs text-emerald-400 font-mono uppercase tracking-wider">Live</span>
    </div>
  )
}

function TickerBadge({ ticker }: { ticker: string }) {
  return (
    <span className="ticker-highlight px-2 py-0.5 rounded font-mono text-sm text-cyan-400 font-semibold">
      {ticker}
    </span>
  )
}

function XHandleCard({ handle, onToggle }: { handle: XHandle; onToggle: (id: string) => void }) {
  return (
    <div className={`glass rounded-xl p-3 flex items-center gap-3 transition-all duration-300 ${
      handle.isActive ? 'border-cyan-500/30' : 'opacity-50'
    }`}>
      <div className="text-2xl">{handle.avatar}</div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white truncate">{handle.displayName}</div>
        <div className="text-xs text-slate-400 font-mono">{handle.handle}</div>
      </div>
      <button
        onClick={() => onToggle(handle.id)}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
          handle.isActive 
            ? 'bg-cyan-500/20 text-cyan-400' 
            : 'bg-slate-700 text-slate-500'
        }`}
      >
        {handle.isActive ? '✓' : '○'}
      </button>
    </div>
  )
}

function DetectedTickerCard({ detection }: { detection: DetectedTicker }) {
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }
  
  const highlightTicker = (content: string, ticker: string) => {
    const parts = content.split(ticker)
    return parts.map((part, i) => (
      <span key={i}>
        {part}
        {i < parts.length - 1 && <TickerBadge ticker={ticker} />}
      </span>
    ))
  }
  
  return (
    <div className="glass glass-hover rounded-xl p-4 space-y-3 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-cyan-400 text-sm">{detection.handle}</span>
          <span className="text-slate-500 text-xs">•</span>
          <span className="text-slate-500 text-xs">{timeAgo(detection.timestamp)}</span>
        </div>
        <div className={`px-2 py-0.5 rounded text-xs font-bold ${
          detection.confidence >= 75 ? 'bg-emerald-500/20 text-emerald-400' :
          detection.confidence >= 50 ? 'bg-cyan-500/20 text-cyan-400' :
          'bg-amber-500/20 text-amber-400'
        }`}>
          {detection.confidence}%
        </div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed">
        {highlightTicker(detection.postContent, detection.ticker)}
      </p>
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700/50">
        <div className="text-center">
          <div className="text-xs text-slate-500">Virality</div>
          <div className="text-sm font-mono text-purple-400">{detection.virality}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">Trend</div>
          <div className="text-sm font-mono text-cyan-400">{detection.trend}%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">Mentions</div>
          <div className="text-sm font-mono text-emerald-400">{detection.mentions.toLocaleString()}</div>
        </div>
      </div>
    </div>
  )
}

function TradeCard({ trade }: { trade: Trade }) {
  const isProfitable = trade.pnl >= 0
  
  return (
    <div className="glass rounded-lg p-3 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
        trade.type === 'BUY' ? 'bg-emerald-500/20' : 'bg-red-500/20'
      }`}>
        {trade.type === 'BUY' ? '📈' : '📉'}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-white">{trade.ticker}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trade.type}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          ${trade.amount.toFixed(2)} @ ${trade.price.toFixed(2)}
        </div>
      </div>
      <div className={`font-mono text-sm font-bold ${isProfitable ? 'profit' : 'loss'}`}>
        {isProfitable ? '+' : ''}{trade.pnl.toFixed(2)}
      </div>
    </div>
  )
}

function TickerStrip({ tickers }: { tickers: DetectedTicker[] }) {
  const displayTickers = [...tickers, ...tickers]
  
  return (
    <div className="overflow-hidden bg-slate-900/50 border-y border-slate-800">
      <div className="animate-ticker flex whitespace-nowrap py-2">
        {displayTickers.map((t, i) => (
          <div key={i} className="flex items-center gap-4 px-6">
            <span className="font-mono font-bold text-cyan-400">{t.ticker}</span>
            <span className={`font-mono text-sm ${t.confidence >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {t.confidence}%
            </span>
            <span className="text-slate-600">|</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const [handles, setHandles] = useState<XHandle[]>(mockHandles)
  const [detections, setDetections] = useState<DetectedTicker[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [settings, setSettings] = useState<TradingSettings>({
    autoTradeEnabled: false,
    maxPositionSize: 500,
    confidenceThreshold: 75,
    stopLoss: 5,
    takeProfit: 15,
  })
  const [newHandle, setNewHandle] = useState('')
  const [selectedTicker, setSelectedTicker] = useState<DetectedTicker | null>(null)
  const [totalPnL, setTotalPnL] = useState(0)
  
  // Simulate real-time detections
  useEffect(() => {
    const interval = setInterval(() => {
      const newDetection = generateMockTicker()
      setDetections(prev => [newDetection, ...prev].slice(0, 20))
      
      if (!selectedTicker || Math.random() > 0.7) {
        setSelectedTicker(newDetection)
      }
      
      // Auto-trade if enabled
      if (settings.autoTradeEnabled && newDetection.confidence >= settings.confidenceThreshold) {
        const newTrade = generateMockTrade(newDetection.ticker)
        setTrades(prev => [newTrade, ...prev].slice(0, 10))
        setTotalPnL(prev => prev + newTrade.pnl)
      }
    }, 3000)
    
    return () => clearInterval(interval)
  }, [settings.autoTradeEnabled, settings.confidenceThreshold, selectedTicker])
  
  // Initialize with some data
  useEffect(() => {
    const initialDetections = Array(5).fill(null).map(() => generateMockTicker())
    setDetections(initialDetections)
    setSelectedTicker(initialDetections[0])
    
    const initialTrades = Array(5).fill(null).map(() => {
      const ticker = tickerOptions[Math.floor(Math.random() * tickerOptions.length)]
      return generateMockTrade(ticker)
    })
    setTrades(initialTrades)
    setTotalPnL(initialTrades.reduce((sum, t) => sum + t.pnl, 0))
  }, [])
  
  const toggleHandle = useCallback((id: string) => {
    setHandles(prev => prev.map(h => 
      h.id === id ? { ...h, isActive: !h.isActive } : h
    ))
  }, [])
  
  const addHandle = useCallback(() => {
    if (!newHandle.trim()) return
    const handle = newHandle.startsWith('@') ? newHandle : `@${newHandle}`
    setHandles(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      handle,
      displayName: handle.slice(1),
      avatar: '👤',
      isActive: true,
    }, ...prev])
    setNewHandle('')
  }, [newHandle])
  
  return (
    <div className="min-h-screen bg-slate-950 text-white scan-line noise grid-bg">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="animate-float">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-2xl animate-pulse-glow">
                  ⚡
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  CryptoSignal Bot
                </h1>
                <p className="text-xs text-slate-500 font-mono">AI-Powered Social Trading Terminal</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <LiveIndicator />
              <div className="text-right">
                <div className="text-xs text-slate-500">Total P&L</div>
                <div className={`font-mono font-bold text-lg ${totalPnL >= 0 ? 'profit' : 'loss'}`}>
                  {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Ticker Strip */}
      <TickerStrip tickers={detections} />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column - X Handles */}
          <div className="lg:col-span-3 space-y-4 opacity-0 animate-fade-in-up stagger-1">
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <span>📡</span> Monitored Handles
                </h2>
                <span className="text-xs text-slate-500 font-mono">
                  {handles.filter(h => h.isActive).length} active
                </span>
              </div>
              
              {/* Add Handle Input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newHandle}
                  onChange={(e) => setNewHandle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addHandle()}
                  placeholder="@handle"
                  className="flex-1 bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  onClick={addHandle}
                  className="px-3 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                >
                  +
                </button>
              </div>
              
              {/* Handle List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {handles.map(handle => (
                  <XHandleCard key={handle.id} handle={handle} onToggle={toggleHandle} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Center Column - Analysis & Detections */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Analysis Dashboard */}
            <div className="glass rounded-2xl p-6 opacity-0 animate-fade-in-up stagger-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <span>🎯</span> Signal Analysis
                </h2>
                {selectedTicker && (
                  <TickerBadge ticker={selectedTicker.ticker} />
                )}
              </div>
              
              {selectedTicker ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex justify-center">
                    <ConfidenceGauge value={selectedTicker.confidence} />
                  </div>
                  <div className="space-y-4">
                    <ProgressBar value={selectedTicker.virality} color="#a855f7" label="Virality Score" />
                    <ProgressBar value={selectedTicker.trend} color="#06b6d4" label="Trend Momentum" />
                    <ProgressBar value={Math.min(selectedTicker.mentions / 50, 100)} color="#10b981" label="Social Volume" />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Waiting for signal detection...
                </div>
              )}
              
              {selectedTicker && (
                <div className="mt-6 p-4 bg-slate-800/30 rounded-xl">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <div className="text-xs text-slate-500 mb-1 font-mono">{selectedTicker.handle}</div>
                      <p className="text-slate-300 text-sm">{selectedTicker.postContent}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Live Feed */}
            <div className="glass rounded-2xl p-6 opacity-0 animate-fade-in-up stagger-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <span>📊</span> Live Detection Feed
                </h2>
                <LiveIndicator />
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {detections.slice(0, 8).map((detection) => (
                  <DetectedTickerCard key={detection.id} detection={detection} />
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column - Trading Panel */}
          <div className="lg:col-span-3 space-y-4 opacity-0 animate-fade-in-up stagger-4">
            
            {/* Auto Trading Settings */}
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <span>🤖</span> Auto Trading
                </h2>
                <Toggle 
                  enabled={settings.autoTradeEnabled} 
                  onToggle={() => setSettings(s => ({ ...s, autoTradeEnabled: !s.autoTradeEnabled }))}
                />
              </div>
              
              <div className={`space-y-4 transition-opacity duration-300 ${settings.autoTradeEnabled ? 'opacity-100' : 'opacity-50'}`}>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Max Position Size</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="100"
                      value={settings.maxPositionSize}
                      onChange={(e) => setSettings(s => ({ ...s, maxPositionSize: Number(e.target.value) }))}
                      className="flex-1 accent-cyan-500"
                    />
                    <span className="font-mono text-sm text-cyan-400 w-16 text-right">
                      ${settings.maxPositionSize}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Confidence Threshold</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="50"
                      max="95"
                      step="5"
                      value={settings.confidenceThreshold}
                      onChange={(e) => setSettings(s => ({ ...s, confidenceThreshold: Number(e.target.value) }))}
                      className="flex-1 accent-purple-500"
                    />
                    <span className="font-mono text-sm text-purple-400 w-12 text-right">
                      {settings.confidenceThreshold}%
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Stop Loss</label>
                    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-red-400 text-sm">-</span>
                      <input
                        type="number"
                        value={settings.stopLoss}
                        onChange={(e) => setSettings(s => ({ ...s, stopLoss: Number(e.target.value) }))}
                        className="w-full bg-transparent text-sm font-mono focus:outline-none"
                      />
                      <span className="text-slate-500 text-sm">%</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Take Profit</label>
                    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg px-3 py-2">
                      <span className="text-emerald-400 text-sm">+</span>
                      <input
                        type="number"
                        value={settings.takeProfit}
                        onChange={(e) => setSettings(s => ({ ...s, takeProfit: Number(e.target.value) }))}
                        className="w-full bg-transparent text-sm font-mono focus:outline-none"
                      />
                      <span className="text-slate-500 text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {settings.autoTradeEnabled && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    Bot Active - Monitoring signals
                  </div>
                </div>
              )}
            </div>
            
            {/* Recent Trades */}
            <div className="glass rounded-2xl p-4 opacity-0 animate-fade-in-up stagger-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <span>📈</span> Recent Trades
                </h2>
                <span className="text-xs text-slate-500 font-mono">{trades.length} trades</span>
              </div>
              
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {trades.length > 0 ? (
                  trades.map(trade => (
                    <TradeCard key={trade.id} trade={trade} />
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-500 text-sm">
                    No trades yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-slate-600 text-xs font-mono">
            Requested by @AlexandraLiam3 · Built by @clonkbot
          </p>
        </div>
      </footer>
    </div>
  )
}