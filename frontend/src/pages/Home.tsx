import { Button } from '@/components/ui/button'
import { Box, Paper } from '@mui/material'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem} from "@/components/ui/dropdown-menu"
import { ArrowRight } from "lucide-react";
import { Typography, Grid2} from "@mui/material";
import { useNavigate } from 'react-router-dom'
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import SchoolIcon from '@mui/icons-material/School';


const Home = () => {
  const navigate = useNavigate()
  const goToFeature = () => {
    navigate('/feature')
  }
  return (
    <Paper
      sx={{
        backgroundColor: '#f5faff', 
        padding: '5px',
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
            height: '100vh', 
            textAlign: 'center', 
            gap: '1rem',
          }}
        >
          <Typography
            variant="h1"
            sx={{
              color: '#003f6a',
              fontFamily: 'Poppins, sans-serif', 
              fontWeight: 'bold', 
              fontSize: '4rem', 
            }}
          >
            Transform Audio into Notes
          </Typography>

          <p style={{ color: '#6f93ae' }}>
            Record or upload your lecture audio for real-time transcription and
            summarization
          </p>

          <Box>
            <span className="Grid w-full max-w-sm items-center gap-1.5">
            <Button onClick={goToFeature} > 
            <ArrowRight /> Start Recording
            </Button>
              
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
              
            </Paper>
          </Box>
          <Grid2 container spacing={4} sx={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <Grid2 xs={12} sm={4}>
              <Paper
                sx={{
                  padding: "100px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  color: "#2c3e50",
                  minHeight: "100px",
                  borderRadius: "16px",
                  flexDirection: 'column'
                }}
                elevation={2}
                >
                <Box
                  sx={{
                    backgroundColor: '#2c3e50',
                    borderRadius: '50%',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <TextSnippetIcon sx={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <Typography variant="h6"> Record Audio</Typography>
                </Box>
              </Paper>
            </Grid2>

            <Grid2 xs={12} sm={4}>
              <Paper
                sx={{
                  padding: "100px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  color: "#2c3e50",
                  minHeight: "100px",
                  borderRadius: "16px",
                  flexDirection: 'column'
                }}
                elevation={2}
              >
                <Box
                  sx={{
                    backgroundColor: '#2c3e50',
                    borderRadius: '50%',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <TextSnippetIcon sx={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}} />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <Typography variant="h6"> Generate Notes</Typography>
                </Box>
              </Paper>
            </Grid2>

            <Grid2 xs={12} sm={4}>
              <Paper
                sx={{
                  padding: "100px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  color: "#2c3e50",
                  minHeight: "100px",
                  borderRadius: "16px",
                  flexDirection: 'column'
                }}
                elevation={2}
              >
                <Box
                  sx={{
                    backgroundColor: '#2c3e50',
                    borderRadius: '50%',
                    padding: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <SchoolIcon sx={{ color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center'}} />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                  <Typography variant="h6">Smart Learning</Typography>
                </Box>
              </Paper>
            </Grid2>
            
          </Grid2>
        </Box>
      </span>
    </Paper>
  )
}

export default Home