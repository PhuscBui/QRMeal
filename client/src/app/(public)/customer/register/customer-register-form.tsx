'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { handleErrorApi } from '@/lib/utils'
import Link from 'next/link'
import { CreateCustomerBody, CreateCustomerBodyType } from '@/schemaValidations/account.schema'
import { useCreateCustomerMutation } from '@/queries/useAccount'
import { toast } from 'sonner'

export default function CustomerRegisterForm() {
  const createCustomerMutation = useCreateCustomerMutation()
  const router = useRouter()
  const form = useForm<CreateCustomerBodyType>({
    resolver: zodResolver(CreateCustomerBody),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      avatar: undefined,
      date_of_birth: undefined,
      password: '',
      confirm_password: ''
    }
  })

  async function onSubmit(values: CreateCustomerBodyType) {
    if (createCustomerMutation.isPending) return
    try {
      const result = await createCustomerMutation.mutateAsync(values)
      toast.success(result.payload.message)
      router.push('/customer/login')
    } catch (error) {
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <Card className='mx-auto max-w-sm'>
      <CardHeader>
        <CardTitle className='text-2xl'>Register</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='space-y-2 max-w-[600px] flex-shrink-0 w-full'
            noValidate
            onSubmit={form.handleSubmit(onSubmit, console.log)}
          >
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='name'>Name</Label>
                      <Input id='name' type='text' required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='phone'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='phone'>Phone</Label>
                      <Input id='phone' type='phone' required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>Email</Label>
                      <Input id='email' type='email' required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='date_of_birth'
                render={({ field }) => (
                  <FormItem className='w-full'>
                    <div className='grid gap-2'>
                      <Label htmlFor='date_of_birth' className='text-sm font-bold'>
                        Date Of Birth
                      </Label>
                      <Input
                        id='date_of_birth'
                        type='date'
                        className='w-fit'
                        value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                      <FormMessage className='text-xs text-red-500' />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='password'>Password</Label>
                      <Input id='password' type='password' required {...field} />
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
                    <div className='grid gap-2'>
                      <Label htmlFor='confirm_password'>Confirm Password</Label>
                      <Input id='confirm_password' type='password' required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Link href='/customer/login'>Already have an account? Login</Link>

              <Button type='submit' className='w-full' disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending ? 'Creating account...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
