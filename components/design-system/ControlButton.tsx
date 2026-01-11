import { Pressable, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { TOKENS } from '@/utils/constants'

interface ControlButtonProps {
  label: string
  isActive?: boolean
  onPress: () => void
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

export function ControlButton({
  label,
  isActive = false,
  onPress,
  disabled = false,
  style,
}: ControlButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isActive && styles.buttonActive,
        disabled && styles.buttonDisabled,
        { opacity: pressed ? 0.7 : 1 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={[
        styles.label,
        { color: isActive ? TOKENS.textPrimary : TOKENS.textSecondary }
      ]}>
        {label}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: TOKENS.card,
    borderRadius: TOKENS.radius12,
    paddingVertical: TOKENS.spacing12,
    paddingHorizontal: TOKENS.spacing16,
    minHeight: 44, // Touch target
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: TOKENS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: TOKENS.labelSize,
    fontWeight: TOKENS.labelWeight,
  },
})
