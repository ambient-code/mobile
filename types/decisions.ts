// Types for Decisions and Review Flow

import { AgentName } from './inbox'

/**
 * Represents a decision awaiting user review in the decision queue
 */
export interface PendingDecision {
  /** Unique identifier for the decision */
  id: string

  /** Agent name requesting the decision */
  agentName: AgentName

  /** Brief title of the decision (question format) */
  title: string

  /** Context description providing background for the decision */
  context: string

  /** Estimated time in minutes to review this decision */
  estimatedMinutes: number

  /** Full decision details (used in review flow) */
  details?: DecisionDetails
}

/**
 * Extended information for a decision, used in the review flow
 */
export interface DecisionDetails {
  /** The core question being asked */
  question: string

  /** Background context and relevant information */
  context: string

  /** Agent's analysis of the situation */
  analysis: string

  /** Agent's recommended course of action */
  recommendation: string

  /** Expandable sections with detailed information */
  sections: AccordionSection[]
}

/**
 * Represents an expandable content section in the review flow
 */
export interface AccordionSection {
  /** Unique identifier for the section */
  id: string

  /** Section title shown in accordion header */
  title: string

  /** Full content shown when section is expanded */
  content: string

  /** Whether this section has been viewed by the user */
  viewed: boolean
}

/**
 * Represents the state of an in-progress decision review
 */
export interface ReviewFlow {
  /** ID of the decision being reviewed */
  decisionId: string

  /** Current step in the review process (1-3) */
  currentStep: 1 | 2 | 3

  /** Set of section IDs that have been viewed */
  viewedSections: Set<string>

  /** User's comment/feedback for the decision */
  comment: string

  /** Selected quick response chip, if any */
  quickResponse?: 'looks-good' | 'needs-discussion' | 'try-different'
}
