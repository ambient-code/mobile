import React, { memo } from 'react'
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { useApiStatus, ApiStatus } from '@/hooks/useApiStatus'
import { IconSymbol } from '@/components/ui/icon-symbol'

interface ApiStatusIndicatorProps {
  showLabel?: boolean
  size?: 'small' | 'medium' | 'large'
  onPress?: () => void
}

/**
 * Displays real-time API connection status with visual indicator
 * Implements FR-018: System MUST display ACP API status on login screen
 */
export const ApiStatusIndicator = memo<ApiStatusIndicatorProps>(
  ({ showLabel = true, size = 'medium', onPress }) => {
    const { colors } = useTheme()
    const { status, lastChecked, checkHealth, error } = useApiStatus(true)

    const getStatusColor = () => {
      switch (status) {
        case ApiStatus.ONLINE:
          return '#10B981' // Green
        case ApiStatus.OFFLINE:
        case ApiStatus.ERROR:
          return '#EF4444' // Red
        case ApiStatus.CHECKING:
          return '#F59E0B' // Orange
        default:
          return colors.textSecondary
      }
    }

    const getStatusIcon = () => {
      switch (status) {
        case ApiStatus.ONLINE:
          return 'checkmark.circle.fill'
        case ApiStatus.OFFLINE:
        case ApiStatus.ERROR:
          return 'xmark.circle.fill'
        case ApiStatus.CHECKING:
          return 'arrow.clockwise.circle.fill'
        default:
          return 'questionmark.circle.fill'
      }
    }

    const getStatusText = () => {
      switch (status) {
        case ApiStatus.ONLINE:
          return 'API Online'
        case ApiStatus.OFFLINE:
          return 'API Offline'
        case ApiStatus.ERROR:
          return 'API Error'
        case ApiStatus.CHECKING:
          return 'Checking...'
        default:
          return 'Unknown'
      }
    }

    const getIconSize = () => {
      switch (size) {
        case 'small':
          return 16
        case 'medium':
          return 20
        case 'large':
          return 24
        default:
          return 20
      }
    }

    const getTextSize = () => {
      switch (size) {
        case 'small':
          return 12
        case 'medium':
          return 14
        case 'large':
          return 16
        default:
          return 14
      }
    }

    const handlePress = () => {
      if (onPress) {
        onPress()
      } else {
        // Default behavior: retry health check
        checkHealth()
      }
    }

    const Container = onPress || status !== ApiStatus.ONLINE ? TouchableOpacity : View

    return (
      <Container
        style={[
          styles.container,
          size === 'small' && styles.containerSmall,
          size === 'large' && styles.containerLarge,
        ]}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`API status: ${getStatusText()}`}
        accessibilityHint={
          status !== ApiStatus.ONLINE ? 'Double tap to retry connection' : undefined
        }
      >
        {status === ApiStatus.CHECKING ? (
          <ActivityIndicator size="small" color={getStatusColor()} />
        ) : (
          <IconSymbol
            name={getStatusIcon() as Parameters<typeof IconSymbol>[0]['name']}
            size={getIconSize()}
            color={getStatusColor()}
          />
        )}

        {showLabel && (
          <View style={styles.textContainer}>
            <Text style={[styles.statusText, { color: getStatusColor(), fontSize: getTextSize() }]}>
              {getStatusText()}
            </Text>
            {lastChecked && size !== 'small' && (
              <Text style={[styles.timestampText, { color: colors.textSecondary }]}>
                Last checked: {lastChecked.toLocaleTimeString()}
              </Text>
            )}
            {error && size === 'large' && (
              <Text style={[styles.errorText, { color: colors.error }]} numberOfLines={2}>
                {error}
              </Text>
            )}
          </View>
        )}
      </Container>
    )
  }
)

ApiStatusIndicator.displayName = 'ApiStatusIndicator'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  containerSmall: {
    padding: 6,
    gap: 4,
  },
  containerLarge: {
    padding: 16,
    gap: 12,
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  statusText: {
    fontWeight: '600',
  },
  timestampText: {
    fontSize: 11,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
})
