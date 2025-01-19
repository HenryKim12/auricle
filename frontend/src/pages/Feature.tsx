import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Box } from '@mui/material'
import { useRef } from 'react'
import Paper from '@mui/material/Paper'

const Feature = () => {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [file, setFile] = useState<File | null>(null)
  const [recording, setRecording] = useState(false)
  const audioChunksRef = useRef<Blob[]>([])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)

  const goToFeature = () => {
    navigate('/')
  }

  const startRecording = async () => {
    // Get user media (microphone access)
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // Create a MediaRecorder instance to record audio
    const mediaRecorder = new MediaRecorder(stream)

    // Push the audio chunks to the audioChunksRef
    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data)
    }

    // When recording stops, create the audio blob and set the URL
    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
      const audioUrl = URL.createObjectURL(audioBlob)
      setAudioURL(audioUrl)
      audioChunksRef.current = [] // Clear the audio chunks for the next recording
    }

    // Start recording
    mediaRecorder.start()
    mediaRecorderRef.current = mediaRecorder
    setRecording(true)
  }

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      // console.log("here")
      mediaRecorderRef.current.stop() // Stop the recording
      setRecording(false) // Update state
    }
  }

  const callfetch = async (file: File) => {
    const formData = new FormData()
    formData.append('wavfile', file, file.name)

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/asr/',
        formData,
        config,
      )
      console.log('File uploaded successfully', response.data)
    } catch (error) {
      console.error('Error uploading file:', error)
      setError('Error uploading file')
    } finally {
      setLoading(false)
    }
  }

  const handleClick = async () => {
    if (file) {
      setLoading(true)
      await callfetch(file)
    } else {
      setError('Please select a file before submitting.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  return (
    <Paper
      sx={{
        backgroundColor: '#f5faff', // Change to your desired color
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        width: '90vw',
      }}
      elevation={0}
    >
      <span>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh', // Full viewport height
            textAlign: 'center', // Center-align text
            gap: '1rem',
          }}
        >
          <h1 style={{ color: '#003f6a' }}>Lecture Transcriber</h1>
          <p style={{ color: '#6f93ae' }}>
            Record or upload your lecture audio for real-time transcription and
            summarization
          </p>
          <Box>
            <span className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="audio">Upload lecture recording here</Label>
              <Input id="audio" type="file" onChange={handleFileChange} />
            </span>
            <Paper
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
                borderRadius: 1,
                bgcolor: '#ffffff',
                margin: '1rem',
              }}
              elevation={0}
            >
              <Button onClick={recording ? stopRecording : startRecording}>
                {recording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              <Button onClick={handleClick} disabled={loading}>
                Send File to Auracle
              </Button>
              {loading && <p>Loading...</p>}
              {error && <p>{error}</p>}
            </Paper>
          </Box>

          <Button onClick={goToFeature}>Go Home</Button>
        </Box>
      </span>
    </Paper>
  )
}

export default Feature
