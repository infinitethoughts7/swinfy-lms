'use client';

import { useEffect, useState } from 'react';
import { productionDebug } from '@/lib/production-debug';
import { getTokens, getCurrentUser, isAuthenticated } from '@/lib/auth';

export default function ProductionDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const collectDebugInfo = () => {
      const tokens = getTokens();
      const user = getCurrentUser();
      const authenticated = isAuthenticated();
      
      const info = {
        timestamp: new Date().toISOString(),
        authenticated,
        tokens: {
          access: tokens?.access ? `${tokens.access.substring(0, 20)}...` : 'MISSING',
          refresh: tokens?.refresh ? `${tokens.refresh.substring(0, 20)}...` : 'MISSING',
          accessLength: tokens?.access?.length || 0,
          refreshLength: tokens?.refresh?.length || 0,
        },
        user: user || 'NO USER DATA',
        localStorage: {
          accessToken: typeof window !== 'undefined' ? !!localStorage.getItem('access_token') : false,
          refreshToken: typeof window !== 'undefined' ? !!localStorage.getItem('refresh_token') : false,
          user: typeof window !== 'undefined' ? !!localStorage.getItem('user') : false,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
          currentUrl: typeof window !== 'undefined' ? window.location.href : 'SSR',
        }
      };

      console.log('🔍 PRODUCTION DEBUG PANEL UPDATE:', info);
      setDebugInfo(info);
    };

    collectDebugInfo();
    
    // Update every 5 seconds
    const interval = setInterval(collectDebugInfo, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const runFullDebug = () => {
    console.log('🔍 MANUAL FULL DEBUG TRIGGERED');
    productionDebug.debugAll();
  };

  if (process.env.NODE_ENV !== 'production') {
    return null; // Only show in production
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium shadow-lg hover:bg-red-700"
      >
        
      </button> */}
      
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-2xl p-4 w-96 max-h-96 overflow-y-auto text-xs">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm">Production Debug Info</h3> 
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div>
              <strong>Authenticated:</strong> 
              <span className={debugInfo.authenticated ? 'text-green-600' : 'text-red-600 font-bold'}>
                {debugInfo.authenticated ? ' ✅ YES' : ' ❌ NO'}
              </span>
            </div>
            
            <div>
              <strong>Access Token:</strong> 
              <span className={debugInfo.tokens?.accessLength > 0 ? 'text-green-600' : 'text-red-600 font-bold'}>
                {debugInfo.tokens?.accessLength > 0 ? ` ✅ ${debugInfo.tokens.accessLength} chars` : ' ❌ MISSING'}
              </span>
            </div>
            
            <div>
              <strong>Refresh Token:</strong> 
              <span className={debugInfo.tokens?.refreshLength > 0 ? 'text-green-600' : 'text-red-600 font-bold'}>
                {debugInfo.tokens?.refreshLength > 0 ? ` ✅ ${debugInfo.tokens.refreshLength} chars` : ' ❌ MISSING'}
              </span>
            </div>
            
            <div>
              <strong>User Data:</strong> 
              <span className={debugInfo.user && debugInfo.user !== 'NO USER DATA' ? 'text-green-600' : 'text-red-600 font-bold'}>
                {debugInfo.user && debugInfo.user !== 'NO USER DATA' ? ` ✅ ${debugInfo.user.role || 'Unknown Role'}` : ' ❌ MISSING'}
              </span>
            </div>
            
            <div>
              <strong>Environment:</strong> {debugInfo.environment?.nodeEnv}
            </div>
            
            <div>
              <strong>API URL:</strong> {debugInfo.environment?.apiUrl}
            </div>
            
            <div className="pt-2 border-t">
              <button
                onClick={runFullDebug}
                className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 w-full"
              >
                Run Full Debug in Console
              </button>
            </div>
            
            <div className="text-gray-500 text-xs">
              Last updated: {debugInfo.timestamp}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
