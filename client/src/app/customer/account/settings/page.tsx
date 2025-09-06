'use client'

import { useState } from 'react'
import { Settings, Bell, Lock, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className='container mx-auto px-4 py-6 max-w-4xl'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold mb-2'>Cài đặt</h1>
        <p className='text-muted-foreground'>Quản lý cài đặt tài khoản</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='space-y-6'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='general'>Chung</TabsTrigger>
          <TabsTrigger value='notifications'>Thông báo</TabsTrigger>
          <TabsTrigger value='security'>Bảo mật</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Settings className='h-5 w-5' />
                Cài đặt chung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground'>Cài đặt cơ bản của tài khoản</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Thông báo
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Thông báo email</p>
                  <p className='text-sm text-muted-foreground'>Nhận thông báo qua email</p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                />
              </div>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Push notifications</p>
                  <p className='text-sm text-muted-foreground'>Thông báo đẩy trên thiết bị</p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Lock className='h-5 w-5' />
                Bảo mật
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='font-medium'>Xác thực 2 yếu tố</p>
                  <p className='text-sm text-muted-foreground'>Tăng cường bảo mật tài khoản</p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className='flex justify-end mt-8'>
        <Button>
          <Save className='h-4 w-4 mr-2' />
          Lưu cài đặt
        </Button>
      </div>
    </div>
  )
}
