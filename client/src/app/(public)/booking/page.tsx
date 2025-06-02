'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ReserveForm from './reserve-form'
import { Badge } from '@/components/ui/badge'
import { Clock, Filter, Users } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTableListQuery } from '@/queries/useTable'

export default function TableReservationPage() {
  const { data } = useTableListQuery()
  const tableList = data?.payload.result || []

  // Filter options
  const [capacityFilter, setCapacityFilter] = useState<string>('all')
  const [locationFilter, setLocationFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<string>('grid')

  // Filter tables based on selected filters
  const filteredTables = tableList.filter((table) => {
    const matchesCapacity = capacityFilter === 'all' || table.capacity.toString() === capacityFilter
    const matchesLocation = locationFilter === 'all' || table.location === locationFilter
    return matchesCapacity && matchesLocation
  })

  // Get unique capacity values for filter
  const capacityOptions = Array.from(new Set(tableList.map((table) => table.capacity)))
  // Get unique location values for filter
  const locationOptions = Array.from(new Set(tableList.map((table) => table.location)))

  const [selectedTable, setSelectedTable] = useState<(typeof tableList)[0] | null>(null)
  const [open, setOpen] = useState(false)

  const handleOpen = (table: (typeof tableList)[0]) => {
    setSelectedTable(table)
    setOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500'
      case 'Reserved':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <Badge className='bg-green-500 hover:bg-green-600'>Available</Badge>
      case 'Reserved':
        return <Badge className='bg-red-500 hover:bg-red-600'>Reserved</Badge>
      default:
        return <Badge variant='outline'>Hidden</Badge>
    }
  }

  return (
    <div className='container mx-auto py-8 px-4 md:px-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-bold'>Table Reservation</h1>
          <p className='text-muted-foreground mt-1'>Select a table to make your reservation</p>
        </div>

        <Tabs defaultValue='grid' className='w-full md:w-auto' onValueChange={setViewMode}>
          <TabsList className='grid w-full md:w-[200px] grid-cols-2'>
            <TabsTrigger value='grid'>Grid View</TabsTrigger>
            <TabsTrigger value='list'>List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <Card className='mb-8'>
        <CardContent className='p-4 md:p-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Filter className='h-5 w-5' />
            <h2 className='text-lg font-semibold'>Filters</h2>
          </div>

          <div className='flex flex-col md:flex-row gap-4'>
            <div className='w-full md:w-1/3'>
              <Label htmlFor='capacity-filter' className='text-sm font-medium mb-1.5 block'>
                Capacity
              </Label>
              <Select value={capacityFilter} onValueChange={setCapacityFilter}>
                <SelectTrigger id='capacity-filter' className='w-full'>
                  <SelectValue placeholder='Select capacity' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Capacities</SelectItem>
                  {capacityOptions.map((capacity) => (
                    <SelectItem key={capacity} value={capacity.toString()}>
                      {capacity} People
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='w-full md:w-1/3'>
              <Label htmlFor='location-filter' className='text-sm font-medium mb-1.5 block'>
                Location
              </Label>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger id='location-filter' className='w-full'>
                  <SelectValue placeholder='Select location' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Locations</SelectItem>
                  {locationOptions.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tables Display */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsContent value='grid' className='mt-0'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
            {filteredTables.map((table) => (
              <div key={table._id}>
                <Card
                  className={`overflow-hidden transition-all duration-200 hover:shadow-md ${
                    table.status === 'Available'
                      ? 'border-green-500/50 hover:border-green-500'
                      : table.status === 'Reserved'
                      ? 'border-red-500/50 hover:border-red-500'
                      : 'border-gray-300'
                  }`}
                >
                  <div className={`h-2 w-full ${getStatusColor(table.status)}`}></div>
                  <CardContent className='p-5'>
                    <div className='flex justify-between items-start mb-4'>
                      <h3 className='font-bold text-lg'>Table {table.number}</h3>
                      {getStatusBadge(table.status)}
                    </div>

                    <div className='space-y-2 mb-4'>
                      <div className='flex items-center text-sm text-muted-foreground'>
                        <Users className='h-4 w-4 mr-2' />
                        <span>Capacity: {table.capacity} people</span>
                      </div>
                      <div className='flex items-center text-sm text-muted-foreground'>
                        <Clock className='h-4 w-4 mr-2' />
                        <span>Location: {table.location}</span>
                      </div>
                    </div>

                    <Button
                      className='w-full mt-2'
                      disabled={table.status !== 'Available'}
                      onClick={() => handleOpen(table)}
                      variant={table.status === 'Available' ? 'default' : 'outline'}
                    >
                      {table.status === 'Available'
                        ? 'Booking Now'
                        : table.status === 'Reserved'
                        ? 'Not Available'
                        : 'Hidden'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value='list' className='mt-0'>
          <Card>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b'>
                    <th className='text-left p-4 font-medium'>Table</th>
                    <th className='text-left p-4 font-medium'>Capacity</th>
                    <th className='text-left p-4 font-medium'>Location</th>
                    <th className='text-left p-4 font-medium'>Status</th>
                    <th className='text-right p-4 font-medium'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.map((table) => (
                    <tr key={table._id} className='border-b hover:bg-muted/50'>
                      <td className='p-4'>Table {table.number}</td>
                      <td className='p-4'>{table.capacity} people</td>
                      <td className='p-4'>{table.location}</td>
                      <td className='p-4'>{getStatusBadge(table.status)}</td>
                      <td className='p-4 text-right'>
                        <Button
                          size='sm'
                          disabled={table.status !== 'Available'}
                          onClick={() => handleOpen(table)}
                          variant={table.status === 'Available' ? 'default' : 'outline'}
                        >
                          {table.status === 'Available' ? 'Reserve' : 'View'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reservation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle className='text-xl'>
              Booking Table {selectedTable?.number}
              <span className='ml-2 text-sm font-normal text-muted-foreground'>
                ({selectedTable?.location}, {selectedTable?.capacity} people)
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedTable && <ReserveForm token={selectedTable.token} table_number={selectedTable.number} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
