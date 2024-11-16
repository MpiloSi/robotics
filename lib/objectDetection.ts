export async function getObjectDetection() {
    const response = await fetch('http://localhost:5001/detect')
    if (!response.ok) {
      throw new Error('Failed to get object detection results')
    }
    return response.json()
  }