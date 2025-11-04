# Text-to-Speech using Flite (lightweight and stable)
import subprocess
import asyncio
from livekit.agents.tts import TTS, SynthesizeStream, TTSCapabilities, SynthesizedAudio
from livekit import rtc
import numpy as np
import tempfile
import wave
import uuid
import os


class FliteTTS(TTS):
    def __init__(self, voice: str = "awb"):
        """
        Initialize Flite TTS

        Available voices:
            - slt (female, American) → friendly & soft
            - kal (male, American)   → robotic
            - awb (male, Scottish)   → expressive & friendly ✅
            - rms (male, American)   → deep & formal
        """
        super().__init__(
            capabilities=TTSCapabilities(streaming=False),
            sample_rate=22050,
            num_channels=1,
        )
        self._voice = voice

    def synthesize(self, text: str, *, conn_options=None) -> "FliteSynthesizeStream":
        print(f"[Flite TTS] synthesize() called with text: '{text[:100]}' (voice: {self._voice})")
        return FliteSynthesizeStream(
            text=text,
            sample_rate=self._sample_rate,
            voice=self._voice,
            tts_instance=self,
            conn_options=conn_options,
        )


class FliteSynthesizeStream(SynthesizeStream):
    def __init__(self, text: str, sample_rate: int, voice: str, tts_instance, conn_options=None):
        super().__init__(tts=tts_instance, conn_options=conn_options)
        self._text = text
        self._sample_rate = sample_rate
        self._voice = voice
        self._queue = asyncio.Queue()
        self._task = None

    async def _run(self, output_emitter) -> None:
        """Runs the synthesis asynchronously."""
        await self._run_synthesis()

    async def __anext__(self) -> SynthesizedAudio:
        if self._task is None:
            self._task = asyncio.create_task(self._run_synthesis())

        frame = await self._queue.get()
        if frame is None:
            raise StopAsyncIteration

        return SynthesizedAudio(
            frame=frame,
            request_id=str(uuid.uuid4()),
            is_final=True,
        )

    async def _run_synthesis(self):
        try:
            print(f"[Flite TTS] Synthesizing text: {self._text[:60]}...")
            loop = asyncio.get_event_loop()
            audio_data = await loop.run_in_executor(None, self._synthesize_sync)

            if audio_data is not None and len(audio_data) > 0:
                chunk_size = self._sample_rate // 10  # 100ms chunks
                for i in range(0, len(audio_data), chunk_size):
                    chunk = audio_data[i:i + chunk_size]
                    frame = rtc.AudioFrame(
                        data=chunk.tobytes(),
                        sample_rate=self._sample_rate,
                        num_channels=1,
                        samples_per_channel=len(chunk),
                    )
                    await self._queue.put(frame)

                print(f"[Flite TTS] Generated {len(audio_data)} audio samples successfully.")

        except Exception as e:
            print(f"[Flite TTS ERROR] {e}")
            import traceback
            traceback.print_exc()
        finally:
            await self._queue.put(None)  # signal end

    def _synthesize_sync(self) -> np.ndarray:
        """Run flite synchronously and return audio data."""
        try:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_file:
                temp_path = tmp_file.name

            subprocess.run(
                [
                    "flite",
                    "-voice", self._voice,
                    "-t", self._text,
                    "-o", temp_path
                ],
                check=True,
                capture_output=True,
            )

            with wave.open(temp_path, 'rb') as wav_file:
                sample_rate = wav_file.getframerate()
                n_frames = wav_file.getnframes()
                audio_bytes = wav_file.readframes(n_frames)
                audio_data = np.frombuffer(audio_bytes, dtype=np.int16)

            os.unlink(temp_path)
            return audio_data

        except subprocess.CalledProcessError as e:
            print(f"[Flite TTS ERROR] Command failed: {e}")
            print(f"[Flite TTS ERROR] stderr: {e.stderr.decode() if e.stderr else 'none'}")
            return np.zeros(self._sample_rate, dtype=np.int16)

        except Exception as e:
            print(f"[Flite TTS ERROR] Exception: {e}")
            import traceback
            traceback.print_exc()
            return np.zeros(self._sample_rate, dtype=np.int16)

    async def aclose(self):
        """Close the synthesis stream cleanly."""
        await self._queue.put(None)


def create():
    """Create Flite TTS instance with friendly male voice."""
    return FliteTTS(voice="awb")  # ✅ male, expressive & friendly
