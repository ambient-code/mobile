import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ModelType } from '@/types/session'

type Props = {
  selectedModel: ModelType
  onSelectModel: (model: ModelType) => void
}

const MODELS = [
  {
    id: ModelType.SONNET_4_5,
    label: 'Sonnet 4.5',
    description: 'Fast & efficient',
    icon: 'flash',
  },
  {
    id: ModelType.OPUS_4_5,
    label: 'Opus 4.5',
    description: 'Most capable',
    icon: 'star',
  },
]

export function ModelSelector({ selectedModel, onSelectModel }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Model</Text>
      <View style={styles.options}>
        {MODELS.map((model) => {
          const isSelected = selectedModel === model.id

          return (
            <TouchableOpacity
              key={model.id}
              style={[styles.option, isSelected && styles.optionSelected]}
              onPress={() => onSelectModel(model.id)}
              activeOpacity={0.7}
            >
              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  <Ionicons
                    name={model.icon as any}
                    size={20}
                    color={isSelected ? '#6366f1' : '#64748b'}
                  />
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {model.label}
                  </Text>
                </View>
                <Text style={styles.optionDescription}>{model.description}</Text>
              </View>
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
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
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f0ff',
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  optionLabelSelected: {
    color: '#6366f1',
  },
  optionDescription: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 28, // Align with label (icon width + gap)
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#6366f1',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
})
