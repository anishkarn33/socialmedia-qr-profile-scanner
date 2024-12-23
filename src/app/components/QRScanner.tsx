'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

interface InstagramQRScannerProps {
  onBackClick: () => void;
}

const InstagramQRScanner: React.FC<InstagramQRScannerProps> = ({ onBackClick }) => {
  const [data, setData] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const router = useRouter()

  useEffect(() => {
    scannerRef.current = new Html5Qrcode('reader')

    return () => {
      if (scannerRef.current && scanning) {
        scannerRef.current.stop().catch(error => console.error('Failed to stop scanner:', error))
      }
    }
  }, [scanning])

  const handleScan = (decodedText: string) => {
    setData(decodedText)
    if (decodedText.startsWith('https://www.instagram.com/')) {
      router.push(decodedText)
    }
    stopScanner()
  }

  const startScanner = () => {
    setError(null)
    if (scannerRef.current) {
      scannerRef.current
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          handleScan,
          (errorMessage: string) => {
            console.error('QR Code scanning failed:', errorMessage)
          }
        )
        .then(() => setScanning(true))
        .catch((err: Error) => {
          console.error('Failed to start scanner:', err)
          setError('Camera access denied. Please enable camera permissions and try again.')
        })
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => setScanning(false))
        .catch((err: Error) => {
          console.error('Failed to stop scanner:', err)
        })
    }
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-purple-600">Instagram QR Scanner</h2>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div id="reader" className="mb-4 w-full"></div>
      <div className="flex justify-center space-x-4 mb-4">
        {!scanning ? (
          <Button onClick={startScanner} className="w-full">
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="destructive" className="w-full">
            Stop Scanning
          </Button>
        )}
      </div>
      {data && (
        <div className="p-4 mt-4 text-center bg-gray-200 rounded">
          <p className="font-semibold">Scanned Result:</p>
          <p className="break-all">{data}</p>
        </div>
      )}
      <Button onClick={onBackClick} variant="outline" className="w-full mt-4">
        Back to Generator
      </Button>
      <div className="mt-4 text-sm text-gray-600">
        <p>Note: You may need to grant camera permissions to use the QR scanner.</p>
        <p>If you are having trouble, try the following:</p>
        <ul className="list-disc list-inside mt-2">
          <li>Ensure your browser supports camera access</li>
          <li>Check your browser settings and allow camera access for this site</li>
          <li>If using an iOS device, ensure you are using Safari</li>
          <li>Try refreshing the page and granting permissions when prompted</li>
        </ul>
      </div>
    </div>
  )
}

export default InstagramQRScanner

