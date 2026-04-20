import { useEffect, useState } from 'react';
import axios from 'axios';
import { Activity, X, Zap, Clock, AlertTriangle, ShieldAlert, ActivitySquare } from 'lucide-react';
import { axiosMetrics } from '../utils/axiosSetup';

const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    slowRequests: [],
    duplicateCalls: 0,
    averageLatency: 0
  });

  const [toggled, setToggled] = useState(false);
  const [rps, setRps] = useState(0);
  const [extStats, setExtStats] = useState({ blocked: 0, rateLimits: 0 });

  useEffect(() => {
    const urlCount = {};
    const latencies = [];
    const timestamps = [];

    const reqInterceptor = axios.interceptors.request.use(config => {
      const now = Date.now();
      config.metadata = { startTime: now };
      timestamps.push(now);
      
      const urlKey = config.url;
      if (urlCount[urlKey]) {
        urlCount[urlKey]++;
        // We defer state update to avoid massive re-renders on burst requests
        setTimeout(() => {
            setMetrics(m => ({ ...m, duplicateCalls: m.duplicateCalls + 1 }));
        }, 0);
      } else {
        urlCount[urlKey] = 1;
      }
      return config;
    });

    const resInterceptor = axios.interceptors.response.use(
      (response) => {
        const endTime = new Date();
        const duration = endTime - response.config.metadata.startTime;
        latencies.push(duration);
        
        const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;
        
        setMetrics(m => {
          const newSlow = duration > 300 
            ? [{ url: response.config.url.split('?')[0], duration }, ...m.slowRequests].slice(0, 5) 
            : m.slowRequests;
            
          return {
            ...m,
            totalRequests: m.totalRequests + 1,
            averageLatency: Math.round(avg),
            slowRequests: newSlow
          };
        });
        
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const rpsInterval = setInterval(() => {
       const now = Date.now();
       while (timestamps.length > 0 && now - timestamps[0] > 1000) {
          timestamps.shift();
       }
       setRps(timestamps.length);
       setExtStats({ blocked: axiosMetrics.blockedDuplicates, rateLimits: axiosMetrics.rateLimitsHit });
    }, 500);

    return () => {
      axios.interceptors.request.eject(reqInterceptor);
      axios.interceptors.response.eject(resInterceptor);
      clearInterval(rpsInterval);
    };
  }, []);

  if (!toggled) {
    return (
      <button 
        onClick={() => setToggled(true)}
        className="fixed bottom-4 left-4 z-[9999] p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition"
        title="Performance Analytics"
      >
        <Activity className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-80 bg-stone-900 border border-stone-700 shadow-2xl rounded-xl text-white font-sans overflow-hidden text-sm">
        <div className="flex items-center justify-between p-3 border-b border-stone-700 bg-stone-800">
            <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-green-400" />
                <h3 className="font-bold">Performance Debug</h3>
            </div>
            <button onClick={() => setToggled(false)} className="text-stone-400 hover:text-white transition">
                <X className="w-4 h-4" />
            </button>
        </div>
        
        <div className="p-4 space-y-4 font-mono">
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-800 p-3 rounded-lg border border-stone-700 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-stone-400 mb-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Requests</span>
                    </div>
                    <p className="text-xl font-bold">{metrics.totalRequests}</p>
                </div>
                <div className="bg-stone-800 p-3 rounded-lg border border-stone-700 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-stone-400 mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Avg Latency</span>
                    </div>
                    <p className={`text-xl font-bold ${metrics.averageLatency > 300 ? 'text-orange-400' : 'text-green-400'}`}>
                        {metrics.averageLatency}ms
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="bg-stone-800 p-2 rounded-lg border border-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-stone-400">
                        <ActivitySquare className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Live RPS</span>
                    </div>
                    <p className={`text-base font-bold ${rps > 5 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>{rps}/s</p>
                </div>
                <div className="bg-stone-800 p-2 rounded-lg border border-stone-700 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-stone-400">
                        <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">Blocked</span>
                    </div>
                    <p className="text-base font-bold text-orange-400">{extStats.blocked}</p>
                </div>
            </div>

            {extStats.rateLimits > 0 && (
                <div className="bg-red-900/30 text-red-200 p-2 rounded-lg border border-red-800/50 flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider">429 Errors Hit</span>
                    <span className="font-bold text-red-400">{extStats.rateLimits}</span>
                </div>
            )}

            {metrics.duplicateCalls > 0 && (
                <div className="bg-orange-900/30 text-orange-200 p-3 rounded-lg border border-orange-800/50 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-orange-400" />
                    <div>
                        <p className="font-bold text-sm text-orange-400">Duplicate Fetches</p>
                        <p className="text-xs opacity-80 mt-1">Caught {metrics.duplicateCalls} redundant API calls in this session.</p>
                    </div>
                </div>
            )}

            {metrics.slowRequests.length > 0 && (
                <div>
                     <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-2">Slow Queries ({">"}300ms)</h4>
                     <div className="space-y-2">
                        {metrics.slowRequests.map((req, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-red-900/20 text-red-200 p-2 rounded border border-red-900/50">
                                <span className="truncate max-w-[170px] opacity-70" title={req.url}>...{req.url.slice(-25)}</span>
                                <span className="font-bold text-red-400">{req.duration}ms</span>
                            </div>
                        ))}
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PerformanceDashboard;
