import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://frbzgrlmybtswumofouj.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyYnpncmxteWJ0c3d1bW9mb3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMDk2MzAsImV4cCI6MjA2OTc4NTYzMH0.hE8tp3f9JAXo7YJ_uq3-vCxXukqgUvQUsesBtNG1ecM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DataItem {
  id: number
  name: string
  description: string
  created_at: string
  device_token?: string
}

export const createTable = async () => {
  const { error } = await supabase.rpc('create_data_table')
  if (error) {
    console.error('Error creating table:', error)
  }
}

export const insertData = async (data: { name: string; description: string; device_token?: string }) => {
  console.log('Inserting data:', data)
  
  const { data: result, error } = await supabase
    .from('data_items')
    .insert([data])
    .select()

  if (error) {
    console.error('Error inserting data:', error)
    throw new Error(`Failed to insert data: ${error.message}`)
  }

  console.log('Data inserted successfully:', result)
  return result
}

export const getData = async () => {
  console.log('Fetching data from Supabase...')
  
  const { data, error } = await supabase
    .from('data_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching data:', error)
    throw new Error(`Failed to fetch data: ${error.message}`)
  }

  console.log('Data fetched successfully:', data)
  return data
}

export const updateDeviceToken = async (id: number, device_token: string) => {
  console.log(`Updating device token for record ${id}:`, device_token.substring(0, 20) + '...')
  
  const { error } = await supabase
    .from('data_items')
    .update({ device_token })
    .eq('id', id)

  if (error) {
    console.error('Error updating device token:', error)
    throw new Error(`Failed to update device token: ${error.message}`)
  }

  console.log(`Device token updated successfully for record ${id}`)
} 