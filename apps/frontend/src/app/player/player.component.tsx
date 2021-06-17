import React from 'react'
import { environment } from '../../environments/environment'

import './player.scss'

// eslint-disable-next-line
const JSMpeg = require('@cycjimmy/jsmpeg-player')

const { proxy } = environment.backend

// Remove this shit
;(module as any).hot.invalidate = () => {
  window.location.reload()
}

export class Player extends React.Component<{ rtspUrl: string, size: string }, Object> {
  private videoWrapperRef: any
  private player: typeof JSMpeg.VideoElement

  componentWillUnmount () {
    this.player?.destroy()
  }

  shouldComponentUpdate (nextProps: any) {
    return nextProps.rtspUrl !== this.props.rtspUrl || nextProps.size !== this.props.size
  }

  componentDidMount () {
    const url = `${proxy}/stream/camera?rtsp=${encodeURIComponent(this.props.rtspUrl)}`
    console.log(this.videoWrapperRef)
    // eslint-disable-next-line
    this.player = new JSMpeg.VideoElement(this.videoWrapperRef, url)
  }

  render () {
    return (
      <div className={`videoWrapper size-${this.props.size}`} ref={videoWrapper => {
        this.videoWrapperRef = videoWrapper
      }}></div>
    )
  }
}
