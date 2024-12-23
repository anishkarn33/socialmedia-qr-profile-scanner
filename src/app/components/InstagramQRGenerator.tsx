'use client'

import React, { useState, useRef, useCallback } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react'
import jsQR from 'jsqr'
import Link from 'next/link'

const InstagramQRGenerator: React.FC = () => {
  const [username, setUsername] = useState('')
  const [qrValue, setQrValue] = useState('')
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const qrRef = useRef<SVGSVGElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username) {
      setQrValue(`https://www.instagram.com/${username}/`)
      setScannedResult(null)
      setError(null)
    }
  }

  const scanQRCode = useCallback(() => {
    if (qrRef.current) {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        context?.drawImage(img, 0, 0, img.width, img.height)
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height)
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          if (code) {
            setScannedResult(code.data)
            setError(null)
          } else {
            setError('Failed to scan QR code. Please try again.')
          }
        }
      }
      img.onerror = () => {
        setError('Failed to load QR code image. Please try again.')
      }
      const svgData = new XMLSerializer().serializeToString(qrRef.current)
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
    }
  }, [])

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-purple-600">Instagram QR Generator</h2>
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Instagram Username</Label>
          <Input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your Instagram username"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Generate QR Code
        </Button>
      </form>
      {qrValue && (
        <div className="flex flex-col items-center space-y-4">
          <QRCodeSVG ref={qrRef} value={qrValue} size={200} />
          <p className="text-sm text-gray-600">Scan this QR code to visit the Instagram profile</p>
          <Button onClick={scanQRCode} variant="outline" className="w-full">
            Scan Generated QR Code
          </Button>
        </div>
      )}
      {scannedResult && (
        <Alert variant="default" className="mt-4">
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
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default InstagramQRGenerator

