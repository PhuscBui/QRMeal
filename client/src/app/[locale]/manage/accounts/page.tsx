import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import AccountTable from "@/app/manage/accounts/account-table";
import { useTranslations } from 'next-intl'
import { Suspense } from "react";

export default function AccountsPage() {
  const t = useTranslations('account')
  
  return (
    <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="space-y-2">
        <Card x-chunk="dashboard-06-chunk-0">
          <CardHeader>
            <CardTitle className="font-bold text-2xl">{t('title')}</CardTitle>
            <CardDescription>
              {t('accountsManagement')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense>
              <AccountTable />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
