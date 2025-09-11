'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { ChangePasswordBody, ChangePasswordBodyType } from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { useChangePasswordMutation } from '@/queries/useAccount'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { Save } from 'lucide-react'

export default function ChangePasswordForm() {
  const changePasswordMutation = useChangePasswordMutation()
  const form = useForm<ChangePasswordBodyType>({
    resolver: zodResolver(ChangePasswordBody),
    defaultValues: {
      old_password: '',
      password: '',
      confirm_password: ''
    }
  })
  const onSubmit = async (data: ChangePasswordBodyType) => {
    if (changePasswordMutation.isPending) return
    try {
      const result = await changePasswordMutation.mutateAsync(data)
      toast('Success', {
        description: result.payload.message
      })
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  const reset = () => {
    form.reset()
  }

  return (
    <Form {...form}>
      <form
        noValidate
        className='grid auto-rows-max md:col-span-1 items-start gap-4 md:gap-8'
        onSubmit={form.handleSubmit(onSubmit)}
        onReset={reset}
      >
        <div className='grid gap-6'>
          <FormField
            control={form.control}
            name='old_password'
            render={({ field }) => (
              <FormItem>
                <div className='grid gap-3'>
                  <Label htmlFor='oldPassword' className='font-bold'>
                    Old Password
                  </Label>
                  <Input
                    autoComplete='current-password'
                    id='oldPassword'
                    type='password'
                    className='w-full'
                    {...field}
                  />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <div className='grid gap-3'>
                  <Label htmlFor='password' className='font-bold'>
                    New Password
                  </Label>
                  <Input autoComplete='new-password' id='password' type='password' className='w-full' {...field} />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='confirm_password'
            render={({ field }) => (
              <FormItem>
                <div className='grid gap-3'>
                  <Label htmlFor='confirmPassword' className='font-bold'>
                    Confirm New Password
                  </Label>
                  <Input
                    autoComplete='new-password'
                    id='confirmPassword'
                    type='password'
                    className='w-full'
                    {...field}
                  />
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
          <div className=' items-center gap-2 md:ml-auto flex'>
            <Button variant='outline' size='sm' type='reset' className='w-1/2 md:w-auto'>
              Reset
            </Button>
            <Button size='sm' type='submit' className='w-1/2 md:w-auto' disabled={changePasswordMutation.isPending}>
              <Save className='h-4 w-4 mr-2' />
              Change Password
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
