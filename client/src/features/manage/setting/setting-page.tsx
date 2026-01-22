import ChangePasswordForm from '@/features/manage/setting/change-password-form'
import UpdateProfileForm from '@/features/manage/setting/update-profile-form'
import { useTranslations } from 'next-intl'

export default function SettingPage() {
  const t = useTranslations('account')

  return (
    <main className='grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
      <div className='mx-auto grid w-full flex-1 auto-rows-max gap-4'>
        <div className='flex items-center gap-4'>
          <h1 className='flex-1 shrink-0 whitespace-nowrap text-2xl font-semibold tracking-tight sm:grow-0'>
            {t('accountSetting')}
          </h1>
        </div>
        <div className='grid gap-4 md:grid-cols-3 md:gap-8'>
          <UpdateProfileForm />
          <ChangePasswordForm />
        </div>
      </div>
    </main>
  )
}
