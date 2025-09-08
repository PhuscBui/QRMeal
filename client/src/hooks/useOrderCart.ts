import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  notes?: string
}

interface OrderCartOptions {
  orderType: 'dine-in' | 'takeaway' | 'delivery'
  onOrderPlaced?: (orderData: any) => void
}

export function useOrderCart({ orderType, onOrderPlaced }: OrderCartOptions) {
  const router = useRouter()
  const [cart, setCart] = useState<Record<string, CartItem>>({})
  const [isLoading, setIsLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart')
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }))
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[itemId]) {
        if (newCart[itemId].quantity > 1) {
          newCart[itemId].quantity -= 1
        } else {
          delete newCart[itemId]
        }
      }
      return newCart
    })
  }, [])

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
    } else {
      setCart(prev => ({
        ...prev,
        [itemId]: {
          ...prev[itemId],
          quantity
        }
      }))
    }
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCart({})
    localStorage.removeItem('cart')
  }, [])

  const getCartItems = useCallback(() => {
    return Object.values(cart)
  }, [cart])

  const getCartItemCount = useCallback(() => {
    return Object.values(cart).reduce((sum, item) => sum + item.quantity, 0)
  }, [cart])

  const getCartTotal = useCallback(() => {
    return Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [cart])

  const proceedToCheckout = useCallback(() => {
    if (getCartItemCount() === 0) {
      return
    }

    // Store order type for checkout
    localStorage.setItem('orderType', orderType)
    
    // Navigate to checkout
    router.push(`/customer/${orderType}/checkout`)
  }, [orderType, router, getCartItemCount])

  const placeOrder = useCallback(async (orderData: any) => {
    setIsLoading(true)
    
    try {
      // In real app, this would call the API
      console.log('Placing order:', {
        orderType,
        cart: getCartItems(),
        ...orderData
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Store order data
      const order = {
        id: `ORD-${Date.now()}`,
        orderNumber: `QRM-${Date.now()}`,
        orderType,
        status: 'pending',
        createdAt: new Date().toISOString(),
        items: getCartItems(),
        total: getCartTotal(),
        ...orderData
      }

      // Store in localStorage (in real app, this would be handled by the API)
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
      localStorage.setItem('orders', JSON.stringify([order, ...existingOrders]))

      // Clear cart
      clearCart()

      // Call callback if provided
      onOrderPlaced?.(order)

      // Navigate to orders page
      router.push(`/customer/${orderType}/orders`)

    } catch (error) {
      console.error('Error placing order:', error)
    } finally {
      setIsLoading(false)
    }
  }, [orderType, getCartItems, getCartTotal, clearCart, onOrderPlaced, router])

  return {
    cart,
    cartItems: getCartItems(),
    cartItemCount: getCartItemCount(),
    cartTotal: getCartTotal(),
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    proceedToCheckout,
    placeOrder
  }
}
