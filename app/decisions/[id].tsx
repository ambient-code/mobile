import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { mockPendingDecisions, completeDecisionReview } from '@/utils/mockInboxData'
import { useTheme } from '@/hooks/useTheme'

export default function ReviewDecisionScreen() {
  const { colors } = useTheme()
  const { id } = useLocalSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [viewedSections, setViewedSections] = useState<Set<string>>(new Set())
  const [comment, setComment] = useState('')
  const [quickResponse, setQuickResponse] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const decision = mockPendingDecisions.find((d) => d.id === id)

  if (!decision?.details) {
    return (
      <View style={[styles.error, { backgroundColor: colors.bg }]}>
        <Text style={{ color: colors.text }}>Decision not found</Text>
      </View>
    )
  }

  const { details } = decision
  const allSectionsViewed = viewedSections.size === details.sections.length

  const handleExpandSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
      // Mark as viewed
      setViewedSections((prev) => new Set([...prev, sectionId]))
    }
    setExpandedSections(newExpanded)
  }

  const handleQuickResponse = (response: string) => {
    setQuickResponse(response)
    setComment(response)
  }

  const handleComplete = async () => {
    try {
      await completeDecisionReview(decision.id, {
        comment,
        quickResponse: quickResponse || undefined,
        viewedSections: Array.from(viewedSections),
      })

      // Show 5-second undo toast (simplified for demo)
      Alert.alert(
        'Review Complete',
        'Your review has been submitted. (Undo functionality will be in full implementation)',
        [{ text: 'OK', onPress: () => router.back() }]
      )
    } catch {
      Alert.alert('Error', 'Failed to complete review')
    }
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Stepper */}
      <View style={styles.stepper}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={styles.stepContainer}>
            <View
              style={[
                styles.stepCircle,
                { backgroundColor: currentStep >= step ? colors.accent : colors.card },
              ]}
            >
              <Text
                style={[
                  styles.stepText,
                  { color: currentStep >= step ? '#FFF' : colors.textSecondary },
                ]}
              >
                {step}
              </Text>
            </View>
            {step < 3 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: currentStep > step ? colors.accent : colors.card },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step 1: Summary */}
      {currentStep === 1 && (
        <View style={styles.stepContent}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Question</Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>{details.question}</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Context</Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>{details.context}</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Analysis</Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>{details.analysis}</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendation</Text>
          <Text style={[styles.sectionText, { color: colors.text }]}>{details.recommendation}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={() => setCurrentStep(2)}
          >
            <Text style={styles.buttonText}>Next →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 2: Key Sections */}
      {currentStep === 2 && (
        <View style={styles.stepContent}>
          <Text style={[styles.title, { color: colors.text }]}>Key Sections</Text>

          {details.sections.map((section) => (
            <View key={section.id} style={[styles.accordionItem, { backgroundColor: colors.card }]}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => handleExpandSection(section.id)}
              >
                <Text style={[styles.accordionTitle, { color: colors.text }]}>
                  {viewedSections.has(section.id) ? '✓ ' : ''}
                  {section.title}
                </Text>
                <Text style={{ color: colors.text }}>
                  {expandedSections.has(section.id) ? '▼' : '▶'}
                </Text>
              </TouchableOpacity>
              {expandedSections.has(section.id) && (
                <Text style={[styles.accordionContent, { color: colors.textSecondary }]}>
                  {section.content}
                </Text>
              )}
            </View>
          ))}

          {!allSectionsViewed && (
            <Text style={[styles.warning, { color: colors.warning }]}>
              Expand all sections to continue
            </Text>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: allSectionsViewed ? colors.accent : colors.card },
            ]}
            onPress={() => allSectionsViewed && setCurrentStep(3)}
            disabled={!allSectionsViewed}
          >
            <Text
              style={[
                styles.buttonText,
                { color: allSectionsViewed ? '#FFF' : colors.textSecondary },
              ]}
            >
              Next →
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Step 3: Comment + Complete */}
      {currentStep === 3 && (
        <View style={styles.stepContent}>
          <Text style={[styles.title, { color: colors.text }]}>Your Feedback</Text>

          <View style={styles.quickChips}>
            {['Looks good', 'Needs discussion', 'Try different approach'].map((chip) => (
              <TouchableOpacity
                key={chip}
                style={[
                  styles.chip,
                  {
                    backgroundColor: quickResponse === chip ? colors.accent : colors.card,
                    borderColor: colors.accent,
                  },
                ]}
                onPress={() => handleQuickResponse(chip)}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: quickResponse === chip ? '#FFF' : colors.text },
                  ]}
                >
                  {chip}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: colors.card, color: colors.text, borderColor: colors.card },
            ]}
            placeholder="Add your comment..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>Complete Review</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  error: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepper: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  stepContent: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  accordionItem: {
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  accordionContent: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  warning: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
