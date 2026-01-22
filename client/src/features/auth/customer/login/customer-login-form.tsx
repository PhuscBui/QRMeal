'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useAppContext } from '@/components/app-provider'
import { generateSocket, handleErrorApi } from '@/lib/utils'
import { LoginBody, LoginBodyType } from '@/schemaValidations/auth.schema'
import { useLoginMutation } from '@/queries/useAuth'
import { Link } from '@/i18n/routing'
import { useTranslations } from 'next-intl'

export default function CustomerLoginForm() {
  const { setRole, setSocket } = useAppContext()
  const loginMutation = useLoginMutation()
  const router = useRouter()
  const t = useTranslations('customerLogin')
  const tAuth = useTranslations('auth')
  
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  async function onSubmit(values: LoginBodyType) {
    if (loginMutation.isPending) return
    try {
      const result = await loginMutation.mutateAsync(values)
      setRole(result.payload.result.account.role)
      setSocket(generateSocket(result.payload.result.access_token))
      router.push('/guest/menu')
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
        <CardTitle className='text-2xl'>{t('title')}</CardTitle>
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
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>{tAuth('email')}</Label>
                      <Input id='email' type='email' required {...field} />
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
                    <div className='grid gap-2'>
                      <Label htmlFor='password'>{tAuth('password')}</Label>
                      <Input id='password' type='password' required {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Link href='/customer/register'>{t('noAccount')}</Link>

              <Button type='submit' className='w-full' disabled={loginMutation.isPending}>
                {loginMutation.isPending ? t('loggingIn') : tAuth('login')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

