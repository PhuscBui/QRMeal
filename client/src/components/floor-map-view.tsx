'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Clock, MapPin, Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

type TableData = {
  _id: string
  number: number
  capacity: number
  status: string
  location: string
  token: string
  x?: number
  y?: number
  shape?: 'circle' | 'rect'
}

type FloorMapViewProps = {
  tables: TableData[]
  onTableSelect: (table: TableData | null) => void
  selectedTableId?: string | null
}

// Helper function to generate positions for tables
// This creates a grid layout based on table number
// Only used if table doesn't have x, y, shape defined
const generateTablePosition = (tableNumber: number, totalTables: number): { x: number; y: number; shape: 'circle' | 'rect' } => {
  // Create a grid: 4 columns, rows as needed
  const cols = 4
  const row = Math.floor((tableNumber - 1) / cols)
  const col = (tableNumber - 1) % cols
  
  // Spacing between tables
  const spacingX = 120
  const spacingY = 120
  const startX = 100
  const startY = 100
  
  const x = startX + col * spacingX
  const y = startY + row * spacingY
  
  // Alternate shapes for visual variety
  const shape: 'circle' | 'rect' = tableNumber % 2 === 0 ? 'circle' : 'rect'
  
  return { x, y, shape }
}

export default function FloorMapView({ tables, onTableSelect, selectedTableId }: FloorMapViewProps) {
  const t = useTranslations('booking')
  const tCommon = useTranslations('common')
  const [showSidebar, setShowSidebar] = useState(false)

  const handleSelect = (table: TableData) => {
    if (table.status === 'Reserved') return
    onTableSelect(table)
    if (window.innerWidth < 1024) {
      setShowSidebar(true)
    }
  }

  const selectedTable = tables.find((t) => t._id === selectedTableId)
  const availableTables = tables.filter((t) => t.status === 'Available').length
  const reservedTables = tables.filter((t) => t.status === 'Reserved').length

  // Generate positions for all tables
  // Use x, y, shape from API if available, otherwise generate automatically
  const tablesWithPositions = tables.map((table) => {
    if (table.x !== undefined && table.y !== undefined && table.shape) {
      // Use position from API
      return {
        ...table,
        x: table.x,
        y: table.y,
        shape: table.shape
      }
    } else {
      // Generate position automatically
      return {
        ...table,
        ...generateTablePosition(table.number, tables.length)
      }
    }
  })

  // Calculate SVG viewBox based on table positions
  const maxX = Math.max(...tablesWithPositions.map((t) => t.x), 500)
  const maxY = Math.max(...tablesWithPositions.map((t) => t.y), 400)
  const viewBoxWidth = Math.max(maxX + 150, 500)
  const viewBoxHeight = Math.max(maxY + 150, 450)

  return (
    <div className='relative'>
      <Card className='bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 backdrop-blur-sm border border-orange-100/50 shadow-2xl overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none' />
        <CardHeader className='pb-4 relative z-10'>
          <div className='flex items-center justify-between'>
            <CardTitle className='flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'>
              <div className='p-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg'>
                <MapPin className='h-5 w-5 text-white' />
              </div>
              {t('floorMap') || 'Sơ Đồ Tầng'}
            </CardTitle>
            <Button
              variant='outline'
              size='sm'
              className='lg:hidden bg-white/80 backdrop-blur-sm border-orange-200 hover:bg-orange-50 transition-all'
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className='relative z-10'>
          {/* Statistics */}
          <div className='grid grid-cols-3 gap-3 sm:gap-4 mb-6'>
            <Card className='group relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
              <div className='absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <CardContent className='p-4 relative z-10'>
                <div className='flex flex-col sm:flex-row items-center gap-3'>
                  <div className='p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300'>
                    <Users className='h-5 w-5 text-white' />
                  </div>
                  <div className='text-center sm:text-left'>
                    <p className='text-xs sm:text-sm font-medium text-green-700/70'>{t('available') || 'Trống'}</p>
                    <p className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent'>
                      {availableTables}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='group relative overflow-hidden bg-gradient-to-br from-red-50 to-rose-50 border border-red-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
              <div className='absolute inset-0 bg-gradient-to-br from-red-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <CardContent className='p-4 relative z-10'>
                <div className='flex flex-col sm:flex-row items-center gap-3'>
                  <div className='p-2.5 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300'>
                    <Clock className='h-5 w-5 text-white' />
                  </div>
                  <div className='text-center sm:text-left'>
                    <p className='text-xs sm:text-sm font-medium text-red-700/70'>{t('reserved') || 'Đã đặt'}</p>
                    <p className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent'>
                      {reservedTables}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='group relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
              <CardContent className='p-4 relative z-10'>
                <div className='flex flex-col sm:flex-row items-center gap-3'>
                  <div className='p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform duration-300'>
                    <MapPin className='h-5 w-5 text-white' />
                  </div>
                  <div className='text-center sm:text-left'>
                    <p className='text-xs sm:text-sm font-medium text-blue-700/70'>{tCommon('total') || 'Tổng'}</p>
                    <p className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                      {tables.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Floor Map SVG */}
          <div className='relative rounded-2xl overflow-hidden border border-orange-200/50 shadow-2xl bg-gradient-to-br from-slate-50 via-white to-orange-50/30'>
            <svg
              width='100%'
              height='400'
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              className='touch-manipulation'
              style={{ maxHeight: '70vh' }}
            >
              <defs>
                <pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'>
                  <path d='M 20 0 L 0 0 0 20' fill='none' stroke='#e2e8f0' strokeWidth='0.5' opacity='0.5' />
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
                <filter id='glow'>
                  <feGaussianBlur stdDeviation='3' result='coloredBlur' />
                  <feMerge>
                    <feMergeNode in='coloredBlur' />
                    <feMergeNode in='SourceGraphic' />
                  </feMerge>
                </filter>
              </defs>
              <rect width='100%' height='100%' fill='url(#grid)' />

              {/* Kitchen area */}
              <g filter='url(#glow)'>
                <rect
                  x={viewBoxWidth - 120}
                  y={50}
                  width={80}
                  height={60}
                  rx={10}
                  fill='url(#kitchenGradient)'
                  className='drop-shadow-lg'
                />
                <text
                  x={viewBoxWidth - 80}
                  y={85}
                  textAnchor='middle'
                  fill='white'
                  className='text-sm font-bold'
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {t('kitchen') || 'Bếp'}
                </text>
              </g>

              {/* Bar area */}
              <g filter='url(#glow)'>
                <rect
                  x={viewBoxWidth - 120}
                  y={150}
                  width={80}
                  height={100}
                  rx={10}
                  fill='url(#barGradient)'
                  className='drop-shadow-lg'
                />
                <text
                  x={viewBoxWidth - 80}
                  y={205}
                  textAnchor='middle'
                  fill='white'
                  className='text-sm font-bold'
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {t('bar') || 'Quầy Bar'}
                </text>
              </g>

              {/* Entrance */}
              <g filter='url(#glow)'>
                <rect
                  x={viewBoxWidth / 2 - 50}
                  y={viewBoxHeight - 40}
                  width={100}
                  height={30}
                  rx={15}
                  fill='url(#entranceGradient)'
                  className='drop-shadow-lg'
                />
                <text
                  x={viewBoxWidth / 2}
                  y={viewBoxHeight - 20}
                  textAnchor='middle'
                  fill='white'
                  className='text-sm font-bold'
                  style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                >
                  {t('entrance') || 'Lối Vào'}
                </text>
              </g>

              {/* Tables */}
              {tablesWithPositions.map((table) => {
                const isSelected = selectedTableId === table._id
                const isReserved = table.status === 'Reserved'
                
                // Enhanced colors with gradients
                let fillGradientId = ''
                let fillColor = ''
                let strokeColor = ''
                let strokeWidth = 2
                const touchRadius = 45
                const touchWidth = 85
                const touchHeight = 65

                if (isReserved) {
                  fillGradientId = `reservedGradient-${table._id}`
                  fillColor = '#ef4444'
                  strokeColor = '#dc2626'
                } else if (isSelected) {
                  fillGradientId = `selectedGradient-${table._id}`
                  fillColor = '#f59e0b'
                  strokeColor = '#d97706'
                  strokeWidth = 3
                } else {
                  fillGradientId = `availableGradient-${table._id}`
                  fillColor = '#10b981'
                  strokeColor = '#059669'
                }

                return (
                  <g key={table._id}>
                    <defs>
                      <linearGradient id={fillGradientId} x1='0%' y1='0%' x2='100%' y2='100%'>
                        <stop offset='0%' stopColor={fillColor} stopOpacity='1' />
                        <stop offset='100%' stopColor={strokeColor} stopOpacity='1' />
                      </linearGradient>
                    </defs>
                    <g
                      onClick={() => handleSelect(table)}
                      className={`cursor-pointer transition-all duration-300 ${
                        isReserved ? 'cursor-not-allowed opacity-70' : isSelected ? 'scale-110' : 'hover:scale-105'
                      }`}
                      style={{
                        filter: isSelected
                          ? 'drop-shadow(0 4px 12px rgba(245, 158, 11, 0.4))'
                          : 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
                        transformOrigin: `${table.x}px ${table.y}px`
                      }}
                    >
                      {table.shape === 'circle' ? (
                        <>
                          <circle
                            cx={table.x}
                            cy={table.y}
                            r={touchRadius}
                            fill={`url(#${fillGradientId})`}
                            stroke='white'
                            strokeWidth={strokeWidth}
                            className='transition-all duration-300'
                          />
                          <circle
                            cx={table.x}
                            cy={table.y}
                            r={touchRadius - 2}
                            fill='none'
                            stroke='rgba(255,255,255,0.3)'
                            strokeWidth='1'
                          />
                          <text
                            x={table.x}
                            y={table.y - 8}
                            textAnchor='middle'
                            fill='white'
                            className='text-sm font-bold pointer-events-none'
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                          >
                            {t('table')} {table.number}
                          </text>
                          <text
                            x={table.x}
                            y={table.y + 12}
                            textAnchor='middle'
                            fill='white'
                            className='text-xs font-medium pointer-events-none'
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                          >
                            {table.capacity} {t('people') || 'chỗ'}
                          </text>
                        </>
                      ) : (
                        <>
                          <rect
                            x={table.x - touchWidth / 2}
                            y={table.y - touchHeight / 2}
                            width={touchWidth}
                            height={touchHeight}
                            rx={10}
                            fill={`url(#${fillGradientId})`}
                            stroke='white'
                            strokeWidth={strokeWidth}
                            className='transition-all duration-300'
                          />
                          <rect
                            x={table.x - touchWidth / 2 + 2}
                            y={table.y - touchHeight / 2 + 2}
                            width={touchWidth - 4}
                            height={touchHeight - 4}
                            rx={8}
                            fill='none'
                            stroke='rgba(255,255,255,0.3)'
                            strokeWidth='1'
                          />
                          <text
                            x={table.x}
                            y={table.y - 8}
                            textAnchor='middle'
                            fill='white'
                            className='text-sm font-bold pointer-events-none'
                            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
                          >
                            {t('table')} {table.number}
                          </text>
                          <text
                            x={table.x}
                            y={table.y + 12}
                            textAnchor='middle'
                            fill='white'
                            className='text-xs font-medium pointer-events-none'
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
                          >
                            {table.capacity} {t('people') || 'chỗ'}
                          </text>
                        </>
                      )}
                    </g>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className='flex gap-3 sm:gap-4 mt-6 p-4 bg-gradient-to-r from-orange-50/50 via-white to-amber-50/50 rounded-xl border border-orange-100/50 overflow-x-auto shadow-inner'>
            <div className='flex items-center gap-2 whitespace-nowrap group'>
              <div className='w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex-shrink-0 shadow-md group-hover:scale-110 transition-transform'></div>
              <span className='text-xs sm:text-sm font-medium text-gray-700'>{t('available') || 'Bàn trống'}</span>
            </div>
            <div className='flex items-center gap-2 whitespace-nowrap group'>
              <div className='w-4 h-4 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex-shrink-0 shadow-md group-hover:scale-110 transition-transform'></div>
              <span className='text-xs sm:text-sm font-medium text-gray-700'>{t('reserved') || 'Đã đặt'}</span>
            </div>
            <div className='flex items-center gap-2 whitespace-nowrap group'>
              <div className='w-4 h-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex-shrink-0 shadow-md group-hover:scale-110 transition-transform'></div>
              <span className='text-xs sm:text-sm font-medium text-gray-700'>{t('selected') || 'Đang chọn'}</span>
            </div>
            <div className='flex items-center gap-2 whitespace-nowrap group'>
              <div className='w-4 h-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex-shrink-0 shadow-md group-hover:scale-110 transition-transform'></div>
              <span className='text-xs sm:text-sm font-medium text-gray-700'>{t('bar') || 'Quầy bar'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sidebar for mobile */}
      <div
        className={`
            fixed inset-x-0 bottom-0 z-50 lg:static lg:inset-auto
            transform transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
            lg:absolute lg:top-0 lg:right-0 lg:w-80 lg:max-h-full
          `}
      >
        <Card className='bg-gradient-to-br from-white via-orange-50/30 to-amber-50/30 backdrop-blur-sm border border-orange-200/50 shadow-2xl lg:shadow-xl rounded-t-3xl lg:rounded-xl m-0 lg:m-4 overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none' />
          <CardHeader className='pb-4 relative z-10 border-b border-orange-100/50'>
            <div className='flex items-center justify-between'>
              <CardTitle className='text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'>
                {t('tableInfo') || 'Thông Tin Đặt Bàn'}
              </CardTitle>
              <Button
                variant='ghost'
                size='sm'
                className='lg:hidden hover:bg-orange-50'
                onClick={() => setShowSidebar(false)}
              >
                <X className='h-4 w-4' />
              </Button>
            </div>
          </CardHeader>
          <CardContent className='space-y-4 max-h-96 lg:max-h-none overflow-y-auto relative z-10'>
            {selectedTable ? (
              <>
                <div className='text-center p-5 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-xl border-2 border-amber-200/50 shadow-lg'>
                  <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full mb-3 shadow-md'>
                    <span className='text-2xl font-bold text-white'>{selectedTable.number}</span>
                  </div>
                  <h3 className='text-xl font-bold bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent mb-3'>
                    {t('table')} {selectedTable.number}
                  </h3>
                  <Badge className='mb-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md'>
                    <Users className='h-3 w-3 mr-1' />
                    {selectedTable.capacity} {t('people') || 'chỗ ngồi'}
                  </Badge>
                  <p className='text-sm font-medium text-amber-700'>
                    <MapPin className='h-3 w-3 inline mr-1' />
                    {t('location')}: {selectedTable.location}
                  </p>
                </div>

                <Button
                  className='w-full h-12 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]'
                  onClick={() => {
                    onTableSelect(selectedTable)
                    setShowSidebar(false)
                  }}
                >
                  {t('bookingNow') || 'Đặt Bàn Ngay'}
                </Button>

                <Button
                  variant='outline'
                  className='w-full h-12 bg-white/80 backdrop-blur-sm border-orange-200 hover:bg-orange-50 text-base transition-all duration-300'
                  onClick={() => {
                    onTableSelect(null)
                    setShowSidebar(false)
                  }}
                >
                  {t('cancelSelection') || 'Hủy Chọn'}
                </Button>
              </>
            ) : (
              <div className='text-center p-8'>
                <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full mb-4'>
                  <Users className='h-10 w-10 text-orange-400' />
                </div>
                <p className='text-sm font-medium text-gray-600'>
                  {t('selectTableFromMap') || 'Chọn một bàn trên sơ đồ để xem thông tin chi tiết'}
                </p>
              </div>
            )}

            <div className='pt-4 border-t border-orange-100/50'>
              <h4 className='font-semibold mb-3 text-gray-700'>{t('availableTables') || 'Bàn có sẵn'}:</h4>
              <div className='space-y-2 max-h-40 overflow-y-auto'>
                {tables
                  .filter((t) => t.status === 'Available')
                  .map((table) => (
                    <div
                      key={table._id}
                      className='flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg cursor-pointer hover:from-green-100 hover:to-emerald-100 border border-green-200/50 hover:border-green-300 transition-all duration-300 hover:shadow-md hover:scale-[1.02] touch-manipulation'
                      onClick={() => {
                        handleSelect(table)
                        if (window.innerWidth < 1024) {
                          setShowSidebar(false)
                        }
                      }}
                    >
                      <span className='font-medium text-green-800'>
                        {t('table')} {table.number}
                      </span>
                      <Badge className='bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 text-xs shadow-sm'>
                        {table.capacity} {t('people') || 'chỗ'}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showSidebar && (
        <div className='fixed inset-0 bg-black/20 z-40 lg:hidden' onClick={() => setShowSidebar(false)} />
      )}
    </div>
  )
}

