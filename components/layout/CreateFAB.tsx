import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable, Platform } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'
import { useRouter } from 'expo-router'

interface CreateOption {
  id: string
  label: string
  icon: keyof typeof Feather.glyphMap
  route?: string
  soon?: boolean
}

/**
 * Floating Action Button for creating new items
 * Shows a modal with creation options when tapped
 */
export function CreateFAB() {
  const { colors } = useTheme()
  const router = useRouter()
  const [modalVisible, setModalVisible] = useState(false)

  // @ts-expect-error lucide-react-native icon name type complexity
  const createOptions: CreateOption[] = [
    { id: 'agent', label: 'Agent', icon: 'user', soon: false },
    { id: 'scheduled-task', label: 'Scheduled Task', icon: 'clock', soon: false },
    { id: 'session', label: 'Session', icon: 'zap', route: '/sessions/new' },
    { id: 'skill', label: 'Skill', icon: 'target', soon: false },
    { id: 'workflow', label: 'Workflow', icon: 'git-branch', soon: true },
  ].sort((a, b) => a.label.localeCompare(b.label))

  const handleOptionPress = (option: CreateOption) => {
    setModalVisible(false)

    if (option.soon) {
      // TODO: Show "Coming Soon" toast
      console.log(`${option.label} coming soon!`)
      return
    }

    if (option.route) {
      router.push(option.route as any)
    } else {
      // TODO: Navigate to specific creation screens when implemented
      console.log(`Create ${option.label} - Not implemented yet`)
    }
  }

  return (
    <>
      {/* FAB Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.accent }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Create new item"
        accessibilityHint="Double tap to see creation options"
      >
        <Feather name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Creation Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create New</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Feather name="x" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Options */}
              <View style={styles.optionsContainer}>
                {createOptions.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      {
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => handleOptionPress(option)}
                    activeOpacity={0.7}
                    disabled={option.soon}
                  >
                    <View style={[styles.optionIconContainer, { backgroundColor: colors.accent }]}>
                      <Feather
                        name={option.icon}
                        size={20}
                        color={option.soon ? colors.textSecondary : '#fff'}
                      />
                    </View>
                    <Text
                      style={[
                        styles.optionLabel,
                        {
                          color: option.soon ? colors.textSecondary : colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.soon && (
                      <View style={[styles.soonBadge, { backgroundColor: colors.border }]}>
                        <Text style={[styles.soonText, { color: colors.textSecondary }]}>Soon</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 90 : 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxWidth: 400,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  soonText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
})
