/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useDishListQuery } from '@/queries/useDish'
import { cn, formatCurrency, handleErrorApi } from '@/lib/utils'
import { useMemo, useState, useCallback } from 'react'
import type { GuestCreateOrdersBodyType } from '@/schemaValidations/guest.schema'
import { useGuestOrderMutation } from '@/queries/useGuest'
import { useRouter } from 'next/navigation'
import { DishStatus } from '@/constants/type'
import { Input } from '@/components/ui/input'
import { Mic, MicOff, Search } from 'lucide-react'
import { useCategoryListQuery } from '@/queries/useCategory'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTranslations } from 'next-intl'
import DishCard from '@/features/guests/menu/dish-card'
import Quantity from '@/features/guests/menu/quantity'

export default function MenuOrder() {
  const { data } = useDishListQuery()
  const { data: categoryData } = useCategoryListQuery()
  const dishes = useMemo(() => data?.payload.result ?? [], [data])
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])
  const [searchText, setSearchText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const { mutateAsync } = useGuestOrderMutation()
  const router = useRouter()
  const t = useTranslations('guestMenuOrder')
  const totalPrice = useMemo(() => {
    return dishes.reduce((result, dish) => {
      const order = orders.find((order) => order.dish_id === dish._id)
      if (!order) return result
      return result + order.quantity * dish.price
    }, 0)
  }, [dishes, orders])

  const handleQuantityChange = (dish_id: string, quantity: number) => {
    setOrders((prevOrders) => {
      if (quantity === 0) {
        return prevOrders.filter((order) => order.dish_id !== dish_id)
      }
      const index = prevOrders.findIndex((order) => order.dish_id === dish_id)
      if (index === -1) {
        return [...prevOrders, { dish_id, quantity }]
      }
      const newOrders = [...prevOrders]
      newOrders[index] = { ...newOrders[index], quantity }
      return newOrders
    })
  }

  const handleOrder = async () => {
    try {
      await mutateAsync(orders)
      router.push(`/guest/orders`)
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert(t('voiceSearchNotSupported'))
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'vi-VN'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setSearchText(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [t])

  const filteredDishes = useMemo(() => {
    if (!searchText.trim()) return dishes.filter((dish) => dish.status !== DishStatus.Hidden)

    const searchTerms = searchText.toLowerCase().trim().split(/\s+/)
    return dishes.filter((dish) => {
      const dishName = dish.name.toLowerCase()
      const dishDesc = dish.description.toLowerCase()

      const matchesSearch = searchTerms.every((term) => dishName.includes(term) || dishDesc.includes(term))

      return matchesSearch && dish.status !== DishStatus.Hidden
    })
  }, [dishes, searchText])

  return (
    <div className='min-h-screen bg-gray-50 pb-24'>
      <div className='sticky top-0 z-10 bg-white border-b border-gray-200 p-4 shadow-sm'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
          <Input
            placeholder={t('searchDish')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className='pl-10 pr-14 h-12 text-base'
          />
          <Button
            variant='ghost'
            size='sm'
            onClick={startListening}
            className={cn(
              'absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full',
              isListening ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-100'
            )}
            title={t('voiceSearch')}
          >
            {isListening ? <MicOff className='h-4 w-4' /> : <Mic className='h-4 w-4' />}
          </Button>
        </div>
      </div>

      <div className='px-4 py-2'>
        {searchText.trim() ? (
          // ✅ Khi có search: hiển thị trực tiếp món ăn
          <div className='space-y-4'>
            {filteredDishes.map((dish) => (
              <div
                key={dish._id}
                className={cn('flex gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50/50', {
                  'opacity-50': dish.status === DishStatus.Unavailable
                })}
              >
                <div className='flex-shrink-0 relative'>
                  {dish.status === DishStatus.Unavailable && (
                    <div className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg'>
                      <span className='text-white text-xs font-medium px-2 py-1 bg-red-600 rounded'>
                        {t('outOfStock')}
                      </span>
                    </div>
                  )}
                  <Image
                    src={dish.image || 'https://placehold.co/600x400'}
                    alt={dish.name}
                    height={120}
                    width={120}
                    quality={100}
                    className='object-cover w-[100px] h-[100px] rounded-lg'
                  />
                </div>

                <div className='flex-1 space-y-2'>
                  <h3 className='text-base font-semibold text-gray-900 leading-tight'>{dish.name}</h3>
                  <p className='text-sm text-gray-600 leading-relaxed line-clamp-2'>{dish.description}</p>
                  <p className='text-lg font-bold text-orange-600'>{formatCurrency(dish.price)}</p>
                </div>

                <div className='flex-shrink-0 flex items-center'>
                  <Quantity
                    onChange={(value) => handleQuantityChange(dish._id, value)}
                    value={orders.find((order) => order.dish_id === dish._id)?.quantity ?? 0}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          // ✅ Khi không search: hiển thị theo category
          <Accordion type='single' collapsible className='w-full space-y-2'>
            {categoryData?.payload.result.map((cat) => {
              const dishesInCategory = filteredDishes.filter((dish) => dish.category_id === cat._id)
              if (dishesInCategory.length === 0) return null

              return (
                <AccordionItem
                  key={cat._id}
                  value={cat._id}
                  className='border border-gray-200 rounded-lg bg-white shadow-sm'
                >
                  <AccordionTrigger className='px-4 py-3 hover:no-underline'>
                    <div className='flex items-center justify-between w-full'>
                      <span className='text-base font-semibold text-gray-900'>{cat.name}</span>
                      <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2'>
                        {dishesInCategory.length}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className='pb-4'>
                    <div className='space-y-4'>
                      {dishesInCategory.map((dish) => (
                        // reuse card dish component
                        <DishCard
                          key={dish._id}
                          dish={dish}
                          orders={orders}
                          handleQuantityChange={handleQuantityChange}
                        />
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>

      <div className='fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg'>
        <Button
          className={cn(
            'w-full h-14 text-base font-semibold rounded-xl shadow-lg transition-all duration-200',
            orders.length === 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''
          )}
          onClick={handleOrder}
          disabled={orders.length === 0}
        >
          <div className='flex items-center justify-between w-full'>
            <span className='flex items-center gap-2'>
              <span>{t('order')}</span>
              {orders.length > 0 && (
                <span className='bg-white/20 text-white px-2 py-1 rounded-full text-sm'>{orders.length}</span>
              )}
            </span>
            <span className='font-bold'>{formatCurrency(totalPrice)}</span>
          </div>
        </Button>
      </div>
    </div>
  )
}
