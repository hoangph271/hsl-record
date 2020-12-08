import { useRef, useEffect, useState } from 'react'
import './App.css'

const constraints = {
  audio: false,
  video: true
}

const RECORD_STATE = {
  UN_INITIALIZED: 'UN_INITIALIZED',
  RECORDING: 'RECORDING',
  RECORED: 'RECORED',
}

const RecordStatusText = ({ recordState }) => {
  if (recordState === RECORD_STATE.UN_INITIALIZED) return null

  return (
    <div style={{
      position: 'absolute',
      left: 0,
      right: 0,
    }}>
      {recordState}
    </div>
  )
}

function App() {
  const recordChunks = useRef([])
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recordRef = useRef(null)
  const [isReady, setIsReady] = useState(false)
  const [recordState, setRecordState] = useState(RECORD_STATE.UN_INITIALIZED)

  const handleVideoClicked = () => {
    switch (recordState) {
      case RECORD_STATE.RECORED:
      case RECORD_STATE.UN_INITIALIZED: {
        const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=h264' })
        recordRef.current = mediaRecorder

        mediaRecorder.addEventListener('dataavailable', evt => recordChunks.current.push(evt.data))
        mediaRecorder.addEventListener('stop', evt => {
          const blob = new Blob(recordChunks.current, {
            type: 'video/webm'
          })

          const videoUrl = window.URL.createObjectURL(blob)
          const downloadEl = document.createElement('a')
          downloadEl.download = 'download.mp4'
          downloadEl.href = videoUrl
          downloadEl.target = '_blank'

          downloadEl.click()
          console.info(downloadEl)
        })
        mediaRecorder.start()

        setRecordState(RECORD_STATE.RECORDING)
        break
      }
      case RECORD_STATE.RECORDING: {
        recordRef.current.stop()
        setRecordState(RECORD_STATE.RECORED)
      }
    }
  }

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        streamRef.current = stream
        setIsReady(true)
      })
  }, [])

  useEffect(() => {
    if (!isReady) return

    videoRef.current.srcObject  = streamRef.current
  }, [isReady])

  return (
    <div className="App">
      {isReady ? (
        <div>
          <RecordStatusText recordState={recordState} />
          <video onClick={handleVideoClicked} ref={videoRef} autoPlay style={{ width: '100%' }} />
        </div>
      ) : (
        <header>{'Please allow webcam...!'}</header>
      )}
    </div>
  )
}

export default App
