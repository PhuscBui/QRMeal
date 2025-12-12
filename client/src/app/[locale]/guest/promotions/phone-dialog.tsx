'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface PhoneDialogProps {
  open: boolean
  onClose: () => void
  onSave: (phone: string) => void
}

export function PhoneDialog({ open, onClose, onSave }: PhoneDialogProps) {
  const [phone, setPhone] = useState('')
  const tAuth = useTranslations('auth')
  const tCommon = useTranslations('common')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tAuth('enterPhoneNumber')}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Input placeholder={tAuth('enterPhoneNumber')} value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            {tCommon('cancel')}
          </Button>
          <Button
            onClick={() => {
              if (!phone) return
              onSave(phone)
              setPhone('')
            }}
          >
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
