import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { WORKFLOWS } from '@/utils/constants'

type Props = {
  selectedWorkflow?: string
  onSelectWorkflow: (workflowId: string) => void
}

const CARD_GAP = 12
const CARDS_PER_ROW = 2
const SCREEN_PADDING = 24
const cardWidth =
  (Dimensions.get('window').width - SCREEN_PADDING * 2 - CARD_GAP * (CARDS_PER_ROW - 1)) /
  CARDS_PER_ROW

export function WorkflowTypeGrid({ selectedWorkflow, onSelectWorkflow }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Workflow Type</Text>
      <View style={styles.grid}>
        {WORKFLOWS.map((workflow) => {
          const isSelected = selectedWorkflow === workflow.id
          const isDisabled = !workflow.enabled

          return (
            <TouchableOpacity
              key={workflow.id}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
                isDisabled && styles.cardDisabled,
              ]}
              onPress={() => workflow.enabled && onSelectWorkflow(workflow.id)}
              disabled={isDisabled}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Ionicons
                  name={workflow.icon as any}
                  size={24}
                  color={isSelected ? '#6366f1' : isDisabled ? '#cbd5e1' : '#475569'}
                />
                {isDisabled && (
                  <View style={styles.soonBadge}>
                    <Text style={styles.soonText}>Soon</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.cardLabel,
                  isSelected && styles.cardLabelSelected,
                  isDisabled && styles.cardLabelDisabled,
                ]}
              >
                {workflow.label}
              </Text>
              <Text style={[styles.cardDescription, isDisabled && styles.cardDescriptionDisabled]}>
                {workflow.description}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  card: {
    width: cardWidth,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    gap: 8,
  },
  cardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  soonBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  soonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  cardLabelSelected: {
    color: '#6366f1',
  },
  cardLabelDisabled: {
    color: '#cbd5e1',
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748b',
  },
  cardDescriptionDisabled: {
    color: '#cbd5e1',
  },
})
