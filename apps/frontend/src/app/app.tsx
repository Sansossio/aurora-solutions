import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Camera } from './camera/camera.component'
import { environment } from '../environments/environment'
import { CameraList } from '@aurora-solutions/api-interface'

export function App () {
  const [cameras, setCameras] = useState<CameraList[]>([])

  useEffect(() => {
    if (cameras.length) {
      return
    }
    void (async () => {
      const {
        data: cameras
      } = await axios.get(`${environment.backend.api}/cameras/list`)
      setCameras(cameras)
    })()
  }, [cameras])

  return (
    <>
      {cameras.map(c => (<Camera camera={c} key={c.name} />))}
    </>
  )
}

export default App
