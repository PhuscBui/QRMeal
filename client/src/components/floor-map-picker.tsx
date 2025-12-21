'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, X, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'

type TableData = {
  _id: string
  number: number
  capacity: number
  status: string
  x?: number
  y?: number
  shape?: 'circle' | 'rect'
}

interface FloorMapPickerProps {
  onPositionSelect: (position: { x: number; y: number } | null) => void
  initialPosition?: { x: number; y: number }
  className?: string
  existingTables?: TableData[]
  excludeTableId?: string | number
}

const DEFAULT_CANVAS_WIDTH = 600
const DEFAULT_CANVAS_HEIGHT = 400

export default function FloorMapPicker({
  onPositionSelect,
  initialPosition,
  className = '',
  existingTables = [],
  excludeTableId
}: FloorMapPickerProps) {
  const t = useTranslations('table')
  const tCommon = useTranslations('common')
  const tBooking = useTranslations('booking')
  const [selectedPosition, setSelectedPosition] = useState<{ x: number; y: number } | null>(
    initialPosition || null
  )
  const [isOpen, setIsOpen] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  // Filter tables to show (exclude current table if editing)
  const tablesToShow = existingTables.filter((table) => {
    // Only show tables that have x, y coordinates
    if (table.x === undefined || table.y === undefined) return false
    // Exclude current table if editing
    if (excludeTableId && (table._id === String(excludeTableId) || table.number === excludeTableId)) return false
    return true
  })

  useEffect(() => {
    if (initialPosition) {
      setSelectedPosition(initialPosition)
    }
  }, [initialPosition])

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return

    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const ctm = svg.getScreenCTM()
    
    if (!ctm) return
    
    const point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY
    
    const svgPoint = point.matrixTransform(ctm.inverse())
    
    const x = Math.max(0, Math.round(svgPoint.x))
    const y = Math.max(0, Math.round(svgPoint.y))
    
    const newPosition = { x, y }
    setSelectedPosition(newPosition)
    onPositionSelect(newPosition)
  }

  const handleClear = () => {
    setSelectedPosition(null)
    onPositionSelect(null)
  }

  return (
    <div className={className}>
      <Card>
        <CardContent className='p-0'>
          {!isOpen ? (
            <div className='p-4'>
              <div className='flex items-center justify-between mb-2'>
                <label className='text-sm font-medium'>
                  {t('floorMapPosition') || 'Vị trí trên sơ đồ'}
                </label>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setIsOpen(true)}
                >
                  <MapPin className='h-4 w-4 mr-2' />
                  {t('selectPosition') || 'Chọn vị trí'}
                </Button>
              </div>
              {selectedPosition && (
                <div className='mt-2 p-2 bg-muted rounded text-sm'>
                  <div className='flex items-center justify-between'>
                    <span>
                      X: {selectedPosition.x}, Y: {selectedPosition.y}
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
              {!selectedPosition && (
                <p className='text-xs text-muted-foreground mt-2'>
                  {t('floorMapPositionHint') || 'Để trống để tự động tạo vị trí'}
                </p>
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
                  {tCommon('close') || 'Đóng'}
                </Button>
                {selectedPosition && (
                  <Button 
                    type='button' 
                    variant='destructive' 
                    size='sm' 
                    onClick={handleClear}
                  >
                    <RotateCcw className='h-4 w-4 mr-1' />
                    {tCommon('clear') || 'Xóa'}
                  </Button>
                )}
              </div>
              <div className='h-[400px] w-full bg-gradient-to-br from-slate-50 via-white to-orange-50/30 border-b'>
                <svg
                  ref={svgRef}
                  width='100%'
                  height='100%'
                  viewBox={`0 0 ${DEFAULT_CANVAS_WIDTH} ${DEFAULT_CANVAS_HEIGHT}`}
                  className='cursor-crosshair'
                  onClick={handleSvgClick}
                  style={{ touchAction: 'none' }}
                >
                  <defs>
                    <pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'>
                      <path 
                        d='M 20 0 L 0 0 0 20' 
                        fill='none' 
                        stroke='#e2e8f0' 
                        strokeWidth='0.5' 
                        opacity='0.5' 
                      />
                    </pattern>
                    <linearGradient id='kitchenGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                      <stop offset='0%' stopColor='#6b7280' stopOpacity='1' />
                      <stop offset='100%' stopColor='#4b5563' stopOpacity='1' />
                    </linearGradient>
                    <linearGradient id='barGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                      <stop offset='0%' stopColor='#8b5cf6' stopOpacity='1' />
                      <stop offset='100%' stopColor='#7c3aed' stopOpacity='1' />
                    </linearGradient>
                    <linearGradient id='entranceGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                      <stop offset='0%' stopColor='#10b981' stopOpacity='1' />
                      <stop offset='100%' stopColor='#059669' stopOpacity='1' />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid background */}
                  <rect 
                    width='100%' 
                    height='100%' 
                    fill='url(#grid)' 
                  />
                  
                  {/* Kitchen area */}
                  <rect
                    x={DEFAULT_CANVAS_WIDTH - 120}
                    y={50}
                    width={80}
                    height={60}
                    rx={10}
                    fill='url(#kitchenGradient)'
                    className='drop-shadow-lg'
                  />
                  <text
                    x={DEFAULT_CANVAS_WIDTH - 80}
                    y={85}
                    textAnchor='middle'
                    fill='white'
                    className='text-sm font-bold pointer-events-none'
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {t('kitchen') || 'Bếp'}
                  </text>
                  
                  {/* Bar area */}
                  <rect
                    x={DEFAULT_CANVAS_WIDTH - 120}
                    y={150}
                    width={80}
                    height={100}
                    rx={10}
                    fill='url(#barGradient)'
                    className='drop-shadow-lg'
                  />
                  <text
                    x={DEFAULT_CANVAS_WIDTH - 80}
                    y={205}
                    textAnchor='middle'
                    fill='white'
                    className='text-sm font-bold pointer-events-none'
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {t('bar') || 'Quầy Bar'}
                  </text>
                  
                  {/* Entrance */}
                  <rect
                    x={DEFAULT_CANVAS_WIDTH / 2 - 50}
                    y={DEFAULT_CANVAS_HEIGHT - 40}
                    width={100}
                    height={30}
                    rx={15}
                    fill='url(#entranceGradient)'
                    className='drop-shadow-lg'
                  />
                  <text
                    x={DEFAULT_CANVAS_WIDTH / 2}
                    y={DEFAULT_CANVAS_HEIGHT - 20}
                    textAnchor='middle'
                    fill='white'
                    className='text-sm font-bold pointer-events-none'
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                  >
                    {t('entrance') || 'Lối Vào'}
                  </text>
                  
                  {/* Existing tables */}
                  {tablesToShow.map((table) => {
                    const touchRadius = 35
                    const touchWidth = 70
                    const touchHeight = 50
                    
                    // Color based on status
                    let fillColor = '#10b981' // Available - green
                    let strokeColor = '#059669'
                    
                    if (table.status === 'Reserved') {
                      fillColor = '#ef4444' // Reserved - red
                      strokeColor = '#dc2626'
                    } else if (table.status === 'Occupied') {
                      fillColor = '#f59e0b' // Occupied - orange
                      strokeColor = '#d97706'
                    }
                    
                    return (
                      <g key={table._id} className='pointer-events-none'>
                        {table.shape === 'circle' ? (
                          <>
                            <circle
                              cx={table.x}
                              cy={table.y}
                              r={touchRadius}
                              fill={fillColor}
                              stroke='white'
                              strokeWidth={2}
                              opacity={0.7}
                            />
                            <text
                              x={table.x}
                              y={table.y - 5}
                              textAnchor='middle'
                              fill='white'
                              className='text-xs font-bold pointer-events-none'
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                            >
                              {t('table')} {table.number}
                            </text>
                            <text
                              x={table.x}
                              y={table.y + 10}
                              textAnchor='middle'
                              fill='white'
                              className='text-[10px] font-medium pointer-events-none'
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                            >
                              {table.capacity} {tBooking('people') || 'chỗ'}
                            </text>
                          </>
                        ) : (
                          <>
                            <rect
                              x={table.x! - touchWidth / 2}
                              y={table.y! - touchHeight / 2}
                              width={touchWidth}
                              height={touchHeight}
                              rx={8}
                              fill={fillColor}
                              stroke='white'
                              strokeWidth={2}
                              opacity={0.7}
                            />
                            <text
                              x={table.x}
                              y={table.y! - 5}
                              textAnchor='middle'
                              fill='white'
                              className='text-xs font-bold pointer-events-none'
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                            >
                              {t('table')} {table.number}
                            </text>
                            <text
                              x={table.x}
                              y={table.y! + 10}
                              textAnchor='middle'
                              fill='white'
                              className='text-[10px] font-medium pointer-events-none'
                              style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                            >
                              {table.capacity} {tBooking('people') || 'chỗ'}
                            </text>
                          </>
                        )}
                      </g>
                    )
                  })}
                  
                  {/* Selected position marker */}
                  {selectedPosition && (
                    <g>
                      <circle
                        cx={selectedPosition.x}
                        cy={selectedPosition.y}
                        r={8}
                        fill='#f59e0b'
                        stroke='white'
                        strokeWidth={2}
                        className='drop-shadow-lg animate-pulse'
                      />
                      <circle
                        cx={selectedPosition.x}
                        cy={selectedPosition.y}
                        r={15}
                        fill='none'
                        stroke='#f59e0b'
                        strokeWidth={2}
                        strokeDasharray='4 4'
                        opacity={0.5}
                      />
                      <text
                        x={selectedPosition.x}
                        y={selectedPosition.y - 25}
                        textAnchor='middle'
                        fill='#f59e0b'
                        className='text-xs font-bold pointer-events-none'
                        style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}
                      >
                        ({selectedPosition.x}, {selectedPosition.y})
                      </text>
                    </g>
                  )}
                  
                  {/* Instructions */}
                  <text
                    x={DEFAULT_CANVAS_WIDTH / 2}
                    y={30}
                    textAnchor='middle'
                    fill='#64748b'
                    className='text-sm font-medium pointer-events-none'
                  >
                    {t('clickToSelectPosition') || 'Click vào bản đồ để chọn vị trí'}
                  </text>
                </svg>
              </div>
              {selectedPosition && (
                <div className='p-2 bg-muted text-sm text-center'>
                  X: {selectedPosition.x}, Y: {selectedPosition.y}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

