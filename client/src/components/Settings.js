import React, { useState, useEffect } from 'react'

function Settings(props) {
  const [devices, setDevices] = useState([])
  const [selectedVideo, setSelectedVideo] = useState(null)

  const getDevices = async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices()
      const vids = allDevices.map((cur, idx) => {
        if (cur.kind === 'videoinput') {
          console.log(cur.getCapabilities())
          return (
            <option key={idx} value={cur.deviceId}>
              {cur.label}
            </option>
          )
        }
        return null
      })
      setDevices(vids)
    } catch (e) {
      console.error(e)
      alert(e.message)
    }
  }

  useEffect(() => {
    getDevices()
  }, [])

  const handleClose = (shouldApply = true) => {
    if (shouldApply) props.requestCamera(selectedVideo)
    props.setWidgetsActive({ ...props.widgetsActive, menu: false })
  }

  return (
    <div className="settings-wrapper">
      <div className="blur" role="button" tabIndex={0} onClick={() => handleClose()} onKeyUp={() => handleClose()} />
      <div className="settings">
        <h3>Settings</h3>
        <div className="settings-list">
          <label htmlFor="video-source">
            Video Source
            <select id="video-source" onChange={e => setSelectedVideo(e.target.value)}>
              {devices}
            </select>
          </label>
        </div>
        <div className="settings-actions">
          <button type="button" onClick={() => handleClose(false)} style={{ borderRight: '1px solid white' }}>
            Cancel
          </button>
          <button type="button" onClick={() => handleClose()}>
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
