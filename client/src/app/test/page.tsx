'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Clock, MapPin, Menu, X } from 'lucide-react'

type Table = {
  id: number
  name: string
  x: number
  y: number
  shape: 'circle' | 'rect'
  status: 'available' | 'booked'
  capacity: number
}

const initialTables: Table[] = [
  { id: 1, name: 'T1', x: 80, y: 80, shape: 'rect', status: 'booked', capacity: 4 },
  { id: 2, name: 'T2', x: 200, y: 80, shape: 'rect', status: 'available', capacity: 4 },
  { id: 3, name: 'T3', x: 320, y: 80, shape: 'rect', status: 'available', capacity: 2 },
  { id: 4, name: 'T4', x: 80, y: 200, shape: 'circle', status: 'available', capacity: 6 },
  { id: 5, name: 'T5', x: 200, y: 200, shape: 'circle', status: 'available', capacity: 6 },
  { id: 6, name: 'T6', x: 320, y: 200, shape: 'circle', status: 'booked', capacity: 8 },
  { id: 7, name: 'T7', x: 80, y: 320, shape: 'rect', status: 'available', capacity: 2 },
  { id: 8, name: 'T8', x: 200, y: 320, shape: 'rect', status: 'available', capacity: 4 }
]

export default function RestaurantFloorMap() {
  const [tables, setTables] = useState(initialTables)
  const [selected, setSelected] = useState<number | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)

  const handleSelect = (table: Table) => {
    if (table.status === 'booked') return
    setSelected(table.id === selected ? null : table.id)
    if (window.innerWidth < 1024) {
      setShowSidebar(true)
    }
  }

  const selectedTable = tables.find((t) => t.id === selected)
  const availableTables = tables.filter((t) => t.status === 'available').length
  const bookedTables = tables.filter((t) => t.status === 'booked').length

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 to-amber-50'>
      <div className='sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-orange-200 px-4 py-3'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-xl md:text-2xl font-bold text-gray-900'>Sơ Đồ Nhà Hàng</h1>
            <p className='text-sm text-gray-600 hidden sm:block'>Chọn bàn phù hợp cho bữa ăn của bạn</p>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='lg:hidden bg-transparent'
            onClick={() => setShowSidebar(!showSidebar)}
          >
            {showSidebar ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
          </Button>
        </div>
      </div>

      <div className='p-4 lg:p-6'>
        <div className='grid grid-cols-3 gap-2 sm:gap-4 mb-4 lg:mb-8'>
          <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
            <CardContent className='p-3 sm:p-4'>
              <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3'>
                <div className='p-1.5 sm:p-2 bg-green-100 rounded-lg'>
                  <Users className='h-4 w-4 sm:h-5 sm:w-5 text-green-600' />
                </div>
                <div className='text-center sm:text-left'>
                  <p className='text-xs sm:text-sm text-gray-600'>Trống</p>
                  <p className='text-lg sm:text-2xl font-bold text-green-600'>{availableTables}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
            <CardContent className='p-3 sm:p-4'>
              <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3'>
                <div className='p-1.5 sm:p-2 bg-red-100 rounded-lg'>
                  <Clock className='h-4 w-4 sm:h-5 sm:w-5 text-red-600' />
                </div>
                <div className='text-center sm:text-left'>
                  <p className='text-xs sm:text-sm text-gray-600'>Đã đặt</p>
                  <p className='text-lg sm:text-2xl font-bold text-red-600'>{bookedTables}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
            <CardContent className='p-3 sm:p-4'>
              <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-3'>
                <div className='p-1.5 sm:p-2 bg-blue-100 rounded-lg'>
                  <MapPin className='h-4 w-4 sm:h-5 sm:w-5 text-blue-600' />
                </div>
                <div className='text-center sm:text-left'>
                  <p className='text-xs sm:text-sm text-gray-600'>Tổng</p>
                  <p className='text-lg sm:text-2xl font-bold text-blue-600'>{tables.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='relative'>
          <Card className='bg-white/90 backdrop-blur-sm border-0 shadow-xl'>
            <CardHeader className='pb-3'>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <MapPin className='h-5 w-5' />
                Sơ Đồ Tầng
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='relative'>
                <svg
                  width='100%'
                  height='400'
                  viewBox='0 0 500 450'
                  className='border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 touch-manipulation'
                  style={{ maxHeight: '70vh' }}
                >
                  <defs>
                    <pattern id='grid' width='20' height='20' patternUnits='userSpaceOnUse'>
                      <path d='M 20 0 L 0 0 0 20' fill='none' stroke='#f3f4f6' strokeWidth='1' />
                    </pattern>
                  </defs>
                  <rect width='100%' height='100%' fill='url(#grid)' />

                  <rect x={400} y={50} width={80} height={60} rx={8} fill='#6b7280' className='drop-shadow-md' />
                  <text x={440} y={85} textAnchor='middle' fill='white' className='text-sm font-semibold'>
                    Bếp
                  </text>

                  <rect x={400} y={150} width={80} height={100} rx={8} fill='#8b5cf6' className='drop-shadow-md' />
                  <text x={440} y={205} textAnchor='middle' fill='white' className='text-sm font-semibold'>
                    Quầy Bar
                  </text>

                  <rect x={200} y={400} width={100} height={30} rx={15} fill='#10b981' className='drop-shadow-md' />
                  <text x={250} y={420} textAnchor='middle' fill='white' className='text-sm font-semibold'>
                    Lối Vào
                  </text>

                  {tables.map((table) => {
                    const isSelected = selected === table.id
                    const isBooked = table.status === 'booked'
                    const fillColor = isBooked ? '#ef4444' : isSelected ? '#f59e0b' : '#10b981'
                    const strokeColor = isSelected ? '#d97706' : '#374151'
                    const strokeWidth = isSelected ? 3 : 2
                    const touchRadius = 40
                    const touchWidth = 80
                    const touchHeight = 60

                    return (
                      <g
                        key={table.id}
                        onClick={() => handleSelect(table)}
                        className={`cursor-pointer transition-all duration-200 ${
                          isBooked ? 'cursor-not-allowed' : 'hover:opacity-80'
                        }`}
                        style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' }}
                      >
                        {table.shape === 'circle' ? (
                          <>
                            <circle
                              cx={table.x}
                              cy={table.y}
                              r={touchRadius}
                              fill={fillColor}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                            />
                            <text
                              x={table.x}
                              y={table.y - 5}
                              textAnchor='middle'
                              fill='white'
                              className='text-sm font-bold pointer-events-none'
                            >
                              {table.name}
                            </text>
                            <text
                              x={table.x}
                              y={table.y + 10}
                              textAnchor='middle'
                              fill='white'
                              className='text-xs pointer-events-none'
                            >
                              {table.capacity} chỗ
                            </text>
                          </>
                        ) : (
                          <>
                            <rect
                              x={table.x - touchWidth / 2}
                              y={table.y - touchHeight / 2}
                              width={touchWidth}
                              height={touchHeight}
                              rx={8}
                              fill={fillColor}
                              stroke={strokeColor}
                              strokeWidth={strokeWidth}
                            />
                            <text
                              x={table.x}
                              y={table.y - 5}
                              textAnchor='middle'
                              fill='white'
                              className='text-sm font-bold pointer-events-none'
                            >
                              {table.name}
                            </text>
                            <text
                              x={table.x}
                              y={table.y + 10}
                              textAnchor='middle'
                              fill='white'
                              className='text-xs pointer-events-none'
                            >
                              {table.capacity} chỗ
                            </text>
                          </>
                        )}
                      </g>
                    )
                  })}
                </svg>
              </div>

              <div className='flex gap-3 sm:gap-4 mt-4 p-3 bg-gray-50 rounded-lg overflow-x-auto'>
                <div className='flex items-center gap-2 whitespace-nowrap'>
                  <div className='w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded flex-shrink-0'></div>
                  <span className='text-xs sm:text-sm text-gray-700'>Bàn trống</span>
                </div>
                <div className='flex items-center gap-2 whitespace-nowrap'>
                  <div className='w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded flex-shrink-0'></div>
                  <span className='text-xs sm:text-sm text-gray-700'>Đã đặt</span>
                </div>
                <div className='flex items-center gap-2 whitespace-nowrap'>
                  <div className='w-3 h-3 sm:w-4 sm:h-4 bg-amber-500 rounded flex-shrink-0'></div>
                  <span className='text-xs sm:text-sm text-gray-700'>Đang chọn</span>
                </div>
                <div className='flex items-center gap-2 whitespace-nowrap'>
                  <div className='w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded flex-shrink-0'></div>
                  <span className='text-xs sm:text-sm text-gray-700'>Quầy bar</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div
            className={`
            fixed inset-x-0 bottom-0 z-50 lg:static lg:inset-auto
            transform transition-transform duration-300 ease-in-out
            ${showSidebar ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
            lg:absolute lg:top-0 lg:right-0 lg:w-80 lg:max-h-full
          `}
          >
            <Card className='bg-white/95 backdrop-blur-sm border-0 shadow-2xl lg:shadow-xl rounded-t-2xl lg:rounded-xl m-0 lg:m-4'>
              <CardHeader className='pb-3'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-lg'>Thông Tin Đặt Bàn</CardTitle>
                  <Button variant='ghost' size='sm' className='lg:hidden' onClick={() => setShowSidebar(false)}>
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4 max-h-96 lg:max-h-none overflow-y-auto'>
                {selectedTable ? (
                  <>
                    <div className='text-center p-4 bg-amber-50 rounded-lg border border-amber-200'>
                      <h3 className='text-xl font-bold text-amber-800 mb-2'>Bàn {selectedTable.name}</h3>
                      <Badge variant='secondary' className='mb-2'>
                        <Users className='h-3 w-3 mr-1' />
                        {selectedTable.capacity} chỗ ngồi
                      </Badge>
                      <p className='text-sm text-amber-700'>
                        Hình dạng: {selectedTable.shape === 'circle' ? 'Tròn' : 'Vuông'}
                      </p>
                    </div>

                    <Button className='w-full h-12 bg-orange-500 hover:bg-orange-600 text-white text-base'>
                      Đặt Bàn Ngay
                    </Button>

                    <Button
                      variant='outline'
                      className='w-full h-12 bg-transparent text-base'
                      onClick={() => {
                        setSelected(null)
                        setShowSidebar(false)
                      }}
                    >
                      Hủy Chọn
                    </Button>
                  </>
                ) : (
                  <div className='text-center p-6 text-gray-500'>
                    <Users className='h-12 w-12 mx-auto mb-3 text-gray-300' />
                    <p className='text-sm'>Chọn một bàn trên sơ đồ để xem thông tin chi tiết</p>
                  </div>
                )}

                <div className='pt-4 border-t'>
                  <h4 className='font-semibold mb-3'>Bàn có sẵn:</h4>
                  <div className='space-y-2 max-h-40 overflow-y-auto'>
                    {tables
                      .filter((t) => t.status === 'available')
                      .map((table) => (
                        <div
                          key={table.id}
                          className='flex items-center justify-between p-3 bg-green-50 rounded cursor-pointer hover:bg-green-100 transition-colors touch-manipulation'
                          onClick={() => {
                            setSelected(table.id)
                            if (window.innerWidth < 1024) {
                              setShowSidebar(false)
                            }
                          }}
                        >
                          <span className='font-medium text-green-800'>Bàn {table.name}</span>
                          <Badge variant='outline' className='text-xs'>
                            {table.capacity} chỗ
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
      </div>
    </div>
  )
}
