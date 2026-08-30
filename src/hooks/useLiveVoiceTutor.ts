import { useState, useRef, useCallback, useEffect } from 'react'

// ============================================================
// Types
// ============================================================

export interface LiveVoiceTutorState {
  isConnected: boolean
  isAiSpeaking: boolean
  isUserSpeaking: boolean
  sessionTime: number
  error: string | null
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error'
  userTranscript: string
  aiTranscript: string
  micVolume: number
  aiVolume: number
  frequencyData: number[] // 16 frequency bands for visualizer (0.0 to 1.0)
}

interface VoiceMessage {
  type: string
  data?: string
  mimeType?: string
  message?: string
  text?: string
  code?: number
  reason?: string
}

// ============================================================
// Helper Utilities
// ============================================================

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

function getWsUrl(): string {
  if (import.meta.env.VITE_API_BASE_URL) {
    const raw = (import.meta.env.VITE_API_BASE_URL as string).trim().replace(/\/$/, '')
    return raw.replace(/^https:\/\//i, 'wss://').replace(/^http:\/\//i, 'ws://').replace(/\/api$/i, '')
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('cloopapp.com')) {
    return 'wss://api.cloopapp.com'
  }
  return 'ws://localhost:4000'
}

// ============================================================
// Google Gemini Live AudioStreamer (Scheduled PCM16 Web Audio)
// ============================================================

class AudioStreamer {
  public context: AudioContext
  private sampleRate: number = 24000
  private scheduledTime: number = 0
  private gainNode: GainNode
  public analyserNode: AnalyserNode
  private isPlaying: boolean = false
  public onPlayChange?: (isPlaying: boolean) => void
  private activeSources: AudioBufferSourceNode[] = []

  constructor(context: AudioContext) {
    this.context = context
    this.gainNode = this.context.createGain()
    this.analyserNode = this.context.createAnalyser()
    this.analyserNode.fftSize = 64

    this.gainNode.connect(this.analyserNode)
    this.analyserNode.connect(this.context.destination)
  }

  addPCM16(chunk: Uint8Array) {
    if (this.context.state === 'suspended') {
      this.context.resume().catch(() => {})
    }

    const float32 = new Float32Array(chunk.length / 2)
    const dataView = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength)

    for (let i = 0; i < chunk.length / 2; i++) {
      try {
        const int16 = dataView.getInt16(i * 2, true) // Little-endian
        float32[i] = int16 < 0 ? int16 / 32768 : int16 / 32767
      } catch {
        // ignore bounds
      }
    }

    const audioBuffer = this.context.createBuffer(1, float32.length, this.sampleRate)
    audioBuffer.getChannelData(0).set(float32)

    const source = this.context.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.gainNode)

    const currentTime = this.context.currentTime
    if (this.scheduledTime < currentTime) {
      this.scheduledTime = currentTime + 0.04 // 40ms buffer leeway
    }

    source.start(this.scheduledTime)
    this.scheduledTime += audioBuffer.duration
    this.activeSources.push(source)

    if (!this.isPlaying) {
      this.isPlaying = true
      this.onPlayChange?.(true)
    }

    source.onended = () => {
      this.activeSources = this.activeSources.filter((s) => s !== source)
      if (this.context.currentTime >= this.scheduledTime - 0.08) {
        this.isPlaying = false
        this.onPlayChange?.(false)
      }
    }
  }

  stop() {
    this.scheduledTime = 0
    this.activeSources.forEach((s) => {
      try {
        s.stop()
      } catch {}
    })
    this.activeSources = []
    this.isPlaying = false
    this.onPlayChange?.(false)
  }
}

// ============================================================
// Hook: useLiveVoiceTutor
// ============================================================

