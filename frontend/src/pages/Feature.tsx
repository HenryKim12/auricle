import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Box } from '@mui/material'
import { useRef } from 'react'
import Paper from '@mui/material/Paper'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'

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

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
      reader.onload = () => {
        const arrayBuffer = reader.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        let binary = '';
        uint8Array.forEach((byte) => {
          binary += String.fromCharCode(byte);
        });
        resolve(btoa(binary)); // Convert binary string to Base64
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const callfetch = async (file: File) => {
    const formData = new FormData()
    // formData.append('wavfile', file, file.name)

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }

       try {
        // for (let [key, value] of formData.entries()) {
        //     if (value instanceof File) {
        //       console.log(`${key}: ${value.name}, size: ${value.size} bytes, type: ${value.type}`);
        //     } else {
        //       console.log(key, value);
        //     }
        //   }
        const base64String = await convertFileToBase64(file)
        formData.append('fileName', file.name);
        formData.append('fileType', file.type);
        if (typeof base64String === 'string') {
        formData.append('file', base64String); // Append Base64 string to FormData
        }
        const fileBytes = await file.arrayBuffer();

        const byteArray = new Uint8Array(fileBytes);
        
        // Optionally, print only the first 100 bytes to avoid large console logs
        console.log('First 100 bytes:', byteArray.slice(0, 100));

        // Append the array buffer as a byte array (Uint8Array)
        // formData.append('file', base64, file.name);

        // Log the size of the byte array
        console.log('Byte array size:', fileBytes.byteLength);
      const response = await axios.post(
        'http://127.0.0.1:5000/auricle',
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
          <Paper elevation={0} sx={{ padding: '1rem', marginBottom: '1rem' }}>
            <span className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="audio">Upload lecture recording here</Label>
              <Input id="audio" type="file" onChange={handleFileChange} />
            </span>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: '1rem',
                borderRadius: '24px',
                margin: '1rem',
                width: '100%',
              }}
            >
              <Button onClick={recording ? stopRecording : startRecording}>
                {recording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              <Button onClick={handleClick} disabled={loading}>
                Send File to Auracle
              </Button>
              {loading && <p>Loading...</p>}
              {error && <p>{error}</p>}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ padding: '1rem', width: '70%' }}>
            <h2>Summary</h2>
            <Box
              sx={{
                padding: '1rem',
                border: '1px solid #d3d3d3',
                borderRadius: '12px',
                textAlign: 'center',
              }}
            >
              <p>{data ? data : 'No summary available yet...'}</p>
            </Box>
          </Paper>
          <Drawer>
            <DrawerTrigger asChild>
              <Button>Change filters</Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                  <DrawerDescription>
                    This action cannot be undone.
                  </DrawerDescription>
                </DrawerHeader>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Submit</Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
          <Button onClick={goToFeature}>Go Home</Button>
        </Box>
      </span>
    </Paper>
  )
}

export default Feature
