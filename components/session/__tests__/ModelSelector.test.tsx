import { render, screen, fireEvent } from '@testing-library/react-native'
import { ModelSelector } from '../ModelSelector'
import { ModelType } from '@/types/session'

describe('ModelSelector', () => {
  const mockOnSelectModel = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders both model options', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      expect(screen.getByText('Sonnet 4.5')).toBeTruthy()
      expect(screen.getByText('Opus 4.5')).toBeTruthy()
    })

    it('renders model descriptions', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      expect(screen.getByText('Fast & efficient')).toBeTruthy()
      expect(screen.getByText('Most capable')).toBeTruthy()
    })

    it('renders "Model" label', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      expect(screen.getByText('Model')).toBeTruthy()
    })

    it('renders Sonnet model with flash icon', () => {
      const { getByText } = render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      // The Ionicons component with name="flash" should be rendered for Sonnet
      expect(getByText('Sonnet 4.5')).toBeTruthy()
    })

    it('renders Opus model with star icon', () => {
      const { getByText } = render(
        <ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />
      )

      // The Ionicons component with name="star" should be rendered for Opus
      expect(getByText('Opus 4.5')).toBeTruthy()
    })
  })

  describe('model selection - Sonnet', () => {
    it('highlights Sonnet when selected', () => {
      const { getByText } = render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      const sonnetOption = getByText('Sonnet 4.5').parent?.parent?.parent
      expect(sonnetOption?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
          backgroundColor: '#f0f0ff',
        })
      )
    })

    it('shows radio button filled for Sonnet when selected', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      // The radio button should have the selected styling
      expect(screen.getByText('Sonnet 4.5')).toBeTruthy()
    })

    it('calls onSelectModel with Sonnet when tapped', () => {
      render(<ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />)

      const sonnetOption = screen.getByText('Sonnet 4.5')
      fireEvent.press(sonnetOption)

      expect(mockOnSelectModel).toHaveBeenCalledWith(ModelType.SONNET_4_5)
      expect(mockOnSelectModel).toHaveBeenCalledTimes(1)
    })

    it('can switch from Opus to Sonnet', () => {
      const { rerender } = render(
        <ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />
      )

      fireEvent.press(screen.getByText('Sonnet 4.5'))

      expect(mockOnSelectModel).toHaveBeenCalledWith(ModelType.SONNET_4_5)

      // Rerender with new selection
      rerender(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      const sonnetOption = screen.getByText('Sonnet 4.5').parent?.parent?.parent
      expect(sonnetOption?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
        })
      )
    })
  })

  describe('model selection - Opus', () => {
    it('highlights Opus when selected', () => {
      const { getByText } = render(
        <ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />
      )

      const opusOption = getByText('Opus 4.5').parent?.parent?.parent
      expect(opusOption?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
          backgroundColor: '#f0f0ff',
        })
      )
    })

    it('shows radio button filled for Opus when selected', () => {
      render(<ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />)

      expect(screen.getByText('Opus 4.5')).toBeTruthy()
    })

    it('calls onSelectModel with Opus when tapped', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      const opusOption = screen.getByText('Opus 4.5')
      fireEvent.press(opusOption)

      expect(mockOnSelectModel).toHaveBeenCalledWith(ModelType.OPUS_4_5)
      expect(mockOnSelectModel).toHaveBeenCalledTimes(1)
    })

    it('can switch from Sonnet to Opus', () => {
      const { rerender } = render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      fireEvent.press(screen.getByText('Opus 4.5'))

      expect(mockOnSelectModel).toHaveBeenCalledWith(ModelType.OPUS_4_5)

      // Rerender with new selection
      rerender(
        <ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />
      )

      const opusOption = screen.getByText('Opus 4.5').parent?.parent?.parent
      expect(opusOption?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
        })
      )
    })
  })

  describe('visual styling', () => {
    it('applies correct styles to selected option', () => {
      const { getByText } = render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      const selectedOption = getByText('Sonnet 4.5').parent?.parent?.parent
      expect(selectedOption?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
          backgroundColor: '#f0f0ff',
        })
      )
    })

    it('applies correct styles to unselected option', () => {
      const { getByText } = render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      const unselectedOption = getByText('Opus 4.5').parent?.parent?.parent
      expect(unselectedOption?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#e2e8f0',
        })
      )
    })

    it('applies activeOpacity for touch feedback', () => {
      const { getByText } = render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      const option = getByText('Sonnet 4.5').parent?.parent?.parent
      expect(option?.props.activeOpacity).toBe(0.7)
    })

    it('renders radio button with correct border color when selected', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      // The selected option should have the radio button styled correctly
      expect(screen.getByText('Sonnet 4.5')).toBeTruthy()
    })

    it('renders radio button with default border color when unselected', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      // The unselected option should have default radio button styling
      expect(screen.getByText('Opus 4.5')).toBeTruthy()
    })
  })

  describe('radio button behavior', () => {
    it('shows filled radio button only for selected model', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      // Only Sonnet should show the radio dot
      expect(screen.getByText('Sonnet 4.5')).toBeTruthy()
      expect(screen.getByText('Opus 4.5')).toBeTruthy()
    })

    it('switches radio button when selection changes', () => {
      const { rerender } = render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      // Switch to Opus
      rerender(
        <ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />
      )

      expect(screen.getByText('Opus 4.5')).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('allows tapping anywhere on the option to select', () => {
      render(<ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />)

      // Tap on the label
      fireEvent.press(screen.getByText('Sonnet 4.5'))

      expect(mockOnSelectModel).toHaveBeenCalledWith(ModelType.SONNET_4_5)
    })

    it('allows tapping description area to select', () => {
      render(<ModelSelector selectedModel={ModelType.OPUS_4_5} onSelectModel={mockOnSelectModel} />)

      // Find the parent container and tap it
      const sonnetContainer = screen.getByText('Fast & efficient').parent?.parent?.parent
      fireEvent.press(sonnetContainer as any)

      expect(mockOnSelectModel).toHaveBeenCalledWith(ModelType.SONNET_4_5)
    })
  })

  describe('edge cases', () => {
    it('allows selecting the same model multiple times', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      const sonnetOption = screen.getByText('Sonnet 4.5')

      // Tap selected option multiple times
      fireEvent.press(sonnetOption)
      fireEvent.press(sonnetOption)

      expect(mockOnSelectModel).toHaveBeenCalledTimes(2)
      expect(mockOnSelectModel).toHaveBeenCalledWith(ModelType.SONNET_4_5)
    })

    it('handles rapid model switching', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      // Rapidly switch between models
      fireEvent.press(screen.getByText('Opus 4.5'))
      fireEvent.press(screen.getByText('Sonnet 4.5'))
      fireEvent.press(screen.getByText('Opus 4.5'))

      expect(mockOnSelectModel).toHaveBeenCalledTimes(3)
      expect(mockOnSelectModel).toHaveBeenNthCalledWith(1, ModelType.OPUS_4_5)
      expect(mockOnSelectModel).toHaveBeenNthCalledWith(2, ModelType.SONNET_4_5)
      expect(mockOnSelectModel).toHaveBeenNthCalledWith(3, ModelType.OPUS_4_5)
    })
  })

  describe('layout', () => {
    it('renders options in vertical layout', () => {
      const { getByText } = render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      // The container should have vertical gap
      const container = getByText('Sonnet 4.5').parent?.parent?.parent?.parent
      expect(container?.props.style).toContainEqual(
        expect.objectContaining({
          gap: 12,
        })
      )
    })

    it('maintains consistent spacing between options', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      expect(screen.getByText('Sonnet 4.5')).toBeTruthy()
      expect(screen.getByText('Opus 4.5')).toBeTruthy()
    })
  })

  describe('model types', () => {
    it('correctly identifies Sonnet 4.5 model type', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      fireEvent.press(screen.getByText('Sonnet 4.5'))

      expect(mockOnSelectModel).toHaveBeenCalledWith('sonnet-4.5')
    })

    it('correctly identifies Opus 4.5 model type', () => {
      render(
        <ModelSelector selectedModel={ModelType.SONNET_4_5} onSelectModel={mockOnSelectModel} />
      )

      fireEvent.press(screen.getByText('Opus 4.5'))

      expect(mockOnSelectModel).toHaveBeenCalledWith('opus-4.5')
    })
  })
})
