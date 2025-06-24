import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading, connectSpotify, logout } = useAuth();
  const [searchParams] = useSearchParams();
  const [showConnectedAlert, setShowConnectedAlert] = useState(false);

  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      setShowConnectedAlert(true);
      setTimeout(() => setShowConnectedAlert(false), 3000);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isSpotifyConnected = user.connectedServices?.some(
    service => service.service === 'spotify' && service.connected
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Alert for successful connections */}
      {showConnectedAlert && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          Service connected successfully!
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">UniDash</h1>
            
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-gray-700">{user.name}</span>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Connected Services */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Connected Services</h2>
            <div className="space-y-3">
              
              {/* Google */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">G</span>
                  </div>
                  <span className="ml-3">Google</span>
                </div>
                <span className="text-green-600 text-sm">Connected</span>
              </div>

              {/* Spotify */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">S</span>
                  </div>
                  <span className="ml-3">Spotify</span>
                </div>
                {isSpotifyConnected ? (
                  <span className="text-green-600 text-sm">Connected</span>
                ) : (
                  <button
                    onClick={connectSpotify}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Connect
                  </button>
                )}
              </div>
              
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Services Connected:</span>
                <span className="font-semibold">{user.connectedServices?.length || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Login:</span>
                <span className="font-semibold">Just now</span>
              </div>
            </div>
          </div>

          {/* Upcoming Features */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Coming Soon</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Email summaries</li>
              <li>• Calendar insights</li>
              <li>• AI-powered music recommendations</li>
              <li>• Smart task management</li>
              <li>• File search across services</li>
            </ul>
          </div>
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard;