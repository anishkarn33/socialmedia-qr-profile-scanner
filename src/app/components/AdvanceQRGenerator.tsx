'use client'

import React, { useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { socialPlatforms } from '@/utils/socialPlatforms'
import QRScanner from './QRScanner'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, ExternalLink, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import jsQR from 'jsqr'

const AdvancedQRGenerator: React.FC = () => {
  const [step, setStep] = useState(1)
  const [platform, setPlatform] = useState('')
  const [username, setUsername] = useState('')
  const [customLink, setCustomLink] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [size, setSize] = useState(200)
  const [transparent, setTransparent] = useState(false)
  const [qrValue, setQrValue] = useState('')
  const qrRef = useRef<SVGSVGElement>(null)
  const [scannedResult, setScannedResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
    } else {
      const selectedPlatform = socialPlatforms.find(p => p.name === platform)
      if (selectedPlatform) {
        setQrValue(platform === 'Custom Link' ? customLink : `${selectedPlatform.urlPrefix}${username}`)
      }
    }
  }

  const exportQR = () => {
    if (qrRef.current) {
      const canvas = document.createElement('canvas')
      const svg = qrRef.current
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      img.onload = () => {
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (ctx) {
          if (!transparent) {
            ctx.fillStyle = 'white'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          ctx.drawImage(img, 0, 0, size, size)
          
          if (title || description) {
            ctx.fillStyle = 'black'
            ctx.textAlign = 'center'
            if (title) {
              ctx.font = 'bold 16px Arial'
              ctx.fillText(title, size / 2, size + 20)
            }
            if (description) {
              ctx.font = '14px Arial'
              ctx.fillText(description, size / 2, size + 40)
            }
          }

          const pngFile = canvas.toDataURL('image/png')
          const downloadLink = document.createElement('a')
          downloadLink.download = 'qr-code.png'
          downloadLink.href = pngFile
          downloadLink.click()
        }
      }
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
    }
  }

  const handleScanComplete = (result: string) => {
    console.log('Scanned result:', result)
    setScannedResult(result)
  }

  const scanQRCode = () => {
    if (qrRef.current) {
      setIsScanning(true)
      setError(null)
      setScannedResult(null)

      const canvas = document.createElement('canvas')
      const svg = qrRef.current
      const svgData = new XMLSerializer().serializeToString(svg)
      const img = new Image()
      img.onload = () => {
        canvas.width = svg.width.baseVal.value
        canvas.height = svg.height.baseVal.value
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0)
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          
          setTimeout(() => {
            setIsScanning(false)
            if (code) {
              setScannedResult(code.data)
            } else {
              setError('No QR code found in the image')
            }
          }, 2000)
        }
      }
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
    }
  }

  const resetForm = () => {
    setStep(1)
    setPlatform('')
    setUsername('')
    setCustomLink('')
    setTitle('')
    setDescription('')
    setSize(200)
    setTransparent(false)
    setQrValue('')
    setScannedResult(null)
    setError(null)
  }

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-center text-purple-600">Advanced QR Tool</h2>
      <Tabs defaultValue="generate">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="scan">Scan</TabsTrigger>
        </TabsList>
        <TabsContent value="generate">
          {qrValue ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center relative">
                <div className="relative">
                  <QRCodeSVG
                    ref={qrRef}
                    value={qrValue}
                    size={size}
                    bgColor={transparent ? "rgba(255, 255, 255, 0)" : "#FFFFFF"}
                  />
                  {isScanning && (
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <div className="w-full h-full border-4 border-blue-500 animate-pulse" />
                      <div className="absolute w-full h-1 bg-blue-500 animate-scan" />
                    </div>
                  )}
                </div>
                {(title || description) && (
                  <div className="text-center mt-2">
                    {title && <p className="font-bold">{title}</p>}
                    {description && <p>{description}</p>}
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 text-center">Scan this QR code to visit the profile</p>
              <Button onClick={exportQR} variant="outline" className="w-full">
                Export QR Code
              </Button>
              <Button onClick={scanQRCode} variant="outline" className="w-full" disabled={isScanning}>
                {isScanning ? 'Scanning...' : 'Scan Generated QR Code'}
              </Button>
              <Button onClick={resetForm} variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="platform">Select Platform</Label>
                    <Select onValueChange={setPlatform} value={platform}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {socialPlatforms.map((p) => (
                          <SelectItem key={p.name} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {platform === 'Custom Link' ? (
                    <div className="space-y-2">
                      <Label htmlFor="customLink">Custom Link</Label>
                      <Input
                        type="url"
                        id="customLink"
                        value={customLink}
                        onChange={(e) => setCustomLink(e.target.value)}
                        placeholder="Enter your custom link"
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  )}
                </>
              )}
              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title (optional)</Label>
                    <Input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter a title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Input
                      type="text"
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter a description"
                    />
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="size">QR Code Size: {size}x{size}</Label>
                    <Slider
                      id="size"
                      min={100}
                      max={1000}
                      step={10}
                      value={[size]}
                      onValueChange={(value) => setSize(value[0])}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="transparent"
                      checked={transparent}
                      onCheckedChange={setTransparent}
                    />
                    <Label htmlFor="transparent">Transparent Background</Label>
                  </div>
                </>
              )}
              <Button type="submit" className="w-full">
                {step < 3 ? 'Next' : 'Generate QR Code'}
              </Button>
            </form>
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
        </TabsContent>
        <TabsContent value="scan">
          <QRScanner onScanComplete={handleScanComplete} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdvancedQRGenerator

