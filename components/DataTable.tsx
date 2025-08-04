'use client'

import { useState, useEffect } from 'react';
import { insertData, getData, updateDeviceToken } from '../lib/supabase';
import { getFCMToken, requestNotificationPermission } from '../lib/firebase';
import { Plus, Bell, Smartphone, CheckCircle, AlertCircle } from 'lucide-react';

interface DataItem {
  id: number;
  name: string;
  description: string;
  created_at: string;
}

export default function DataTable() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [deviceToken, setDeviceToken] = useState<string>('No token');
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  useEffect(() => {
    fetchData();
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const permissionGranted = await requestNotificationPermission();
      setNotificationPermission(permissionGranted ? 'granted' : 'denied');
      
      if (permissionGranted) {
        const token = await getFCMToken();
        if (token) {
          setDeviceToken(token);
          console.log('Device token:', token);
        }
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const fetchData = async () => {
    try {
      const result = await getData();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await insertData({ name: formData.name, description: formData.description, device_token: deviceToken });
      setFormData({ name: '', description: '' });
      await fetchData();
      
      // Show success notification using service worker
      if ('serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification('Data Added', {
            body: `New item "${formData.name}" has been added successfully!`,
            icon: '/icon-192x192.svg',
            badge: '/icon-192x192.svg',
            tag: 'data-added',
            requireInteraction: false
          })
        }).catch(error => {
          console.log('Could not show notification via service worker:', error)
        })
      }
    } catch (error) {
      console.error('Error adding data:', error);
      if (error instanceof Error) {
        if (error.message.includes('Database')) {
          alert('Database error: ' + error.message);
        } else if (error.message.includes('Network')) {
          alert('Network error: ' + error.message);
        } else {
          alert('Error adding data: ' + error.message);
        }
      } else {
        alert('Error adding data');
      }
    }
  };

  const handleUpdateTokens = async () => {
    try {
      const token = await getFCMToken();
      if (token) {
        setDeviceToken(token);
        // Update all records with the new token
        for (const item of data) {
          await updateDeviceToken(item.id, token);
        }
        alert('Device token updated successfully!');
      }
    } catch (error) {
      console.error('Error updating token:', error);
      alert('Error updating token');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PWA Notification App</h1>
          <p className="text-gray-600">Powerful Progressive Web App with Firebase & Supabase</p>
        </div>



        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Notification Permission */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-2">
              <Bell className={`h-5 w-5 mr-2 ${notificationPermission === 'granted' ? 'text-green-600' : 'text-yellow-600'}`} />
              <span className="font-medium text-gray-700">Notifications</span>
            </div>
            <p className={`text-sm ${notificationPermission === 'granted' ? 'text-green-600' : 'text-yellow-600'}`}>
              {notificationPermission === 'granted' ? 'Enabled' : 'Permission needed'}
            </p>
          </div>

          {/* Device Token */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-2">
              <Smartphone className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-gray-700">Device Token</span>
            </div>
            <p className="text-sm text-gray-600 break-all">
              {deviceToken.length > 50 ? `${deviceToken.substring(0, 50)}...` : deviceToken}
            </p>
          </div>

          {/* Update Token Button */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={handleUpdateTokens}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Update Existing Records
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Data</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter name"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter description"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Data
            </button>
          </form>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Data Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{item.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 