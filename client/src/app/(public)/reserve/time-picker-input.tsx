"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface TimePickerInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  picker: "hours" | "minutes" | "seconds"
  value: Date
  onChange: (date: Date) => void
  onRightFocus?: () => void
  onLeftFocus?: () => void
}

const TimePickerInput = React.forwardRef<HTMLInputElement, TimePickerInputProps>(
  ({ className, value, onChange, picker, onRightFocus, onLeftFocus, ...props }, ref) => {
    const [stringValue, setStringValue] = React.useState<string>(() => {
      const date = value || new Date()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const seconds = date.getSeconds()

      switch (picker) {
        case "hours":
          return String(hours % 12 || 12).padStart(2, "0")
        case "minutes":
          return String(minutes).padStart(2, "0")
        case "seconds":
          return String(seconds).padStart(2, "0")
      }
    })

    React.useEffect(() => {
      const date = value || new Date()
      const hours = date.getHours()
      const minutes = date.getMinutes()
      const seconds = date.getSeconds()

      switch (picker) {
        case "hours":
          setStringValue(String(hours % 12 || 12).padStart(2, "0"))
          break
        case "minutes":
          setStringValue(String(minutes).padStart(2, "0"))
          break
        case "seconds":
          setStringValue(String(seconds).padStart(2, "0"))
          break
      }
    }, [value, picker])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab") {
        return
      }

      e.preventDefault()

      if (e.key === "ArrowRight" && onRightFocus) {
        onRightFocus()
      } else if (e.key === "ArrowLeft" && onLeftFocus) {
        onLeftFocus()
      }

      if (e.key === "ArrowUp") {
        const newValue = new Date(value)
        switch (picker) {
          case "hours":
            newValue.setHours(newValue.getHours() + 1)
            break
          case "minutes":
            newValue.setMinutes(newValue.getMinutes() + 1)
            break
          case "seconds":
            newValue.setSeconds(newValue.getSeconds() + 1)
            break
        }
        onChange(newValue)
        return
      }

      if (e.key === "ArrowDown") {
        const newValue = new Date(value)
        switch (picker) {
          case "hours":
            newValue.setHours(newValue.getHours() - 1)
            break
          case "minutes":
            newValue.setMinutes(newValue.getMinutes() - 1)
            break
          case "seconds":
            newValue.setSeconds(newValue.getSeconds() - 1)
            break
        }
        onChange(newValue)
        return
      }

      if (!/[0-9]/.test(e.key)) {
        return
      }

      const newStringValue = e.key

      let newValue: number
      let max: number
      const min = 0

      switch (picker) {
        case "hours":
          max = 12
          newValue = Number(newStringValue)
          if (newValue > max) {
            newValue = max
          }
          if (newValue < min) {
            newValue = min
          }

          const newDate = new Date(value)
          const hours = value.getHours()
          const isPM = hours >= 12
          newDate.setHours(isPM ? newValue + 12 : newValue)
          onChange(newDate)
          break
        case "minutes":
          max = 59
          newValue = Number(stringValue.slice(1) + newStringValue)
          if (newValue > max) {
            newValue = max
          }
          if (newValue < min) {
            newValue = min
          }

          const newDateWithMinutes = new Date(value)
          newDateWithMinutes.setMinutes(newValue)
          onChange(newDateWithMinutes)
          break
        case "seconds":
          max = 59
          newValue = Number(stringValue.slice(1) + newStringValue)
          if (newValue > max) {
            newValue = max
          }
          if (newValue < min) {
            newValue = min
          }

          const newDateWithSeconds = new Date(value)
          newDateWithSeconds.setSeconds(newValue)
          onChange(newDateWithSeconds)
          break
      }
    }

    return (
      <Input
        ref={ref}
        className={cn(
          "w-full text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className,
        )}
        value={stringValue}
        onChange={(e) => {
          setStringValue(e.target.value)
        }}
        type="text"
        inputMode="numeric"
        onKeyDown={handleKeyDown}
        {...props}
      />
    )
  },
)

TimePickerInput.displayName = "TimePickerInput"

export { TimePickerInput }
