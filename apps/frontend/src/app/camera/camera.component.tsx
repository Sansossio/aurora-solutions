import React, { useEffect } from 'react'
import { environment } from '../../environments/environment'

// eslint-disable-next-line
const JSMpeg = require('@cycjimmy/jsmpeg-player')

export function Camera ({ camera }: { camera: any }) {
  const { proxy } = environment.backend
  const canvasIdCamera = `camera-${camera.name}`

  useEffect(() => {
    const url = `${proxy}/stream/camera?rtsp=${encodeURIComponent(camera.rtspUrl)}`
    void new JSMpeg.Player(
      url,
      {
        canvas: document.getElementById(canvasIdCamera)
      }
    )
  })

  return (
    <div>
      <p>Camera: {camera.name}</p>
      <canvas id={canvasIdCamera}></canvas>
    </div>
  )
}
