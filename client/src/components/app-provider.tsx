'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import RefreshToken from '@/components/refresh-token'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { decodeToken, generateSocket, getAccessTokenFromLocalStorage, removeTokensFromLocalStorage } from '@/lib/utils'
import { RoleType } from '@/types/jwt.types'
import { type Socket } from 'socket.io-client'

// Default
// staleTime: 0
// gc: 5 minutes (5 * 1000* 60)

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

const AppContext = createContext({
  isAuth: false,
  role: undefined as RoleType | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setRole: (role?: RoleType | undefined) => {},
  socket: undefined as Socket | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setSocket: (socket?: Socket | undefined) => {},
  disconnectSocket: () => {}
})

export const useAppContext = () => {
  return useContext(AppContext)
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | undefined>()
  const [role, setRoleState] = useState<RoleType | undefined>()
  const count = useRef(0)
  useEffect(() => {
    if (count.current > 0) return
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      const role = decodeToken(accessToken).role
      setRoleState(role)
      setSocket(generateSocket(accessToken))
    }
    count.current++
  }, [])

  const disconnectSocket = useCallback(() => {
    socket?.disconnect()
    setSocket(undefined)
  }, [socket, setSocket])

  // const setRole = useCallback((role?: RoleType | undefined) => {
  //   setRoleState(role);
  //   if (!role) {
  //     removeTokensFromLocalStorage();
  //   }
  // }, []);

  const setRole = (role?: RoleType | undefined) => {
    setRoleState(role)
    if (!role) {
      removeTokensFromLocalStorage()
    }
  }

  const isAuth = Boolean(role)

  return (
    <AppContext value={{ role, setRole, isAuth, socket, setSocket, disconnectSocket }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
      </QueryClientProvider>
    </AppContext>
  )
}
