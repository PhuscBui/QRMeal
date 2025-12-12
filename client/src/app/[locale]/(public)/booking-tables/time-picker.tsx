'use client'

import React from 'react'

import { Clock } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { TimePickerInput } from '@/app/[locale]/(public)/booking-tables/time-picker-input'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface TimePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function TimePicker({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn('w-full justify-start text-left font-normal', !date && 'text-muted-foreground')}
        >
          <Clock className='mr-2 h-4 w-4' />
          {date ? format(date, 'h:mm a') : <span>Pick a time</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex items-end gap-2'>
            <div className='grid gap-1 text-center'>
              <Label htmlFor='hours' className='text-xs'>
                Hours
              </Label>
              <TimePickerInput
                className='w-16'
                value={date}
                onChange={setDate}
                picker='hours'
                ref={hourRef}
                onRightFocus={() => minuteRef.current?.focus()}
              />
            </div>
            <div className='grid gap-1 text-center'>
              <Label htmlFor='minutes' className='text-xs'>
                Minutes
              </Label>
              <TimePickerInput
                className='w-16'
                value={date}
                onChange={setDate}
                picker='minutes'
                ref={minuteRef}
                onLeftFocus={() => hourRef.current?.focus()}
              />
            </div>
            <div className='flex h-10 items-center'>
              <Button
                variant='ghost'
                className='rounded-full px-2'
                type='button'
                onClick={() => {
                  const newDate = new Date(date)
                  newDate.setHours(newDate.getHours() < 12 ? newDate.getHours() + 12 : newDate.getHours() - 12)
                  setDate(newDate)
                }}
              >
                {date.getHours() >= 12 ? 'PM' : 'AM'}
              </Button>
            </div>
          </div>
          <div className='flex justify-end gap-2'>
            <Button
              size='sm'
              onClick={() => {
                const now = new Date()
                const newDate = new Date(date)
                newDate.setHours(now.getHours())
                newDate.setMinutes(now.getMinutes())
                setDate(newDate)
              }}
            >
              Now
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

