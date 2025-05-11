"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTableListQuery } from "@/queries/useTable"
import Link from "next/link"
import { getTableLink } from "@/lib/utils"

// Table data structure
interface Table {
  id: number
  name: string
  capacity: number
  isAvailable: boolean
  location: string
}

export default  function TableReservationPage() {

  const {data} = useTableListQuery()

  // Filter options
  const [capacityFilter, setCapacityFilter] = useState<string>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")

  const tableList = data?.payload.result || []


  // Filter tables based on selected filters
  const filteredTables = tableList.filter((table) => {
    const matchesCapacity = capacityFilter === "all" || table.capacity.toString() === capacityFilter
    const matchesLocation = locationFilter === "all" || table.location === locationFilter
    return matchesCapacity && matchesLocation
  })

  // Get unique capacity values for filter
  const capacityOptions = Array.from(new Set(tableList.map((table) => table.capacity)))
  // Get unique location values for filter
  const locationOptions = Array.from(new Set(tableList.map((table) => table.location)))

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Table Reservation</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4 flex gap-2">
          <Label htmlFor="capacity-filter" className='font-bold'>Filter by Capacity</Label>
          <Select value={capacityFilter} onValueChange={setCapacityFilter}>
            <SelectTrigger id="capacity-filter">
              <SelectValue placeholder="Select capacity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Capacities</SelectItem>
              {capacityOptions.map((capacity) => (
                <SelectItem key={capacity} value={capacity.toString()}>
                  {capacity} People
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/4 flex gap-2">
          <Label htmlFor="location-filter" className='font-bold'>Filter by Location</Label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger id="location-filter">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locationOptions.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.map((table) => (
          <Card
            key={table._id}
            className={`${
              table.status === "Available" 
                ? "border-green-500 border-2" 
                : table.status === "Reserved"
                ? "border-red-500 border-2 opacity-70"
                : "border-gray-500 border-2 opacity-50"
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Table {table.number}</h3>
                  <p className="text-sm text-muted-foreground">Capacity: {table.capacity} people</p>
                  <p className="text-sm text-muted-foreground">Location: {table.location}</p>
                </div>
                <div className="mt-1">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${
                      table.status === "Available" 
                        ? "bg-green-500" 
                        : table.status === "Reserved"
                        ? "bg-red-500"
                        : "bg-gray-500"
                    }`}
                  ></span>
                </div>
              </div>
              <div className="mt-4">
               <Link href={getTableLink({ token: table.token, tableNumber: table.number })+ `&isReserve=true`} className="w-full">
                <Button 
                  className="w-full" 
                  disabled={table.status !== "Available"}
                >
                  {table.status === "Available" 
                    ? "Reserve" 
                    : table.status === "Reserved"
                    ? "Reserved"
                    : "Hidden"}
                </Button>
               </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    
    </div>
  )
}
