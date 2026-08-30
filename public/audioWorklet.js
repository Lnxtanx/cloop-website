/**
 * AudioWorklet Processor for capturing microphone PCM16 data
 * Runs in a separate audio thread — does not block the main thread
 * 
 * Input: raw audio samples from getUserMedia
 * Output: PCM16 Int16 buffers posted to main thread
 */

class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this._bufferSize = 2048; // samples per chunk
    this._buffer = new Float32Array(this._bufferSize);
    this._writeIndex = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0]; // mono channel

    for (let i = 0; i < channel.length; i++) {
      this._buffer[this._writeIndex++] = channel[i];

      if (this._writeIndex >= this._bufferSize) {
        // Convert Float32 [-1, 1] to Int16 [-32768, 32767]
        const pcm16 = new Int16Array(this._bufferSize);
        for (let j = 0; j < this._bufferSize; j++) {
          const s = Math.max(-1, Math.min(1, this._buffer[j]));
          pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Post the PCM16 buffer to the main thread
        this.port.postMessage({
          type: 'audio_data',
          pcm16: pcm16.buffer,
        }, [pcm16.buffer]);

        // Reset buffer
        this._buffer = new Float32Array(this._bufferSize);
        this._writeIndex = 0;
      }
    }

    return true; // keep processor alive
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);
