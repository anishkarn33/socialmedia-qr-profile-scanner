'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import jsQR from 'jsqr'
import Link from 'next/link'

interface QRScannerProps {
  onScanComplete: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanComplete }) => {
  const [scanning, setScanning] = useState(false)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let animationFrameId: number

    const scan = () => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')

        if (context) {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight

          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)

          if (code) {
            setScanning(false)
            setTimeout(() => {
              setScannedResult(code.data)
              onScanComplete(code.data)
            }, 2000)
            return
          }
        }
      }

      animationFrameId = requestAnimationFrame(scan)
    }

    if (scanning) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
            animationFrameId = requestAnimationFrame(scan)
          }
        })
        .catch((err) => {
          console.error('Error accessing camera:', err)
          setError('Failed to access camera. Please make sure you have given permission.')
        })
    } else if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [scanning, onScanComplete])

  const startScanning = () => {
    setScanning(true)
    setScannedResult(null)
    setError(null)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <video ref={videoRef} className="w-full" style={{ display: scanning ? 'block' : 'none' }} />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" style={{ display: scanning ? 'block' : 'none' }} />
        {scanning && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="w-48 h-48 border-4 border-blue-500 animate-pulse" />
          </div>
        )}
      </div>
      {!scanning && !scannedResult && (
        <Button onClick={startScanning} className="w-full">
          Start Scanning
        </Button>
      )}
      {scannedResult && (
        <Alert variant="default">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>
            <p>Scanned QR Code:</p>
            <Link href={scannedResult} className="text-blue-600 hover:underline break-all">
              {scannedResult}
            </Link>
            <Button asChild className="w-full mt-2">
              <Link href={scannedResult} target="_blank" rel="noopener noreferrer">
                Visit Profile <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default QRScanner

