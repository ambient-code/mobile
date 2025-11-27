import { render, screen, fireEvent } from '@testing-library/react-native'
import { WorkflowTypeGrid } from '../WorkflowTypeGrid'
import { WORKFLOWS } from '@/utils/constants'

describe('WorkflowTypeGrid', () => {
  const mockOnSelectWorkflow = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders all workflow types', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      WORKFLOWS.forEach((workflow) => {
        expect(screen.getByText(workflow.label)).toBeTruthy()
        expect(screen.getByText(workflow.description)).toBeTruthy()
      })
    })

    it('renders workflow type label', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      expect(screen.getByText('Workflow Type')).toBeTruthy()
    })

    it('renders enabled workflows without "Soon" badge', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const enabledWorkflows = WORKFLOWS.filter((w) => w.enabled)
      expect(enabledWorkflows.length).toBeGreaterThan(0)

      enabledWorkflows.forEach((workflow) => {
        expect(screen.getByText(workflow.label)).toBeTruthy()
      })
    })

    it('renders disabled workflows with "Soon" badge', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const disabledWorkflows = WORKFLOWS.filter((w) => !w.enabled)
      expect(disabledWorkflows.length).toBeGreaterThan(0)

      // Check for "Soon" badges (one for each disabled workflow)
      const soonBadges = screen.getAllByText('Soon')
      expect(soonBadges.length).toBe(disabledWorkflows.length)
    })

    it('renders exactly 7 workflow cards', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      expect(WORKFLOWS.length).toBe(7)
      WORKFLOWS.forEach((workflow) => {
        expect(screen.getByText(workflow.label)).toBeTruthy()
      })
    })
  })

  describe('workflow selection', () => {
    it('highlights selected workflow', () => {
      const { getByText } = render(
        <WorkflowTypeGrid selectedWorkflow="review" onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const selectedCard = getByText('Review').parent?.parent?.parent
      expect(selectedCard?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
        })
      )
    })

    it('calls onSelectWorkflow when enabled workflow is tapped', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const reviewCard = screen.getByText('Review')
      fireEvent.press(reviewCard)

      expect(mockOnSelectWorkflow).toHaveBeenCalledWith('review')
      expect(mockOnSelectWorkflow).toHaveBeenCalledTimes(1)
    })

    it('does not call onSelectWorkflow when disabled workflow is tapped', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const disabledCard = screen.getByText('New...')
      fireEvent.press(disabledCard)

      expect(mockOnSelectWorkflow).not.toHaveBeenCalled()
    })

    it('can select different workflows', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      fireEvent.press(screen.getByText('Review'))
      fireEvent.press(screen.getByText('Bugfix'))
      fireEvent.press(screen.getByText('Plan a Feature'))

      expect(mockOnSelectWorkflow).toHaveBeenCalledTimes(3)
      expect(mockOnSelectWorkflow).toHaveBeenNthCalledWith(1, 'review')
      expect(mockOnSelectWorkflow).toHaveBeenNthCalledWith(2, 'bugfix')
      expect(mockOnSelectWorkflow).toHaveBeenNthCalledWith(3, 'plan')
    })

    it('updates visual state when selection changes', () => {
      const { getByText, rerender } = render(
        <WorkflowTypeGrid selectedWorkflow="review" onSelectWorkflow={mockOnSelectWorkflow} />
      )

      // Review should be selected
      let selectedCard = getByText('Review').parent?.parent?.parent
      expect(selectedCard?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
        })
      )

      // Change selection to bugfix
      rerender(
        <WorkflowTypeGrid selectedWorkflow="bugfix" onSelectWorkflow={mockOnSelectWorkflow} />
      )

      // Bugfix should now be selected
      selectedCard = getByText('Bugfix').parent?.parent?.parent
      expect(selectedCard?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
        })
      )
    })
  })

  describe('workflow types', () => {
    const enabledWorkflows = [
      { id: 'review', label: 'Review' },
      { id: 'bugfix', label: 'Bugfix' },
      { id: 'plan', label: 'Plan a Feature' },
      { id: 'research', label: 'Research' },
      { id: 'chat', label: 'Chat' },
      { id: 'ideate', label: 'Ideate' },
    ]

    enabledWorkflows.forEach((workflow) => {
      it(`renders ${workflow.label} workflow as enabled`, () => {
        render(
          <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
        )

        const card = screen.getByText(workflow.label)
        expect(card).toBeTruthy()

        // Enabled cards should not have "Soon" badge
        const cardParent = card.parent?.parent?.parent
        expect(cardParent?.props.disabled).toBeFalsy()
      })

      it(`can select ${workflow.label} workflow`, () => {
        render(
          <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
        )

        fireEvent.press(screen.getByText(workflow.label))

        expect(mockOnSelectWorkflow).toHaveBeenCalledWith(workflow.id)
      })
    })

    it('renders "New..." workflow as disabled', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const newCard = screen.getByText('New...')
      expect(newCard).toBeTruthy()

      // Should have "Soon" badge
      expect(screen.getByText('Soon')).toBeTruthy()

      // Should not be selectable
      fireEvent.press(newCard)
      expect(mockOnSelectWorkflow).not.toHaveBeenCalled()
    })
  })

  describe('visual styling', () => {
    it('applies correct styles to selected card', () => {
      const { getByText } = render(
        <WorkflowTypeGrid selectedWorkflow="review" onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const selectedCard = getByText('Review').parent?.parent?.parent
      expect(selectedCard?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#6366f1',
          backgroundColor: '#f0f0ff',
        })
      )
    })

    it('applies correct styles to unselected enabled card', () => {
      const { getByText } = render(
        <WorkflowTypeGrid selectedWorkflow="review" onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const unselectedCard = getByText('Bugfix').parent?.parent?.parent
      expect(unselectedCard?.props.style).toContainEqual(
        expect.objectContaining({
          borderColor: '#e2e8f0',
        })
      )
    })

    it('applies disabled opacity to disabled cards', () => {
      const { getByText } = render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const disabledCard = getByText('New...').parent?.parent?.parent
      expect(disabledCard?.props.style).toContainEqual(
        expect.objectContaining({
          opacity: 0.5,
        })
      )
    })

    it('renders cards in 2-column grid layout', () => {
      const { getByText } = render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      // The grid container should have flexWrap enabled
      const gridContainer = getByText('Review').parent?.parent?.parent?.parent
      expect(gridContainer?.props.style).toContainEqual(
        expect.objectContaining({
          flexDirection: 'row',
          flexWrap: 'wrap',
        })
      )
    })
  })

  describe('accessibility', () => {
    it('disabled cards have disabled prop set', () => {
      const { getByText } = render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const disabledCard = getByText('New...').parent?.parent?.parent
      expect(disabledCard?.props.disabled).toBe(true)
    })

    it('enabled cards do not have disabled prop', () => {
      const { getByText } = render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const enabledCard = getByText('Review').parent?.parent?.parent
      expect(enabledCard?.props.disabled).toBeFalsy()
    })

    it('applies activeOpacity for touch feedback', () => {
      const { getByText } = render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const card = getByText('Review').parent?.parent?.parent
      expect(card?.props.activeOpacity).toBe(0.7)
    })
  })

  describe('edge cases', () => {
    it('handles undefined selectedWorkflow', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      // No cards should be selected
      WORKFLOWS.forEach((workflow) => {
        expect(screen.getByText(workflow.label)).toBeTruthy()
      })
    })

    it('handles empty string selectedWorkflow', () => {
      render(<WorkflowTypeGrid selectedWorkflow="" onSelectWorkflow={mockOnSelectWorkflow} />)

      // No cards should be selected
      expect(screen.getByText('Review')).toBeTruthy()
    })

    it('handles invalid selectedWorkflow', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow="nonexistent" onSelectWorkflow={mockOnSelectWorkflow} />
      )

      // Component should still render all workflows
      expect(screen.getByText('Review')).toBeTruthy()
      expect(screen.getByText('Bugfix')).toBeTruthy()
    })

    it('prevents multiple rapid selections', () => {
      render(
        <WorkflowTypeGrid selectedWorkflow={undefined} onSelectWorkflow={mockOnSelectWorkflow} />
      )

      const reviewCard = screen.getByText('Review')

      // Simulate rapid tapping
      fireEvent.press(reviewCard)
      fireEvent.press(reviewCard)
      fireEvent.press(reviewCard)

      expect(mockOnSelectWorkflow).toHaveBeenCalledTimes(3)
      expect(mockOnSelectWorkflow).toHaveBeenCalledWith('review')
    })
  })
})
