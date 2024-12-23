'use client'

import React from 'react'
import InstagramQRGenerator from './InstagramQRGenerator'

const InstagramQRTool: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <InstagramQRGenerator />
    </div>
  )
}

export default InstagramQRTool

