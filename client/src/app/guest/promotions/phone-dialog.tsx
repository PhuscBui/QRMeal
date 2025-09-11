'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

interface PhoneDialogProps {
  open: boolean
  onClose: () => void
  onSave: (phone: string) => void
}

export function PhoneDialog({ open, onClose, onSave }: PhoneDialogProps) {
  const [phone, setPhone] = useState('')

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Phone Number</DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <Input placeholder='Enter Phone Number' value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!phone) return
              onSave(phone)
              setPhone('')
            }}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
