import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { Feather } from '@expo/vector-icons'
import { useTheme } from '@/hooks/useTheme'

interface Source {
  id: string
  type: 'gdoc' | 'url' | 'jira'
  value: string
}

export default function CreateRFEScreen() {
  const { colors } = useTheme()
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sources, setSources] = useState<Source[]>([])
  const [newSourceType, setNewSourceType] = useState<'gdoc' | 'url' | 'jira'>('gdoc')
  const [newSourceValue, setNewSourceValue] = useState('')

  const addSource = () => {
    if (newSourceValue.trim()) {
      const newSource: Source = {
        id: Date.now().toString(),
        type: newSourceType,
        value: newSourceValue.trim(),
      }
      setSources([...sources, newSource])
      setNewSourceValue('')
    }
  }

  const removeSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id))
  }

  const handleSubmit = () => {
    // TODO: Implement batch mode submission with attached gdoc design document
    console.log('Creating RFE in batch mode:', { title, description, sources })
    // For now, just navigate back
    router.back()
  }

  const getSourceIcon = (type: 'gdoc' | 'url' | 'jira') => {
    switch (type) {
      case 'gdoc':
        return 'file-text'
      case 'url':
        return 'link'
      case 'jira':
        return 'package'
      default:
        return 'file'
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View
        style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Create RFE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Title</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter RFE title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Description</Text>
          <TextInput
            style={[
              styles.textArea,
              { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter RFE description"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Sources Section */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Sources & Context</Text>
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>
            Add Google Docs, URLs, or Jira tickets as context for your RFE
          </Text>

          {/* Source Type Selector */}
          <View style={styles.sourceTypeContainer}>
            {(['gdoc', 'url', 'jira'] as const).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: newSourceType === type ? colors.accent : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setNewSourceType(type)}
                accessibilityRole="button"
                accessibilityLabel={`Select ${type} type`}
              >
                <Feather
                  name={getSourceIcon(type)}
                  size={16}
                  color={newSourceType === type ? '#fff' : colors.text}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: newSourceType === type ? '#fff' : colors.text },
                  ]}
                >
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Source Input */}
          <View style={styles.sourceInputContainer}>
            <TextInput
              style={[
                styles.sourceInput,
                { backgroundColor: colors.card, borderColor: colors.border, color: colors.text },
              ]}
              value={newSourceValue}
              onChangeText={setNewSourceValue}
              placeholder={`Enter ${newSourceType.toUpperCase()} link or ID`}
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.accent }]}
              onPress={addSource}
              accessibilityRole="button"
              accessibilityLabel="Add source"
            >
              <Feather name="plus" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Sources List */}
          {sources.length > 0 && (
            <View style={styles.sourcesList}>
              {sources.map((source) => (
                <View
                  key={source.id}
                  style={[
                    styles.sourceItem,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Feather name={getSourceIcon(source.type)} size={16} color={colors.accent} />
                  <View style={styles.sourceContent}>
                    <Text style={[styles.sourceType, { color: colors.textSecondary }]}>
                      {source.type.toUpperCase()}
                    </Text>
                    <Text style={[styles.sourceValue, { color: colors.text }]} numberOfLines={2}>
                      {source.value}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeSource(source.id)}
                    style={styles.removeButton}
                    accessibilityRole="button"
                    accessibilityLabel="Remove source"
                  >
                    <Feather name="x" size={18} color={colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Batch Mode Info */}
        <View style={[styles.infoBanner, { backgroundColor: colors.accent + '20' }]}>
          <Feather name="info" size={20} color={colors.accent} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            This RFE will be created in batch mode. Attach your Google Doc design document to the
            session for processing.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: colors.accent, opacity: !title.trim() ? 0.5 : 1 },
          ]}
          onPress={handleSubmit}
          disabled={!title.trim()}
          accessibilityRole="button"
          accessibilityLabel="Create RFE"
        >
          <Text style={styles.submitButtonText}>Create RFE</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  sourceTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sourceInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  sourceInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourcesList: {
    gap: 8,
  },
  sourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
  },
  sourceContent: {
    flex: 1,
  },
  sourceType: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceValue: {
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
  },
  infoBanner: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})
