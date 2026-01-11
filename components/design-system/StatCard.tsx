import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { TOKENS } from '@/utils/constants'

type Variant = 'default' | 'success' | 'warning' | 'danger'

const VARIANT_COLORS = {
  default: TOKENS.primary,
  success: TOKENS.success,
  warning: TOKENS.warning,
  danger: TOKENS.danger,
}

interface StatCardProps {
  label: string
  value: string
  icon: string
  variant?: Variant
  style?: StyleProp<ViewStyle>
}

export function StatCard({ label, value, icon, variant = 'default', style }: StatCardProps) {
  const color = VARIANT_COLORS[variant]

  return (
    <View style={[styles.container, style]}>
      <MaterialCommunityIcons name={icon as any} size={20} color={color} />

      <Text style={[styles.value, { color: TOKENS.textPrimary }]}>{value}</Text>

      <Text style={[styles.label, { color: TOKENS.textMuted }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: TOKENS.card,
    borderRadius: TOKENS.radius12,
    padding: TOKENS.spacing16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: TOKENS.spacing4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: TOKENS.spacing4,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
})
