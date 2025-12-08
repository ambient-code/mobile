import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Forecast } from '@/types/inbox'
import { useTheme } from '@/hooks/useTheme'

interface ForecastCardProps {
  forecast: Forecast
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const { colors } = useTheme()

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>Forecast</Text>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Deep Work Window</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {formatTime(forecast.deepWorkWindow.start)} - {formatTime(forecast.deepWorkWindow.end)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Next Review Batch</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {formatTime(forecast.nextReviewBatch)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Agent Hours in Progress</Text>
        <Text style={[styles.value, { color: colors.accent }]}>
          {forecast.agentHoursInProgress} hours
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
})
