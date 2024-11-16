const ESP32_IP = 'http://192.168.1.100' // Replace with your ESP32's IP address
const IS_DEV = process.env.NODE_ENV === 'development'

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    throw error
  }
}

export async function startSorting() {
  if (IS_DEV) {
    return { status: 'Sorting started (mock)' }
  }

  try {
    const response = await fetchWithTimeout(`${ESP32_IP}/start`, { method: 'POST' })
    if (!response.ok) {
      throw new Error('Failed to start sorting')
    }
    return response.json()
  } catch (error) {
    console.error('Error starting sorting:', error)
    throw error
  }
}

export async function stopSorting() {
  if (IS_DEV) {
    return { status: 'Sorting stopped (mock)' }
  }

  try {
    const response = await fetchWithTimeout(`${ESP32_IP}/stop`, { method: 'POST' })
    if (!response.ok) {
      throw new Error('Failed to stop sorting')
    }
    return response.json()
  } catch (error) {
    console.error('Error stopping sorting:', error)
    throw error
  }
}

export async function getESP32Status() {
  if (IS_DEV) {
    return {
      isSorting: Math.random() > 0.5,
      armPosition: Math.floor(Math.random() * 180)
    }
  }

  try {
    const response = await fetchWithTimeout(`${ESP32_IP}/status`)
    if (!response.ok) {
      throw new Error('Failed to get ESP32 status')
    }
    return response.json()
  } catch (error) {
    console.error('Error getting ESP32 status:', error)
    throw error
  }
}