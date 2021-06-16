export interface CameraList {
  name: string
  rtsp: {
    url: string
    resolution?: {
      width: number
      height: number
    }
  }
}
