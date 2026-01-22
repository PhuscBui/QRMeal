'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, X, Search, Loader2 } from 'lucide-react'

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

// Reverse geocoding function to get address from coordinates
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'QRMeal App'
        }
      }
    )
    const data = await response.json()
    
    if (data && data.display_name) {
      return data.display_name
    }
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

// Forward geocoding function to search for locations
async function searchLocation(query: string): Promise<Array<{ lat: number; lng: number; display_name: string }>> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'QRMeal App'
        }
      }
    )
    const data = await response.json()
    
    if (Array.isArray(data) && data.length > 0) {
      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        display_name: item.display_name
      }))
    }
    return []
  } catch (error) {
    console.error('Geocoding error:', error)
    return []
  }
}

function LocationMarker({
  onLocationSelect,
  initialPosition,
  onAddressUpdate
}: {
  onLocationSelect: (location: { lat: number; lng: number }) => void
  initialPosition?: { lat: number; lng: number }
  onAddressUpdate?: (address: string) => void
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
      
      // Get address for the clicked location
      if (onAddressUpdate) {
        reverseGeocode(lat, lng).then(onAddressUpdate)
      }
    }
  })

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
      map.setView([initialPosition.lat, initialPosition.lng], map.getZoom())
      // Get address for initial position
      if (onAddressUpdate) {
        reverseGeocode(initialPosition.lat, initialPosition.lng).then(onAddressUpdate)
      }
    }
  }, [initialPosition, map, onAddressUpdate])

  return position === null ? null : <Marker position={[position.lat, position.lng]} />
}

// Component to update map view when position changes
function ChangeMapView({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap()
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom())
  }, [center, map])
  return null
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
  const [address, setAddress] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ lat: number; lng: number; display_name: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  const handleLocationSelect = useCallback(async (location: { lat: number; lng: number }) => {
    setSelectedPosition(location)
    setIsLoadingAddress(true)
    
    // Get address from coordinates
    const locationAddress = await reverseGeocode(location.lat, location.lng)
    setAddress(locationAddress)
    
    // Pass location with address to parent
    onLocationSelect({ ...location, address: locationAddress })
    setIsLoadingAddress(false)
  }, [onLocationSelect])

  const handleClear = () => {
    setSelectedPosition(null)
    setAddress('')
    setSearchQuery('')
    setSearchResults([])
    onLocationSelect({ lat: 0, lng: 0 })
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    const results = await searchLocation(searchQuery)
    setSearchResults(results)
    setIsSearching(false)
  }

  const handleSelectSearchResult = async (result: { lat: number; lng: number; display_name: string }) => {
    const newPosition = { lat: result.lat, lng: result.lng }
    setSelectedPosition(newPosition)
    setAddress(result.display_name)
    setSearchQuery('')
    setSearchResults([])
    // Trigger location select to update parent and get full address details
    await handleLocationSelect(newPosition)
  }

  // Load address for initial position
  useEffect(() => {
    if (initialPosition && initialPosition.lat !== 0 && initialPosition.lng !== 0) {
      reverseGeocode(initialPosition.lat, initialPosition.lng).then((addr) => {
        setAddress(addr)
      })
    }
  }, [initialPosition])

  return (
    <div className={className}>
      <Card>
        <CardContent className='p-0'>
          {!isOpen ? (
            <div className='p-3 md:p-4'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2'>
                <label className='text-sm font-medium'>Chọn vị trí trên bản đồ</label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setIsOpen(true)}
                  className='w-full sm:w-auto'
                >
                  <MapPin className='h-4 w-4 mr-2' />
                  Mở bản đồ
                </Button>
              </div>
              {selectedPosition && (
                <div className='mt-2 p-2 md:p-3 bg-muted rounded text-xs sm:text-sm'>
                  <div className='flex items-center justify-between gap-2 min-w-0'>
                    <span className='flex-1 truncate min-w-0' title={address || `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`}>
                      {address || (isLoadingAddress ? 'Đang tải...' : `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`)}
                    </span>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={handleClear}
                      className='h-6 w-6 p-0 flex-shrink-0'
                    >
                      <X className='h-3 w-3' />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='relative'>
              {/* Search Bar */}
              <div className='p-2 md:p-3 border-b bg-background'>
                <div className='flex gap-2'>
                  <div className='relative flex-1 min-w-0'>
                    <Search className='absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                    <Input
                      placeholder='Tìm kiếm địa điểm...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch()
                        }
                      }}
                      className='pl-8 md:pl-10 text-sm'
                    />
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className='flex-shrink-0'
                  >
                    {isSearching ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Search className='h-4 w-4' />
                    )}
                  </Button>
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className='mt-2 max-h-32 sm:max-h-40 overflow-y-auto border rounded-md bg-background'>
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        type='button'
                        onClick={() => handleSelectSearchResult(result)}
                        className='w-full text-left p-2 hover:bg-muted border-b last:border-b-0 text-xs sm:text-sm'
                      >
                        <div className='flex items-start gap-2 min-w-0'>
                          <MapPin className='h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                          <span className='flex-1 truncate min-w-0'>{result.display_name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Map Controls */}
              <div className='absolute top-12 md:top-16 right-2 z-[1000] flex flex-col sm:flex-row gap-2'>
                <Button
                  type='button'
                  variant='secondary'
                  size='sm'
                  onClick={() => setIsOpen(false)}
                  className='text-xs sm:text-sm shadow-lg'
                >
                  Đóng
                </Button>
                {selectedPosition && (
                  <Button 
                    type='button' 
                    variant='destructive' 
                    size='sm' 
                    onClick={handleClear}
                    className='text-xs sm:text-sm shadow-lg'
                  >
                    Xóa
                  </Button>
                )}
              </div>

              {/* Map */}
              <div className='h-[300px] sm:h-[400px] w-full'>
                <MapContainer
                  center={selectedPosition || center}
                  zoom={selectedPosition ? 15 : 13}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                  scrollWheelZoom={true}
                  key={selectedPosition ? `${selectedPosition.lat}-${selectedPosition.lng}` : 'default'}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                  />
                  <LocationMarker
                    onLocationSelect={handleLocationSelect}
                    initialPosition={selectedPosition || undefined}
                    onAddressUpdate={setAddress}
                  />
                  {selectedPosition && (
                    <ChangeMapView center={selectedPosition} />
                  )}
                </MapContainer>
              </div>

              {/* Selected Location Info */}
              {selectedPosition && (
                <div className='p-2 md:p-3 bg-muted text-xs sm:text-sm border-t'>
                  <div className='flex items-center gap-2 min-w-0'>
                    {isLoadingAddress ? (
                      <div className='flex items-center gap-2'>
                        <Loader2 className='h-3 w-3 sm:h-4 sm:w-4 animate-spin flex-shrink-0' />
                        <span className='truncate'>Đang tải địa chỉ...</span>
                      </div>
                    ) : (
                      <>
                        <MapPin className='h-3 w-3 sm:h-4 sm:w-4 text-primary flex-shrink-0' />
                        <span className='flex-1 truncate min-w-0' title={address}>
                          {address || `${selectedPosition.lat.toFixed(6)}, ${selectedPosition.lng.toFixed(6)}`}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}





