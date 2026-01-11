import { Text, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { TOKENS } from '@/utils/constants'

interface SectionHeaderProps {
  title: string
  style?: StyleProp<ViewStyle>
}

export function SectionHeader({ title, style }: SectionHeaderProps) {
  return (
    <Text style={[styles.header, style]}>
      {title}
    </Text>
  )
}

const styles = StyleSheet.create({
  header: {
    fontSize: TOKENS.labelSize,
    fontWeight: TOKENS.labelWeight,
    color: TOKENS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: TOKENS.spacing12,
  },
})
