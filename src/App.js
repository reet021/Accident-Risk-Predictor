import React, { useState, useEffect } from "react";
import "./App.css";

// Risk Gauge Component
function RiskGauge({ riskLevel, riskScore }) {
  const getRiskValue = () => {
    const level = riskLevel?.toLowerCase();
    if (level === "high") return 85;
    if (level === "medium") return 50;
    return 20;
  };

  const getRiskColor = () => {
    const level = riskLevel?.toLowerCase();
    if (level === "high") return "#dc3545";
    if (level === "medium") return "#ffc107";
    return "#28a745";
  };

  const value = getRiskValue();
  const color = getRiskColor();
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="risk-gauge-container">
      <svg className="risk-gauge" viewBox="0 0 220 220">
        {/* Background circle */}
        <circle
          cx="110"
          cy="110"
          r="90"
          fill="none"
          stroke="#e0e0e0"
          strokeWidth="20"
        />
        {/* Progress circle */}
        <circle
          cx="110"
          cy="110"
          r="90"
          fill="none"
          stroke={color}
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 110 110)"
          className="gauge-progress"
        />
        {/* Center text */}
        <text x="110" y="100" textAnchor="middle" fill="#333" fontSize="32" fontWeight="700">
          {riskLevel}
        </text>
        <text x="110" y="130" textAnchor="middle" fill="#666" fontSize="14">
          Risk Level
        </text>
      </svg>
    </div>
  );
}

// Cluster Hotspot Display Component
function ClusterHotspot({ cluster }) {
  const getClusterInfo = (clusterNum) => {
    const clusterMap = {
      0: { color: "#28a745", label: "Low Hotspot", bgColor: "#d4edda", textColor: "#155724" },
      1: { color: "#ffc107", label: "Medium Hotspot", bgColor: "#fff3cd", textColor: "#856404" },
      2: { color: "#dc3545", label: "High Hotspot", bgColor: "#f8d7da", textColor: "#721c24" }
    };
    return clusterMap[clusterNum] || clusterMap[0];
  };

  const info = getClusterInfo(cluster);

  return (
    <div className="cluster-hotspot" style={{ 
      background: info.bgColor,
      borderColor: info.color,
      color: info.textColor
    }}>
      <div className="cluster-indicator" style={{ background: info.color }}></div>
      <div className="cluster-content">
        <div className="cluster-label">Hotspot Cluster</div>
        <div className="cluster-value">Cluster {cluster} - {info.label}</div>
      </div>
    </div>
  );
}

