'use client'

import { useState, useEffect } from 'react'
import { Plus, Bell, Copy, Check, RefreshCw } from 'lucide-react'
import { getData, insertData, DataItem, updateDeviceToken } from '@/lib/supabase'
import { requestNotificationPermission, getFCMToken } from '@/lib/firebase'

export default function DataTable() {
  const [data, setData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [deviceToken, setDeviceToken] = useState<string>('')
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default')
  const [copied, setCopied] = useState(false)
  const [updatingTokens, setUpdatingTokens] = useState(false)

  useEffect(() => {
    loadData()
    checkNotificationPermission()
  }, [])

  const loadData = async () => {
    try {
      const result = await getData()
      setData(result || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      const permission = Notification.permission
      setNotificationPermission(permission)
      
      // If permission is already granted, try to get the token
      if (permission === 'granted') {
        getFCMToken().then(token => {
          if (token) {
            setDeviceToken(token)
            console.log('✅ Token generated for existing permission:', token.substring(0, 20) + '...')
          } else {
            console.log('❌ Failed to generate token for existing permission')
          }
        })
      }
    }
  }

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setNotificationPermission('granted')
      const token = await getFCMToken()
      console.log('Generated token:', token)
      if (token) {
        setDeviceToken(token)
      } else {
        console.error('❌ Failed to generate device token even though permission was granted')
        alert('Permission granted but failed to generate device token. Please check the browser console for details.')
      }
    }
  }

  const updateExistingTokens = async () => {
    if (!deviceToken) {
      alert('Please enable notifications first to get a device token.')
      return
    }

    setUpdatingTokens(true)
    try {
      // Update all records that don't have a device token
      const recordsToUpdate = data.filter(item => !item.device_token)
      
      for (const record of recordsToUpdate) {
        await updateDeviceToken(record.id, deviceToken)
        console.log(`Updated record ${record.id} with token`)
      }
      
      await loadData() // Reload data to show updated tokens
      alert(`Updated ${recordsToUpdate.length} records with device token`)
    } catch (error) {
      console.error('Error updating tokens:', error)
      alert('Error updating tokens. Please try again.')
    } finally {
      setUpdatingTokens(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const token = await getFCMToken()
      console.log('Submitting with token:', token)
      
      await insertData({
        ...formData,
        device_token: token || undefined
      })
      
      setFormData({ name: '', description: '' })
      setShowForm(false)
      await loadData()
      
      // Show success notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Data Added', {
          body: `New item "${formData.name}" has been added successfully!`,
          icon: '/icon-192x192.png'
        })
      }
    } catch (error) {
      console.error('Error adding data:', error)
      alert('Error adding data. Please try again.')
    }
  }

  const copyDeviceToken = async () => {
    if (deviceToken) {
      await navigator.clipboard.writeText(deviceToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Data Table</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Data
          </button>
        </div>

        {/* Notification Permission Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={20} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-blue-900">Push Notifications</h2>
          </div>
          
          {notificationPermission === 'default' && (
            <div className="flex items-center gap-4">
              <p className="text-blue-700">Enable push notifications to receive updates when data is added.</p>
              <button
                onClick={handleRequestPermission}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Enable Notifications
              </button>
            </div>
          )}
          
          {notificationPermission === 'granted' && (
            <div className="space-y-2">
              <p className="text-green-700 font-medium">✓ Notifications enabled</p>
              {deviceToken && (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Device Token (for API testing):</p>
                      <p className="text-xs text-gray-600 break-all">{deviceToken}</p>
                    </div>
                    <button
                      onClick={copyDeviceToken}
                      className="ml-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                      title="Copy token"
                    >
                      {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Update existing records button */}
              {data.some(item => !item.device_token) && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-2">
                    Some existing records don't have device tokens. Click below to update them.
                  </p>
                  <button
                    onClick={updateExistingTokens}
                    disabled={updatingTokens}
                    className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-1 rounded text-sm flex items-center gap-1 transition-colors"
                  >
                    {updatingTokens ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} />
                        Update Existing Records
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {notificationPermission === 'denied' && (
            <p className="text-red-700">Notifications are blocked. Please enable them in your browser settings.</p>
          )}
        </div>

        {/* Add Data Form */}
        {showForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Add New Data</h3>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Data
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device Token
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.device_token ? (
                      <div className="max-w-xs">
                        <p className="text-xs break-all">{item.device_token}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">No token</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {data.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No data available. Add some data to get started!
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 