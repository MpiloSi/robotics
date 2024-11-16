'use client'

import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Head from 'next/head'

const socket = io()

export default function Page() {
  const [isSorting, setIsSorting] = useState(false)
  const [metrics, setMetrics] = useState({
    objectsSorted: { red: 0, blue: 0, green: 0, yellow: 0 },
    accuracy: 0,
    sortingRate: 0,
    armPosition: 0
  })
  const [cameraFeed, setCameraFeed] = useState('/placeholder-image.svg')
  const [cameraError, setCameraError] = useState(false)

  useEffect(() => {
    socket.on('sortingStatus', (data) => setIsSorting(data.isSorting))
    socket.on('performanceUpdate', setMetrics)
    socket.on('error', (error) => {
      toast.error(error.message)
    })

    const fetchCameraFeed = async () => {
      try {
        const response = await fetch(`http://localhost:5001/video_feed?t=${Date.now()}`)
        if (response.ok) {
          setCameraFeed(`http://localhost:5001/video_feed?t=${Date.now()}`)
          setCameraError(false)
        } else {
          throw new Error('Failed to fetch camera feed')
        }
      } catch (error) {
        console.error('Camera feed error:', error)
        setCameraError(true)
        toast.error('Failed to fetch camera feed')
      }
    }

    const intervalId = setInterval(fetchCameraFeed, 1000)

    return () => {
      socket.off('sortingStatus')
      socket.off('performanceUpdate')
      socket.off('error')
      clearInterval(intervalId)
    }
  }, [])

  const handleStart = async () => {
    try {
      const response = await fetch('/api/start', { method: 'POST' })
      if (response.ok) {
        setIsSorting(true)
        toast.success('Sorting started successfully')
      } else {
        throw new Error('Failed to start sorting')
      }
    } catch (error) {
      console.error('Failed to start sorting', error)
      toast.error('Failed to start sorting')
    }
  }

  const handleStop = async () => {
    try {
      const response = await fetch('/api/stop', { method: 'POST' })
      if (response.ok) {
        setIsSorting(false)
        toast.success('Sorting stopped successfully')
      } else {
        throw new Error('Failed to stop sorting')
      }
    } catch (error) {
      console.error('Failed to stop sorting', error)
      toast.error('Failed to stop sorting')
    }
  }

  return (
    <>
    <Head>
      <title>Robotic Arm Dashboard</title>
    </Head>
    <div className="container mx-auto p-4">
      <ToastContainer />
      <h1 className="text-3xl font-bold mb-6">Robotic Sorting Arm Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Live Camera Feed</CardTitle>
          </CardHeader>
          <CardContent>
            {cameraError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Camera Error!</strong>
                <span className="block sm:inline"> Unable to access the camera feed.</span>
              </div>
            ) : (
              <img
                src={cameraFeed} //"http://localhost:5001/video_feed"
                alt="Camera Feed"
                className="w-full h-auto"
              />

            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button onClick={handleStart} disabled={isSorting}>
                Start Sorting
              </Button>
              <Button onClick={handleStop} disabled={!isSorting} variant="destructive">
                Stop Sorting
              </Button>
            </div>
            <p className="mt-4">Status: {isSorting ? 'Sorting' : 'Idle'}</p>
            <p className="mt-2">Arm Position: {metrics.armPosition}°</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold">Objects Detected</h3>
              <ul>
                <li>Red: {metrics.objectsSorted.red}</li>
                <li>Blue: {metrics.objectsSorted.blue}</li>
                <li>Green: {metrics.objectsSorted.green}</li>
                <li>Yellow: {metrics.objectsSorted.yellow}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Accuracy</h3>
              <p className="text-2xl">{metrics.accuracy.toFixed(2)}%</p>
            </div>
            <div>
              <h3 className="font-semibold">Sorting Rate</h3>
              <p className="text-2xl">{metrics.sortingRate.toFixed(2)} objects/min</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  )
}