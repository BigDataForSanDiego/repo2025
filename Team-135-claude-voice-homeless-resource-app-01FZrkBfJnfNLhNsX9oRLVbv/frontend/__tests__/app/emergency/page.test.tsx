import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import EmergencyPage from '@/app/emergency/page'

describe('EmergencyPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('should render the page', () => {
      render(<EmergencyPage />)

      expect(screen.getByText('Emergency Help')).toBeInTheDocument()
    })

    it('should render header with back button', () => {
      render(<EmergencyPage />)

      const backButton = screen.getAllByRole('link')[0]
      expect(backButton).toHaveAttribute('href', '/')
    })

    it('should render Press for Help button', () => {
      render(<EmergencyPage />)

      expect(screen.getByText('Press for Help')).toBeInTheDocument()
    })

    it('should display user greeting', () => {
      render(<EmergencyPage />)

      expect(screen.getByText(/Hello, John/)).toBeInTheDocument()
    })

    it('should render instruction text', () => {
      render(<EmergencyPage />)

      expect(screen.getByText('Tap the button below and speak.')).toBeInTheDocument()
    })

    it('should render bottom navigation', () => {
      render(<EmergencyPage />)

      expect(screen.getByText('Call 911')).toBeInTheDocument()
      expect(screen.getByText('Text mode')).toBeInTheDocument()
      expect(screen.getByText('Language')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })

  describe('Press for Help button interaction', () => {
    it('should toggle listening state when clicked', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      await user.click(helpButton)

      // Button should have active styling
      expect(helpButton.className).toContain('scale-95')
      expect(helpButton.className).toContain('ring-4')
    })

    it('should create ripple animation on click', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      await user.click(helpButton)

      // Ripple elements should be created
      const button = helpButton.parentElement!
      const ripples = button.querySelectorAll('.animate-ripple')
      expect(ripples.length).toBeGreaterThan(0)
    })

    it('should remove ripple after animation completes', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      await user.click(helpButton)

      const button = helpButton.parentElement!
      const initialRipples = button.querySelectorAll('.animate-ripple')
      expect(initialRipples.length).toBeGreaterThan(0)

      // Fast-forward 600ms (ripple timeout)
      await act(async () => {
        vi.advanceTimersByTime(600)
      })

      // Ripples should be removed
      const finalRipples = button.querySelectorAll('.animate-ripple')
      expect(finalRipples.length).toBe(0)
    })

    it('should display transcript after 2 seconds', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      expect(screen.queryByText(/I need a warm place to sleep/)).not.toBeInTheDocument()

      await user.click(helpButton)

      // Fast-forward 2 seconds
      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.getByText(/I need a warm place to sleep/)).toBeInTheDocument()
      })
    })

    it('should show correct transcript text', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      await user.click(helpButton)

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(
          screen.getByText('User: I need a warm place to sleep tonight and something to eat.')
        ).toBeInTheDocument()
      })
    })

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      // First click
      await user.click(helpButton)
      expect(helpButton.className).toContain('scale-95')

      // Second click (toggle off)
      await user.click(helpButton)
      expect(helpButton.className).not.toContain('scale-95')

      // Third click (toggle on)
      await user.click(helpButton)
      expect(helpButton.className).toContain('scale-95')
    })

    it('should create multiple ripples on rapid clicks', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      const button = helpButton.parentElement!

      await user.click(helpButton)
      await user.click(helpButton)
      await user.click(helpButton)

      // Multiple ripples can exist simultaneously
      const ripples = button.querySelectorAll('.animate-ripple')
      expect(ripples.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('transcript display', () => {
    it('should not display transcript initially', () => {
      render(<EmergencyPage />)

      expect(screen.queryByText('Transcription')).not.toBeInTheDocument()
    })

    it('should display transcript card after voice recognition', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      await user.click(helpButton)

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.getByText('Transcription')).toBeInTheDocument()
      })
    })

    it('should display transcript ID', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      await user.click(helpButton)

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.getByText('#UFF590')).toBeInTheDocument()
      })
    })

    it('should style transcript card correctly', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      await user.click(helpButton)

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        const transcriptCard = screen.getByText('Transcription').closest('div')
        expect(transcriptCard?.className).toContain('bg-[#2a2d3e]')
        expect(transcriptCard?.className).toContain('rounded-2xl')
      })
    })
  })

  describe('navigation links', () => {
    it('should have working back button link', () => {
      render(<EmergencyPage />)

      const backLinks = screen.getAllByRole('link')
      const backButton = backLinks.find(link => link.getAttribute('href') === '/')

      expect(backButton).toBeInTheDocument()
    })

    it('should have Call 911 link to emergency page', () => {
      render(<EmergencyPage />)

      const call911Link = screen.getAllByRole('link').find(
        link => link.getAttribute('href') === '/emergency'
      )

      expect(call911Link).toBeInTheDocument()
    })

    it('should have Home link', () => {
      render(<EmergencyPage />)

      const homeLinks = screen.getAllByRole('link').filter(
        link => link.getAttribute('href') === '/'
      )

      expect(homeLinks.length).toBeGreaterThan(0)
    })

    it('should render all 4 bottom navigation buttons', () => {
      render(<EmergencyPage />)

      expect(screen.getByText('Call 911')).toBeInTheDocument()
      expect(screen.getByText('Text mode')).toBeInTheDocument()
      expect(screen.getByText('Language')).toBeInTheDocument()
      expect(screen.getByText('Home')).toBeInTheDocument()
    })
  })

  describe('styling and layout', () => {
    it('should have dark background', () => {
      const { container } = render(<EmergencyPage />)

      const mainDiv = container.querySelector('.bg-\\[\\#1a1d2e\\]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should be full height', () => {
      const { container } = render(<EmergencyPage />)

      const mainDiv = container.querySelector('.min-h-screen')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should have flex column layout', () => {
      const { container } = render(<EmergencyPage />)

      const mainDiv = container.querySelector('.flex-col')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should style help button with correct colors', () => {
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      expect(helpButton.className).toContain('bg-[#d4554f]')
      expect(helpButton.className).toContain('rounded-full')
    })

    it('should style help button with correct size', () => {
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      expect(helpButton.className).toContain('w-64')
      expect(helpButton.className).toContain('h-64')
    })

    it('should have shadow on help button', () => {
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      expect(helpButton.className).toContain('shadow-2xl')
    })
  })

  describe('icons', () => {
    it('should render Volume2 icon in header', () => {
      const { container } = render(<EmergencyPage />)

      const header = container.querySelector('header')
      const svg = header?.querySelector('svg.lucide-volume-2')
      expect(svg).toBeInTheDocument()
    })

    it('should render Phone icon for Call 911', () => {
      const { container } = render(<EmergencyPage />)

      const call911Button = screen.getByText('Call 911').closest('button')
      const svg = call911Button?.querySelector('svg.lucide-phone')
      expect(svg).toBeInTheDocument()
    })

    it('should render MessageSquare icon for Text mode', () => {
      const { container } = render(<EmergencyPage />)

      const textModeButton = screen.getByText('Text mode').closest('button')
      const svg = textModeButton?.querySelector('svg.lucide-message-square')
      expect(svg).toBeInTheDocument()
    })

    it('should render Globe icon for Language', () => {
      const { container } = render(<EmergencyPage />)

      const languageButton = screen.getByText('Language').closest('button')
      const svg = languageButton?.querySelector('svg.lucide-globe')
      expect(svg).toBeInTheDocument()
    })

    it('should render Home icon', () => {
      const { container } = render(<EmergencyPage />)

      const homeButtons = screen.getAllByText('Home')
      const homeButton = homeButtons[0].closest('button')
      const svg = homeButton?.querySelector('svg.lucide-home')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('user greeting', () => {
    it('should display user name in greeting', () => {
      render(<EmergencyPage />)

      expect(screen.getByText('Hello, John')).toBeInTheDocument()
    })

    it('should style greeting with border', () => {
      render(<EmergencyPage />)

      const greeting = screen.getByText('Hello, John').closest('div')
      expect(greeting?.className).toContain('border-2')
      expect(greeting?.className).toContain('rounded-2xl')
    })

    it('should display greeting prominently', () => {
      render(<EmergencyPage />)

      const greetingText = screen.getByText('Hello, John')
      expect(greetingText.className).toContain('text-2xl')
      expect(greetingText.className).toContain('font-medium')
    })
  })

  describe('accessibility', () => {
    it('should have accessible button', () => {
      render(<EmergencyPage />)

      const helpButton = screen.getByRole('button', { name: /Press for Help/i })
      expect(helpButton).toBeInTheDocument()
    })

    it('should have semantic HTML structure', () => {
      const { container } = render(<EmergencyPage />)

      expect(container.querySelector('header')).toBeInTheDocument()
      expect(container.querySelector('main')).toBeInTheDocument()
      expect(container.querySelector('nav')).toBeInTheDocument()
    })

    it('should have proper heading hierarchy', () => {
      render(<EmergencyPage />)

      const heading = screen.getByText('Emergency Help')
      expect(heading.tagName).toBe('H1')
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      // Should be focusable
      helpButton.focus()
      expect(document.activeElement).toBe(helpButton)

      // Should be activatable with keyboard
      await user.keyboard('{Enter}')

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      // Should show transcript
      await waitFor(() => {
        expect(screen.getByText(/I need a warm place to sleep/)).toBeInTheDocument()
      })
    })
  })

  describe('edge cases', () => {
    it('should handle component unmount gracefully', () => {
      const { unmount } = render(<EmergencyPage />)

      expect(() => unmount()).not.toThrow()
    })

    it('should clean up timers on unmount', async () => {
      const user = userEvent.setup({ delay: null })
      const { unmount } = render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      await user.click(helpButton)

      // Unmount before timers complete
      unmount()

      // Should not cause memory leaks
      await act(async () => {
        vi.advanceTimersByTime(3000)
      })
    })

    it('should handle rapid button presses without breaking', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      // Rapid clicks
      await user.click(helpButton)
      await user.click(helpButton)
      await user.click(helpButton)
      await user.click(helpButton)
      await user.click(helpButton)

      // Should not throw errors
      expect(helpButton).toBeInTheDocument()
    })

    it('should handle clicking while transcript is loading', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      // First click
      await user.click(helpButton)

      // Advance time partially
      await act(async () => {
        vi.advanceTimersByTime(1000)
      })

      // Click again before transcript appears
      await user.click(helpButton)

      // Should handle gracefully
      expect(helpButton).toBeInTheDocument()
    })
  })

  describe('state management', () => {
    it('should track isListening state correctly', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      // Initially not listening
      expect(helpButton.className).not.toContain('scale-95')

      // Start listening
      await user.click(helpButton)
      expect(helpButton.className).toContain('scale-95')

      // Stop listening
      await user.click(helpButton)
      expect(helpButton.className).not.toContain('scale-95')
    })

    it('should maintain transcript state', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')

      // Trigger transcript
      await user.click(helpButton)

      await act(async () => {
        vi.advanceTimersByTime(2000)
      })

      await waitFor(() => {
        expect(screen.getByText('Transcription')).toBeInTheDocument()
      })

      // Click again
      await user.click(helpButton)

      // Transcript should still be visible
      expect(screen.getByText('Transcription')).toBeInTheDocument()
    })

    it('should manage ripple state array', async () => {
      const user = userEvent.setup({ delay: null })
      render(<EmergencyPage />)

      const helpButton = screen.getByText('Press for Help')
      const button = helpButton.parentElement!

      // Create first ripple
      await user.click(helpButton)
      let ripples = button.querySelectorAll('.animate-ripple')
      const firstCount = ripples.length

      // Create second ripple
      await user.click(helpButton)
      ripples = button.querySelectorAll('.animate-ripple')
      expect(ripples.length).toBeGreaterThanOrEqual(firstCount)

      // Wait for cleanup
      await act(async () => {
        vi.advanceTimersByTime(700)
      })

      ripples = button.querySelectorAll('.animate-ripple')
      expect(ripples.length).toBe(0)
    })
  })

  describe('responsive design', () => {
    it('should have max-width container', () => {
      const { container } = render(<EmergencyPage />)

      const mainContent = container.querySelector('.max-w-md')
      expect(mainContent).toBeInTheDocument()
    })

    it('should center content', () => {
      const { container } = render(<EmergencyPage />)

      const button = screen.getByText('Press for Help')
      expect(button.className).toContain('mx-auto')
    })

    it('should use padding for mobile', () => {
      const { container } = render(<EmergencyPage />)

      const header = container.querySelector('header')
      expect(header?.className).toContain('p-4')
    })
  })
})
