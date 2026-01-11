import React from 'react'
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function SettingsScreen() {
  const { colors, themeMode, setThemeMode } = useTheme()
  const { user, logout } = useAuth()

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode)
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Settings</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
          Manage your preferences
        </Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.accountInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('') || 'U'}
              </Text>
            </View>
            <View style={styles.accountDetails}>
              <Text style={[styles.accountName, { color: colors.textPrimary }]}>{user?.name}</Text>
              <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
              <Text style={[styles.accountRole, { color: colors.primary }]}>{user?.role}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <IconSymbol name="moon.fill" size={20} color={colors.textPrimary} />
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
            </View>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {themeMode === 'system' ? 'Auto' : themeMode === 'dark' ? 'On' : 'Off'}
            </Text>
          </View>

          <View style={[styles.themeOptions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'light' && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() => handleThemeChange('light')}
              activeOpacity={0.7}
            >
              <IconSymbol name="sun.max.fill" size={24} color={colors.textPrimary} />
              <Text style={[styles.themeOptionText, { color: colors.textPrimary }]}>Light</Text>
              {themeMode === 'light' && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'dark' && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() => handleThemeChange('dark')}
              activeOpacity={0.7}
            >
              <IconSymbol name="moon.fill" size={24} color={colors.textPrimary} />
              <Text style={[styles.themeOptionText, { color: colors.textPrimary }]}>Dark</Text>
              {themeMode === 'dark' && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                themeMode === 'system' && { backgroundColor: colors.primary + '20' },
              ]}
              onPress={() => handleThemeChange('system')}
              activeOpacity={0.7}
            >
              <IconSymbol name="sparkles" size={24} color={colors.textPrimary} />
              <Text style={[styles.themeOptionText, { color: colors.textPrimary }]}>Auto</Text>
              {themeMode === 'system' && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Blocking Alerts
              </Text>
            </View>
            <Switch
              value={user?.preferences.notifications.blockingAlerts}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={
                user?.preferences.notifications.blockingAlerts ? colors.primary : colors.card
              }
              ios_backgroundColor={colors.border}
            />
          </View>

          <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Review Requests
              </Text>
            </View>
            <Switch
              value={user?.preferences.notifications.reviewRequests}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={
                user?.preferences.notifications.reviewRequests ? colors.primary : colors.card
              }
              ios_backgroundColor={colors.border}
            />
          </View>

          <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Session Updates
              </Text>
            </View>
            <Switch
              value={user?.preferences.notifications.sessionUpdates}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={
                user?.preferences.notifications.sessionUpdates ? colors.primary : colors.card
              }
              ios_backgroundColor={colors.border}
            />
          </View>

          <View style={[styles.settingRow, { borderTopColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>
                Features & News
              </Text>
            </View>
            <Switch
              value={user?.preferences.notifications.featuresAndNews}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={
                user?.preferences.notifications.featuresAndNews ? colors.primary : colors.card
              }
              ios_backgroundColor={colors.border}
            />
          </View>
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT</Text>

        <TouchableOpacity
          style={[styles.card, styles.dangerButton, { backgroundColor: colors.danger + '10' }]}
          onPress={logout}
          activeOpacity={0.7}
        >
          <Text style={[styles.dangerButtonText, { color: colors.danger }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  accountInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  accountDetails: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  accountName: {
    fontSize: 18,
    fontWeight: '700',
  },
  accountEmail: {
    fontSize: 14,
  },
  accountRole: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    position: 'relative',
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dangerButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
