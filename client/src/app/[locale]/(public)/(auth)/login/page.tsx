/* eslint-disable @next/next/no-img-element */
import LoginForm from '@/app/[locale]/(public)/(auth)/login/login-form'
import { QrCode } from 'lucide-react'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-start'>
          <a href='#' className='flex items-center gap-2 font-medium'>
            <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
              <QrCode className='size-4' />
            </div>
            QR Meal
          </a>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <Suspense fallback={<div>Loading...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
      <div className='relative hidden bg-muted lg:block'>
        <img
          src='/login.svg'
          alt='Image'
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
        />
      </div>
    </div>
  )
}

