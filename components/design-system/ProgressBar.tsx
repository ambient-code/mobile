import { View, StyleSheet } from 'react-native'
import { TOKENS } from '@/utils/constants'

interface ProgressBarProps {
  progress: number // 0-1
  color?: string
}

export function ProgressBar({ progress, color = TOKENS.primary }: ProgressBarProps) {
  const percentage = Math.max(0, Math.min(1, progress)) * 100

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            backgroundColor: color,
            shadowColor: color,
          }
        ]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    backgroundColor: TOKENS.card,
    borderRadius: TOKENS.radius8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: TOKENS.radius8,
    shadowRadius: 4,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
})