export function useLiveVoiceTutor(sessionId: number | null) {
  const [state, setState] = useState<LiveVoiceTutorState>({
    isConnected: false,
    isAiSpeaking: false,
    isUserSpeaking: false,
    sessionTime: 0,
    error: null,
    connectionStatus: 'disconnected',
    userTranscript: '',
    aiTranscript: '',
    micVolume: 0,
    aiVolume: 0,
    frequencyData: Array(16).fill(0),
  })

  const wsRef = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioStreamerRef = useRef<AudioStreamer | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const micAnalyserRef = useRef<AnalyserNode | null>(null)
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const isConnectingRef = useRef(false)

  // Timer
  useEffect(() => {
    if (state.isConnected) {
      timerRef.current = setInterval(() => {
        setState((prev) => ({ ...prev, sessionTime: prev.sessionTime + 1 }))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.isConnected])

  // Disconnect cleanly
  const disconnect = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)

    if (scriptNodeRef.current) {
      try {
        scriptNodeRef.current.disconnect()
      } catch {}
      scriptNodeRef.current = null
    }

    if (micStreamRef.current) {
      try {
        micStreamRef.current.getTracks().forEach((t) => t.stop())
      } catch {}
      micStreamRef.current = null
    }

    if (audioStreamerRef.current) {
      audioStreamerRef.current.stop()
      audioStreamerRef.current = null
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close()
      } catch {}
      audioContextRef.current = null
    }

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'User ended session')
      } catch {}
      wsRef.current = null
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      isAiSpeaking: false,
      isUserSpeaking: false,
      connectionStatus: 'disconnected',
      micVolume: 0,
      aiVolume: 0,
      frequencyData: Array(16).fill(0),
    }))
    isConnectingRef.current = false
  }, [])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [disconnect])

  // Dynamic visualizer loop
  const startVisualizerLoop = useCallback(() => {
    const updateFrequencies = () => {
      let bands: number[] = Array(16).fill(0)
      let currentMicVol = 0
      let currentAiVol = 0

      // Read from AI audio analyser
      if (audioStreamerRef.current && state.isAiSpeaking) {
        const analyser = audioStreamerRef.current.analyserNode
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        for (let i = 0; i < 16; i++) {
          const idx = Math.floor((i / 16) * data.length)
          bands[i] = data[idx] / 255
        }
        currentAiVol = bands.reduce((a, b) => a + b, 0) / 16
      }
      // Read from user mic analyser
      else if (micAnalyserRef.current) {
        const analyser = micAnalyserRef.current
        const data = new Uint8Array(analyser.frequencyBinCount)
        analyser.getByteFrequencyData(data)
        for (let i = 0; i < 16; i++) {
          const idx = Math.floor((i / 16) * data.length)
          bands[i] = data[idx] / 255
        }
        currentMicVol = bands.reduce((a, b) => a + b, 0) / 16
      }

      setState((prev) => ({
        ...prev,
        frequencyData: bands,
        micVolume: currentMicVol,
        aiVolume: currentAiVol,
        isUserSpeaking: currentMicVol > 0.05,
      }))

      animFrameRef.current = requestAnimationFrame(updateFrequencies)
    }

    animFrameRef.current = requestAnimationFrame(updateFrequencies)
  }, [state.isAiSpeaking])

  // Connect to backend WebSocket proxy
  const connect = useCallback(async () => {
    if (!sessionId) {
      setState((prev) => ({ ...prev, error: 'No session ID provided' }))
      return
    }

    if (isConnectingRef.current || wsRef.current) return
    isConnectingRef.current = true

    setState((prev) => ({
      ...prev,
      connectionStatus: 'connecting',
      error: null,
      sessionTime: 0,
      userTranscript: '',
      aiTranscript: '',
    }))

    try {
      // 1. Initialise Web AudioContext
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const audioCtx = new AudioCtx({ sampleRate: 16000 })
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume()
      }
      audioContextRef.current = audioCtx

      // 2. Initialise AudioStreamer
      const streamer = new AudioStreamer(audioCtx)
      streamer.onPlayChange = (isPlaying) => {
        setState((prev) => ({ ...prev, isAiSpeaking: isPlaying }))
      }
      audioStreamerRef.current = streamer

      // 3. Setup microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      micStreamRef.current = stream

      const micSource = audioCtx.createMediaStreamSource(stream)
      const micAnalyser = audioCtx.createAnalyser()
      micAnalyser.fftSize = 64
      micSource.connect(micAnalyser)
      micAnalyserRef.current = micAnalyser

      // 4. Setup AudioWorklet / ScriptProcessor for PCM16 audio
      try {
        await audioCtx.audioWorklet.addModule('/audioWorklet.js')
        const workletNode = new AudioWorkletNode(audioCtx, 'audio-capture-processor')
        micSource.connect(workletNode)

        workletNode.port.onmessage = (event) => {
          if (event.data.type === 'audio_data' && wsRef.current?.readyState === WebSocket.OPEN) {
            const pcm16Buffer = event.data.pcm16
            const base64 = arrayBufferToBase64(pcm16Buffer)
            wsRef.current.send(
              JSON.stringify({
                type: 'audio_chunk',
                data: base64,
                mimeType: 'audio/pcm;rate=16000',
              })
            )
          }
        }
      } catch {
        // Fallback to ScriptProcessorNode
        const scriptNode = audioCtx.createScriptProcessor(2048, 1, 1)
        micSource.connect(scriptNode)
        scriptNode.connect(audioCtx.destination)
        scriptNodeRef.current = scriptNode

        scriptNode.onaudioprocess = (e) => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) return
          const input = e.inputBuffer.getChannelData(0)
          const pcm16 = new Int16Array(input.length)
          for (let i = 0; i < input.length; i++) {
            const s = Math.max(-1, Math.min(1, input[i]))
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
          }
          const base64 = arrayBufferToBase64(pcm16.buffer)
          wsRef.current.send(
            JSON.stringify({
              type: 'audio_chunk',
              data: base64,
              mimeType: 'audio/pcm;rate=16000',
            })
          )
        }
      }

      // Start frequency visualizer loop
      startVisualizerLoop()

      // 5. Connect WebSocket to backend proxy
      const token = localStorage.getItem('cloop_token') || ''
      const baseUrl = getWsUrl()
      const wsUrl = `${baseUrl}/ws/assessment?sessionId=${sessionId}&token=${token}&trackKey=cloop_tutor&chapterKey=general_learning&mode=cloop_ai`

      console.log(`🔌 [Live Voice Tutor] Connecting to ${wsUrl}...`)
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log(`✅ [Live Voice Tutor] WebSocket connected for session ${sessionId}`)
        setState((prev) => ({
          ...prev,
          isConnected: true,
          connectionStatus: 'connected',
          error: null,
        }))
        isConnectingRef.current = false
      }

      ws.onmessage = (event) => {
        try {
          const msg: VoiceMessage = JSON.parse(event.data)

          // Audio output from Cloop AI
          if (msg.type === 'audio' && msg.data) {
            const pcmBytes = base64ToUint8Array(msg.data)
            if (audioStreamerRef.current) {
              audioStreamerRef.current.addPCM16(pcmBytes)
            }
          }

          // Live AI transcript
          if (msg.type === 'ai_transcript' && msg.text) {
            setState((prev) => ({ ...prev, aiTranscript: msg.text || '' }))
          }

          // Live user transcript
          if (msg.type === 'user_live_transcript' && msg.text) {
            setState((prev) => ({ ...prev, userTranscript: msg.text || '' }))
          }

          // Interruption
          if (msg.type === 'interrupted') {
            if (audioStreamerRef.current) {
              audioStreamerRef.current.stop()
            }
          }

          // Error from backend
          if (msg.type === 'error') {
            console.error('[Live Voice Tutor] Error from backend:', msg.message)
            setState((prev) => ({ ...prev, error: msg.message || 'Server error' }))
          }
        } catch (err) {
          console.error('[Live Voice Tutor] Error parsing WS message:', err)
        }
      }

      ws.onerror = (event) => {
        console.error('[Live Voice Tutor] WebSocket error:', event)
        setState((prev) => ({
          ...prev,
          error: 'Connection error. Please check your network.',
          connectionStatus: 'error',
        }))
        isConnectingRef.current = false
      }

      ws.onclose = (event) => {
        console.log(`🔌 [Live Voice Tutor] WebSocket closed (code: ${event.code})`)
        setState((prev) => ({
          ...prev,
          isConnected: false,
          connectionStatus: prev.connectionStatus === 'connected' ? 'disconnected' : prev.connectionStatus,
        }))
        isConnectingRef.current = false
      }
    } catch (err: any) {
      console.error('[Live Voice Tutor] Connection failed:', err)
      setState((prev) => ({
        ...prev,
        error: err.message || 'Failed to connect microphone',
        connectionStatus: 'error',
      }))
      isConnectingRef.current = false
    }
  }, [sessionId, startVisualizerLoop])

  // End session
  const endSession = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }))
    }
    disconnect()
  }, [disconnect])

  return {
    ...state,
    connect,
    disconnect,
    endSession,
  }
}
