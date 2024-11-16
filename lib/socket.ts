import { Server as SocketIOServer } from 'socket.io'
import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { getESP32Status } from './esp32'
import { getObjectDetection } from './objectDetection'

export const initSocket = (server: NetServer) => {
  const io = new SocketIOServer(server)

  io.on('connection', (socket) => {
    console.log('A client connected')

    // Send initial sorting status
    getESP32Status()
      .then((status) => {
        socket.emit('sortingStatus', { isSorting: status.isSorting })
      })
      .catch((error) => {
        console.error('Failed to get initial ESP32 status:', error)
        socket.emit('error', { message: 'Failed to get initial status' })
      })

    // Send performance updates and object detection results
    const interval = setInterval(async () => {
      try {
        const [status, objectDetection] = await Promise.all([
          getESP32Status(),
          getObjectDetection()
        ])

        const performanceData = {
          objectsSorted: objectDetection,
          accuracy: Math.random() * 100,
          sortingRate: Math.random() * 10,
          armPosition: status.armPosition
        }
        socket.emit('performanceUpdate', performanceData)
      } catch (error) {
        console.error('Failed to get updates:', error)
        socket.emit('error', { message: 'Failed to get updates' })
      }
    }, 1000)

    socket.on('disconnect', () => {
      console.log('A client disconnected')
      clearInterval(interval)
    })
  })

  return io
}

export type NextApiResponseServerIO = NextApiRequest & {
  socket: NetServer & {
    server?: NetServer & {
      io?: SocketIOServer
    }
  }
}