import { ReactNode, useState } from 'react'
import { SafeAreaView, ScrollView, RefreshControl, StyleSheet } from 'react-native'
import { TOKENS } from '@/utils/constants'

interface ScreenLayoutProps {
  children: ReactNode
  onRefresh?: () => Promise<void>
}

export function ScreenLayout({ children, onRefresh }: ScreenLayoutProps) {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh) return
    setRefreshing(true)
    await onRefresh()
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.bg,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: TOKENS.spacing16,
    paddingTop: TOKENS.spacing24,
    paddingBottom: 40,
  },
})
