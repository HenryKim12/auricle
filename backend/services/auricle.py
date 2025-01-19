import base64
import os
from concurrent.futures import ThreadPoolExecutor
import threading
import time
from typing import List, Tuple
from pathlib import Path
import math
from flask_cors import CORS, cross_origin

from pydub import AudioSegment
import speech_recognition as sr
from flask import Blueprint, jsonify, request
from huggingface_hub import hf_hub_download
from llama_cpp import Llama

# Create blueprint for the service
auricle_service = Blueprint('auricle_service', __name__)

CORS(auricle_service, resources={
    r"/*": {
        "origins": "*",  # Allow all origins
        "methods": ["OPTIONS", "POST"],  # Allow only specific methods
        "allow_headers": ["Content-Type"]  # Allow specific headers
    }
})

class AudioTranscriptionService:
    def __init__(self, chunk_duration: int = 60000):  # duration in milliseconds (60000 = 1 minute)
        self.chunk_duration = chunk_duration
        self.recognizer = sr.Recognizer()
        self.setup_llm()
        
    def setup_llm(self):
        """Initialize the LLM model for summarization"""
        model_name = "SanctumAI/gemma-2-9b-it-GGUF"
        model_file = "gemma-2-9b-it.Q4_K_S.gguf"
        model_path = hf_hub_download(model_name, filename=model_file)
        self.llm = Llama(
            model_path=model_path,
            n_ctx=20000,
        )

    def split_audio(self, audio_segment: AudioSegment) -> List[AudioSegment]:
        """Split audio into one-minute chunks"""
        chunks = []
        for i in range(0, len(audio_segment), self.chunk_duration):
            chunk = audio_segment[i:i + self.chunk_duration]
            chunks.append(chunk)
        return chunks

    def transcribe_chunk(self, chunk: AudioSegment, chunk_index: int) -> Tuple[int, str]:
        """Transcribe a single audio chunk"""
        # Export chunk to temporary WAV file
        temp_path = f"./services/temp/chunk_{chunk_index}_{threading.get_ident()}.wav"
        chunk.export(temp_path, format="wav")
        
        try:
            with sr.AudioFile(temp_path) as source:
                audio = self.recognizer.record(source)
                text = self.recognizer.recognize_google(audio)
                return chunk_index, text
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def transcribe_parallel(self, audio_path: str) -> str:
        """Transcribe audio file using parallel processing"""
        # Load audio file
        audio = AudioSegment.from_file(audio_path)
        
        # Split into chunks
        chunks = self.split_audio(audio)
        
        # Calculate optimal number of threads
        max_threads = min(len(chunks), os.cpu_count() or 1)
        
        # Transcribe chunks in parallel
        transcribed_chunks = []
        with ThreadPoolExecutor(max_workers=max_threads) as executor:
            future_to_chunk = {
                executor.submit(self.transcribe_chunk, chunk, i): i 
                for i, chunk in enumerate(chunks)
            }
            
            # Collect results
            transcribed_chunks = [None] * len(chunks)
            for future in future_to_chunk:
                chunk_index, text = future.result()
                transcribed_chunks[chunk_index] = text
        
        # Combine all transcriptions
        return " ".join(transcribed_chunks)

    def summarize(self, transcript: str) -> str:
        """Summarize the transcribed text using LLM"""
        prompt = f"Provide summarized notes based on the following text. Only output the notes: {transcript}"
        summary = []
        
        stream = self.llm.create_completion(
            prompt,
            max_tokens=10000,
            stop=["</s>"],
            echo=True,
            stream=True
        )
        
        for output in stream:
            chunk = output["choices"][0]["text"]
            summary.append(chunk)
            
        return "".join(summary)

def convert_to_wav(input_file_path: str, output_dir: str = None) -> str:
    """Convert input audio file to WAV format"""
    if not os.path.exists(input_file_path):
        raise FileNotFoundError(f"Input file not found: {input_file_path}")
    
    # Setup output path
    if output_dir is None:
        output_dir = os.path.dirname(input_file_path)
    
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    
    output_filename = Path(input_file_path).stem + '.wav'
    output_path = str(Path(output_dir) / output_filename)
    
    # Convert audio file
    try:
        audio = AudioSegment.from_file(input_file_path)
        audio.export(output_path, format='wav')
        return output_path
    except Exception as e:
        raise Exception(f"Error converting file: {str(e)}")

# Flask route handler
@auricle_service.route('/', methods=['POST'])
@cross_origin()
def transcribe_and_summarize():
    try:
        # Initialize service
        service = AudioTranscriptionService()
        
        # Get file from request
        filename = request.form.get("filename")
        file_data = base64.b64decode(request.form.get("file"))
        
        # Save temporary file
        temp_path = "./services/temp/fileData.wav"
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        with open(temp_path, "wb") as file:
            file.write(file_data)
        
        try:
            # Process the audio file
            start_time = time.time() 
            transcription = service.transcribe_parallel(temp_path)
            end_time = time.time()
            execution_time = end_time - start_time
            print(f"TRANSCRIPTION execution time: {execution_time} seconds")

            start_time = time.time() 
            summary = service.summarize(transcription)
            end_time = time.time()
            execution_time = end_time - start_time
            print(f"SUMMARY execution time: {execution_time} seconds")
            
            return jsonify({
                "status": "200",
                "message": "Successfully processed audio data",
                "data": {
                    "transcription": transcription,
                    "summary": summary
                }
            })
        
        finally:
            # Clean up temporary file
            if os.path.exists(temp_path):
                os.remove(temp_path)
                
    except Exception as e:
        return jsonify({
            "status": "400",
            "message": str(e)
        })