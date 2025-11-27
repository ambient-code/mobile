import React, { useState, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useTheme } from '@/hooks/useTheme'
import { useUpdateSession } from '@/hooks/useUpdateSession'
import { useToast } from '@/hooks/useToast'

interface ApprovalActionsProps {
  sessionId: string
  sessionName: string
  onSuccess?: () => void
}

export function ApprovalActions({ sessionId, sessionName, onSuccess }: ApprovalActionsProps) {
  const { colors } = useTheme()
  const updateSession = useUpdateSession()
  const { showToast } = useToast()

  const [approveModalVisible, setApproveModalVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleApprove = useCallback(async () => {
    setApproveModalVisible(false)
    setIsProcessing(true)

    try {
      await updateSession.mutateAsync({
        id: sessionId,
        request: { action: 'approve' },
      })

      showToast({
        type: 'success',
        title: 'Session Approved',
        message: `${sessionName} has been approved and marked complete`,
        sessionId,
      })

      onSuccess?.()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Approval Failed',
        message: error instanceof Error ? error.message : 'Failed to approve session',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [sessionId, sessionName, updateSession, showToast, onSuccess])

  const handleReject = useCallback(async () => {
    setRejectModalVisible(false)
    setIsProcessing(true)

    try {
      await updateSession.mutateAsync({
        id: sessionId,
        request: {
          action: 'reject',
          feedback: feedback.trim() || undefined,
        },
      })

      showToast({
        type: 'session',
        title: 'Session Rejected',
        message: 'Claude will make the requested changes',
        sessionId,
      })

      setFeedback('')
      onSuccess?.()
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Rejection Failed',
        message: error instanceof Error ? error.message : 'Failed to reject session',
      })
    } finally {
      setIsProcessing(false)
    }
  }, [sessionId, feedback, updateSession, showToast, onSuccess])

  const isButtonDisabled = isProcessing || updateSession.isPending

  return (
    <View style={styles.container}>
      {/* Action Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.rejectButton,
            { backgroundColor: colors.error },
            isButtonDisabled && styles.buttonDisabled,
          ]}
          onPress={() => setRejectModalVisible(true)}
          disabled={isButtonDisabled}
          activeOpacity={0.8}
        >
          {isProcessing && !approveModalVisible ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reject</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.approveButton,
            { backgroundColor: colors.success },
            isButtonDisabled && styles.buttonDisabled,
          ]}
          onPress={() => setApproveModalVisible(true)}
          disabled={isButtonDisabled}
          activeOpacity={0.8}
        >
          {isProcessing && !rejectModalVisible ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Approve ✓</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Approve Confirmation Modal */}
      <Modal
        visible={approveModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setApproveModalVisible(false)}
        hardwareAccelerated
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Approve Session?</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              This will mark "{sessionName}" as completed and merge the changes.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.bg }]}
                onPress={() => setApproveModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.success }]}
                onPress={handleApprove}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Approve ✓</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Reject Feedback Modal */}
      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
        hardwareAccelerated
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Reject Session?</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Provide feedback for Claude to make changes. Feedback is optional.
            </Text>

            <TextInput
              style={[
                styles.feedbackInput,
                { backgroundColor: colors.bg, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Describe what needs to be changed..."
              placeholderTextColor={colors.textSecondary}
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={[styles.feedbackNote, { color: colors.textSecondary }]}>
              You can reject without feedback if you prefer
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.bg }]}
                onPress={() => {
                  setRejectModalVisible(false)
                  setFeedback('')
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                onPress={handleReject}
                activeOpacity={0.7}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  rejectButton: {},
  approveButton: {},
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  feedbackInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    marginBottom: 8,
  },
  feedbackNote: {
    fontSize: 13,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
})
