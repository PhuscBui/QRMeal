'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, X } from 'lucide-react'

// Fix for default marker icon in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })
}

interface MapPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void
  initialPosition?: { lat: number; lng: number }
  center?: { lat: number; lng: number }
  className?: string
}

// Default center to Ho Chi Minh City, Vietnam
const DEFAULT_CENTER = { lat: 10.8231, lng: 106.6297 }

function LocationMarker({
  onLocationSelect,
  initialPosition
}: {
  onLocationSelect: (location: { lat: number; lng: number }) => void
  initialPosition?: { lat: number; lng: number }
}) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialPosition || null
  )

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      const newPosition = { lat, lng }
      setPosition(newPosition)
      onLocationSelect(newPosition)
    }
  })

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
      map.setView([initialPosition.lat, initialPosition.lng], map.getZoom())
    }
  }, [initialPosition, map])

  return position === null ? null : <Marker position={[position.lat, position.lng]} />
}

export default function MapPicker({
  onLocationSelect,
  initialPosition,
  center = DEFAULT_CENTER,
  className = ''
}: MapPickerProps) {
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(
    initialPosition || null
  )
  const [isOpen, setIsOpen] = useState(false)

  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedPosition(location)
    onLocationSelect(location)
  }

  const handleClear = () => {
    setSelectedPosition(null)
    onLocationSelect({ lat: 0, lng: 0 })
  }

  return (
    <div className={className}>
      <Card>
        <CardContent className='p-0'>
          {!isOpen ? (
            <div className='p-4'>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-medium'>Chọn vị trí trên bản đồ</label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setIsOpen(true)}
                >
                  <MapPin className='h-4 w-4 mr-2' />
                  Mở bản đồ
                </Button>
              </div>
              {selectedPosition && (
                <div className='mt-2 p-2 bg-muted rounded text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>
                      Tọa độ: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={handleClear}
                      className='h-6 w-6 p-0'
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='relative'>
              <div className='absolute top-2 right-2 z-[1000] flex gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => setIsOpen(false)}
                >
                  Đóng
                </Button>
                {selectedPosition && (
                  <Button type='button' variant='destructive' size='sm' onClick={handleClear}>
                    Xóa
                  </Button>
                )}
              </div>
              <div className='h-[400px] w-full'>
                <MapContainer
                  center={selectedPosition || center}
                  zoom={13}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  />
                  <LocationMarker
                    onLocationSelect={handleLocationSelect}
                    initialPosition={selectedPosition || undefined}
                  />
                </MapContainer>
              </div>
              {selectedPosition && (
                <div className='p-2 bg-muted text-sm text-center'>
                  Tọa độ: {selectedPosition.lat.toFixed(6)}, {selectedPosition.lng.toFixed(6)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

