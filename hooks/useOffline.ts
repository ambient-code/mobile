import { useState, useEffect } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const offline = state.isConnected === false
      const connected = state.isConnected === true && state.isInternetReachable !== false

      setIsOffline(offline)
      setIsConnected(connected)
    })

    return () => unsubscribe()
  }, [])

  return { isOffline, isConnected }
}
