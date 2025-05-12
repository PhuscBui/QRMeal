"use client"

import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { handleErrorApi } from "@/lib/utils"
import { ReserveTableBody, type ReserveTableBodyType } from "@/schemaValidations/table.schema"
import { GuestLoginBody, type GuestLoginBodyType } from "@/schemaValidations/guest.schema"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { TimePickerDemo } from "./time-picker"
import { useGuestLoginMutation } from "@/queries/useGuest"
import { useReserveTableMutation } from "@/queries/useTable"
import { useAppContext } from "@/components/app-provider"

export default function ReserveForm({ token, table_number }: { token: string; table_number: number }) {
  const router = useRouter()
  const loginMutation = useGuestLoginMutation()
  const reserveMutation = useReserveTableMutation()
  const { setRole } = useAppContext()


  const form = useForm<GuestLoginBodyType & ReserveTableBodyType>({
    resolver: zodResolver(GuestLoginBody.merge(ReserveTableBody)),
    defaultValues: {
      name: "",
      phone: "",
      table_number: table_number,
      token: token,
      guest_id: "",
      reservation_time: new Date(),
      note: "",
    },
  })

  const onSubmit = async (data: ReserveTableBodyType & GuestLoginBodyType) => {
    try {
        const guest = await loginMutation.mutateAsync({
            name: data.name,
            phone: data.phone,
            token: token,
            table_number: table_number
        })

         setRole(guest.payload.result.guest.role)

         await reserveMutation.mutateAsync({
            table_number: data.table_number,
            guest_id: guest.payload.result.guest._id,
            reservation_time: data.reservation_time,
            note: data.note,
            token: token,
        })

        toast.success("Table reserved successfully!")
        router.push("/guest/menu")

    //   router.push("/")
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError,
      })
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium" htmlFor="name">
                  Name
                </Label>
                <Input id="name" type="text" placeholder="Enter your name" className="mt-1.5" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium" htmlFor="phone">
                  Phone
                </Label>
                <Input id="phone" type="tel" placeholder="Enter your phone number" className="mt-1.5" {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="table_number"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium" htmlFor="table_number">
                  Table Number
                </Label>
                <Input
                  id="table_number"
                  type="number"
                  placeholder="Enter table number"
                  className="mt-1.5"
                  required
                  disabled
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reservation_time"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Label className="text-sm font-medium">Reservation Date & Time</Label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const currentDate = new Date(field.value)
                            date.setHours(currentDate.getHours())
                            date.setMinutes(currentDate.getMinutes())
                            field.onChange(date)
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="flex items-center">
                    <TimePickerDemo setDate={(date) => field.onChange(date)} date={field.value} />
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium" htmlFor="note">
                  Special Requests (Optional)
                </Label>
                <Textarea
                  id="note"
                  placeholder="Any dietary requirements or special requests?"
                  className="mt-1.5 resize-none"
                  rows={3}
                  {...field}
                />
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1" disabled={loginMutation.isPending || reserveMutation.isPending}>
              {loginMutation.isPending || reserveMutation.isPending ? "Submitting..." : "Confirm Reservation"}
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.push("/")}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
