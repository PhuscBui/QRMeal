'use client'

import { useEffect, useRef, useState } from 'react'
import { Settings, Bell, Lock, Save, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAccountMe, useUpdateMeMutation } from '@/queries/useAccount'
import { useUploadMediaMutation } from '@/queries/useMedia'
import { UpdateMeBody, UpdateMeBodyType } from '@/schemaValidations/account.schema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { handleErrorApi } from '@/lib/utils'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import ChangePasswordForm from '@/app/customer/account/settings/change-password-form'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  const [file, setFile] = useState<File | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const { data, refetch } = useAccountMe()
  const updateMeMutation = useUpdateMeMutation()
  const uploadMediaMutation = useUploadMediaMutation()
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      avatar: undefined,
      date_of_birth: undefined
    }
  })

  const avatar = form.watch('avatar')
  const name = form.watch('name')
  useEffect(() => {
    if (data) {
      const { name, avatar, date_of_birth, email, phone } = data.payload.result
      form.reset({
        name,
        avatar: avatar ?? undefined,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
        email,
        phone
      })
    }
  }, [form, data])

  const previewAvatar = file ? URL.createObjectURL(file) : avatar

  const reset = () => {
    form.reset()
    setFile(null)
  }
  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return
    try {
      let body = values
      if (file) {
        const formData = new FormData()
        formData.append('image', file)
        const uploadImageResult = await uploadMediaMutation.mutateAsync(formData)
        const imageUrl = uploadImageResult.payload.result
        body = {
          ...values,
          avatar: imageUrl
        }
      }
      console.log(body)
      const result = await updateMeMutation.mutateAsync(body)

      toast('Success', {
        description: result.payload.message
      })
      refetch()
    } catch (error) {
      console.log(error)
      handleErrorApi({
        error,
        setError: form.setError
      })
    }
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Settings</h1>
        <p className='text-muted-foreground'>Manage account settings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 justify-center'>
                <Settings className='h-5 w-5' />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-6'>
                <Form {...form}>
                  <form
                    noValidate
                    className='grid auto-rows-max md:col-span-2 items-start gap-4 md:gap-8'
                    onReset={reset}
                    onSubmit={form.handleSubmit(onSubmit, (e) => {
                      console.log(e)
                    })}
                  >
                    <FormField
                      control={form.control}
                      name='avatar'
                      render={({ field }) => (
                        <FormItem>
                          <div className='flex gap-2  justify-center items-center pb-1'>
                            <Avatar className='aspect-square w-[120px] h-[120px] rounded-md object-cover'>
                              <AvatarImage src={previewAvatar} />
                              <AvatarFallback className='rounded-none'>{name}</AvatarFallback>
                            </Avatar>
                            <input
                              type='file'
                              accept='image/*'
                              className='hidden'
                              ref={avatarInputRef}
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setFile(file)
                                  field.onChange('http://localhost:3000/' + field.name)
                                }
                              }}
                            />
                            <button
                              className='flex aspect-square w-[120px] items-center justify-center rounded-md border border-dashed hover:cursor-pointer'
                              type='button'
                              onClick={() => avatarInputRef.current?.click()}
                            >
                              <Upload className='h-4 w-4 text-muted-foreground' />
                              <span className='sr-only'>Upload</span>
                            </button>
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6'>
                      <FormField
                        control={form.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <div className='grid gap-2'>
                              <Label htmlFor='name' className='text-sm font-bold'>
                                Name
                              </Label>
                              <Input
                                id='name'
                                type='text'
                                className='w-full'
                                placeholder='Enter your name'
                                {...field}
                              />
                              <FormMessage className='text-xs text-red-500' />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='email'
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <div className='grid gap-2'>
                              <Label htmlFor='email' className='text-sm font-bold'>
                                Email
                              </Label>
                              <Input
                                id='email'
                                type='text'
                                className='w-full'
                                placeholder='Enter your email'
                                {...field}
                              />
                              <FormMessage className='text-xs text-red-500' />
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name='phone'
                        render={({ field }) => (
                          <FormItem className='w-full'>
                            <div className='grid gap-2'>
                              <Label htmlFor='phone' className='text-sm font-bold'>
                                Phone
                              </Label>
                              <Input
                                id='phone'
                                type='text'
                                className='w-full'
                                placeholder='Enter your phone number'
                                {...field}
                              />
                              <FormMessage className='text-xs text-red-500' />
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
                    </div>

                    <div className=' items-center gap-2 md:ml-auto flex'>
                      <Button variant='outline' size='sm' type='reset' className='w-1/2 md:w-auto'>
                        Reset
                      </Button>
                      <Button
                        size='sm'
                        type='submit'
                        className='w-1/2 md:w-auto'
                        disabled={updateMeMutation.isPending || uploadMediaMutation.isPending}
                      >
                        <Save className='h-4 w-4 mr-2' />
                        {updateMeMutation.isPending || uploadMediaMutation.isPending ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Email Notifications</p>
                  <p className='text-sm text-muted-foreground'>Receive notifications via email</p>
                </div>
                <Switch />
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Push notifications</p>
                  <p className='text-sm text-muted-foreground'>Push notifications on devices</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 justify-center'>
                <Lock className='h-5 w-5' />
                Password & Security
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