// Risk Factors Breakdown Component
function RiskFactorsBreakdown({ formData, riskLevel }) {
  const calculateFactorImpact = () => {
    const factors = [
      {
        name: "Traffic Volume",
        value: (formData.traffic_volume / 8000) * 100,
        icon: "🚗",
        impact: formData.traffic_volume > 5000 ? "high" : formData.traffic_volume > 2000 ? "medium" : "low"
      },
      {
        name: "Weather",
        value: (formData.weather_severity / 5) * 100,
        icon: ["☀️", "☁️", "🌫️", "🌧️", "❄️", "⛈️"][formData.weather_severity],
        impact: formData.weather_severity > 3 ? "high" : formData.weather_severity > 1 ? "medium" : "low"
      },
      {
        name: "Precipitation",
        value: ((formData.rain_1h + formData.snow_1h) / 50) * 100,
        icon: formData.snow_1h > 0 ? "❄️" : formData.rain_1h > 0 ? "🌧️" : "☀️",
        impact: (formData.rain_1h + formData.snow_1h) > 20 ? "high" : (formData.rain_1h + formData.snow_1h) > 5 ? "medium" : "low"
      },
      {
        name: "Time of Day",
        value: (formData.hour / 23) * 100,
        icon: formData.hour < 6 || formData.hour > 20 ? "🌙" : formData.hour < 12 ? "🌅" : "☀️",
        impact: (formData.hour >= 17 && formData.hour <= 19) || (formData.hour >= 7 && formData.hour <= 9) ? "high" : "low"
      }
    ];
    return factors;
  };

  const factors = calculateFactorImpact();

  return (
    <div className="risk-factors">
      <h3>📊 Risk Factors Analysis</h3>
      {factors.map((factor, idx) => (
        <div key={idx} className="factor-item">
          <div className="factor-header">
            <span className="factor-icon">{factor.icon}</span>
            <span className="factor-name">{factor.name}</span>
            <span className={`factor-impact impact-${factor.impact}`}>
              {factor.impact.toUpperCase()}
            </span>
          </div>
          <div className="factor-bar-container">
            <div 
              className={`factor-bar factor-${factor.impact}`}
              style={{ width: `${Math.min(100, factor.value)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}


function App() {
  const [formData, setFormData] = useState({
    traffic_volume: 1000,
    weather_severity: 1,
    clouds_all: 20,
    rain_1h: 0,
    snow_1h: 0,
    hour: 12,
    dayofweek: 2
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [backendStatus, setBackendStatus] = useState("checking");

  // Check backend health on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/health");
        if (response.ok) {
          setBackendStatus("online");
        } else {
          setBackendStatus("error");
        }
      } catch (err) {
        setBackendStatus("offline");
      }
    };
    checkBackend();
    // Check every 10 seconds
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);


  const getRiskColor = (risk) => {
    const riskLower = risk?.toLowerCase();
    if (riskLower === "high") return "#dc3545";
    if (riskLower === "medium") return "#ffc107";
    return "#28a745";
  };

  const getRiskLevel = (risk) => {
    const riskStr = String(risk).toLowerCase();
    if (riskStr.includes("high")) return "High";
    if (riskStr.includes("medium") || riskStr.includes("moderate")) return "Medium";
    return "Low";
  };

  const formatRiskScore = (risk) => {
    // If it's already a number, format it
    if (typeof risk === 'number') {
      return risk.toFixed(2);
    }
    // Try to parse as number
    const numValue = parseFloat(risk);
    if (!isNaN(numValue)) {
      return numValue.toFixed(2);
    }
    // If it's a string label, return it as is
    return String(risk);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Check if backend is reachable first
      if (backendStatus === "offline") {
        throw new Error("Backend server is not running. Please start the backend server on port 5000.");
      }

      const response = await fetch("http://127.0.0.1:5000/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const riskLevel = getRiskLevel(data.risk);
      // Keep original risk value, we'll format it in display
      const enhancedResult = { ...data, riskLevel, timestamp: new Date() };
      setResult(enhancedResult);
      setPredictionHistory([enhancedResult, ...predictionHistory.slice(0, 4)]);
      setBackendStatus("online");
    } catch (err) {
      let errorMessage = "Failed to connect to the server.";
      
      if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
        errorMessage = "Cannot connect to backend server. Please ensure:\n1. Backend is running on port 5000\n2. Run: cd backend && python app.py";
      } else {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setBackendStatus("offline");
      console.error("Prediction error:", err);
    } finally {
      setLoading(false);
    }
  };

  const riskLevel = result ? getRiskLevel(result.risk) : null;

  // Calculate statistics
  const stats = {
    avgTraffic: formData.traffic_volume,
    weatherCondition: ["Clear", "Clouds", "Mist/Fog", "Rain", "Snow", "Thunderstorm"][formData.weather_severity],
    timeOfDay: formData.hour < 6 ? "Night" : formData.hour < 12 ? "Morning" : formData.hour < 18 ? "Afternoon" : "Evening",
    dayName: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][formData.dayofweek]
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1>🚦 Accident Risk Predictor</h1>
          <p>AI-Powered Traffic Safety Analysis</p>
          <div className={`backend-status status-${backendStatus}`}>
            {backendStatus === "online" && "🟢 Backend Connected"}
            {backendStatus === "offline" && "🔴 Backend Offline"}
            {backendStatus === "checking" && "🟡 Checking Connection..."}
            {backendStatus === "error" && "🟠 Backend Error"}
          </div>
        </div>
      </header>

      <div className="main-content">
        <div className="left-panel">
          <div className="card form-card">
            <h2>📊 Input Parameters</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  <span className="label-text">Traffic Volume</span>
                  <span className="label-value">{formData.traffic_volume.toLocaleString()}</span>
                </label>
                <input
                  type="range"
                  name="traffic_volume"
                  min="0"
                  max="8000"
                  value={formData.traffic_volume}
                  onChange={handleChange}
                  className="slider"
                />
                <div className="range-labels">
                  <span>0</span>
                  <span>8000</span>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-text">Weather Severity</span>
                </label>
                <select name="weather_severity" value={formData.weather_severity} onChange={handleChange}>
                  <option value="0">☀️ Clear</option>
                  <option value="1">☁️ Clouds</option>
                  <option value="2">🌫️ Mist / Fog / Haze</option>
                  <option value="3">🌧️ Drizzle / Rain</option>
                  <option value="4">❄️ Snow</option>
                  <option value="5">⛈️ Thunderstorm</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-text">Cloud Coverage</span>
                  <span className="label-value">{formData.clouds_all}%</span>
                </label>
                <input
                  type="range"
                  name="clouds_all"
                  min="0"
                  max="100"
                  value={formData.clouds_all}
                  onChange={handleChange}
                  className="slider"
                />
                <div className="range-labels">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-text">Rainfall (mm/h)</span>
                    <span className="label-value">{formData.rain_1h}mm</span>
                  </label>
                  <input
                    type="range"
                    name="rain_1h"
                    min="0"
                    max="50"
                    value={formData.rain_1h}
                    onChange={handleChange}
                    className="slider"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-text">Snowfall (mm/h)</span>
                    <span className="label-value">{formData.snow_1h}mm</span>
                  </label>
                  <input
                    type="range"
                    name="snow_1h"
                    min="0"
                    max="50"
                    value={formData.snow_1h}
                    onChange={handleChange}
                    className="slider"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-text">Hour of Day</span>
                    <span className="label-value">{String(formData.hour).padStart(2, '0')}:00</span>
                  </label>
                  <input
                    type="range"
                    name="hour"
                    min="0"
                    max="23"
                    value={formData.hour}
                    onChange={handleChange}
                    className="slider"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <span className="label-text">Day of Week</span>
                  </label>
                  <select name="dayofweek" value={formData.dayofweek} onChange={handleChange}>
                    <option value="0">Monday</option>
                    <option value="1">Tuesday</option>
                    <option value="2">Wednesday</option>
                    <option value="3">Thursday</option>
                    <option value="4">Friday</option>
                    <option value="5">Saturday</option>
                    <option value="6">Sunday</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <>
                    <span className="spinner"></span> Analyzing...
                  </>
                ) : (
                  <>
                    🔍 Predict Risk Level
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="error">
                <span className="error-icon">⚠️</span>
                <p>{error}</p>
              </div>
            )}
          </div>

          {result && (
            <div className="card result-card">
              <h2>📈 Prediction Results</h2>
              <div className="risk-display">
                <div className={`risk-badge risk-${riskLevel?.toLowerCase()}`}>
                  <div className="risk-label">Risk Level</div>
                  <div className="risk-value">{riskLevel}</div>
                </div>
              </div>

              <div className="insights">
                <h3>💡 Insights</h3>
                <ul>
                  <li>Traffic volume: {stats.avgTraffic.toLocaleString()} vehicles</li>
                  <li>Weather: {stats.weatherCondition}</li>
                  <li>Time: {stats.timeOfDay} ({stats.dayName})</li>
                  {riskLevel === "High" && <li className="warning">⚠️ High risk conditions detected</li>}
                  {riskLevel === "Low" && <li className="success">✅ Low risk conditions</li>}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="right-panel">
          {result && (
            <>
              <div className="card gauge-card">
                <h2>⚡ Risk Gauge</h2>
                <RiskGauge riskLevel={riskLevel} riskScore={result.risk} />
                <ClusterHotspot cluster={result.cluster} />
              </div>

              <div className="card factors-card">
                <RiskFactorsBreakdown formData={formData} riskLevel={riskLevel} />
              </div>
            </>
          )}

          {!result && (
            <div className="card placeholder-card">
              <div className="placeholder-content">
                <div className="placeholder-icon">📊</div>
                <h3>Visual Analytics</h3>
                <p>Submit a prediction to see risk analysis and visualizations</p>
              </div>
            </div>
          )}

          {predictionHistory.length > 0 && (
            <>
              <div className="card history-card">
                <h2>📋 Recent Predictions</h2>
                <div className="history-list">
                  {predictionHistory.map((pred, idx) => (
                    <div key={idx} className="history-item">
                      <div className="history-risk">
                        <span className={`mini-badge risk-${getRiskLevel(pred.risk).toLowerCase()}`}>
                          {getRiskLevel(pred.risk)}
                        </span>
                      </div>
                      <div className="history-info">
                        <div className="history-time">
                          {pred.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="history-cluster-display">
                          <ClusterHotspot cluster={pred.cluster} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
