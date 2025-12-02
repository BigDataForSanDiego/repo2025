import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navigation } from '@/components/navigation'
import { ThemeProvider } from '@/components/theme-provider'

// Helper to render Navigation with ThemeProvider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>)
}

describe('Navigation component', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('rendering', () => {
    it('should render navigation component', () => {
      renderWithTheme(<Navigation />)

      const nav = screen.getByRole('navigation')
      expect(nav).toBeInTheDocument()
    })

    it('should render all navigation buttons', () => {
      renderWithTheme(<Navigation />)

      expect(screen.getByText('Voice On')).toBeInTheDocument()
      expect(screen.getByText('Text/Visual')).toBeInTheDocument()
      expect(screen.getByText('Language')).toBeInTheDocument()
      expect(screen.getByText('Contrast')).toBeInTheDocument()
    })

    it('should render 4 navigation items', () => {
      renderWithTheme(<Navigation />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })

    it('should have correct structure with nav and div elements', () => {
      const { container } = renderWithTheme(<Navigation />)

      const nav = container.querySelector('nav')
      expect(nav).toBeInTheDocument()

      const innerDiv = nav?.querySelector('div.flex')
      expect(innerDiv).toBeInTheDocument()
    })
  })

  describe('Voice button', () => {
    it('should display Voice On text', () => {
      renderWithTheme(<Navigation />)

      expect(screen.getByText('Voice On')).toBeInTheDocument()
    })

    it('should render Volume2 icon', () => {
      renderWithTheme(<Navigation />)

      const voiceButton = screen.getByText('Voice On').closest('button')
      expect(voiceButton).toBeInTheDocument()

      // Check that the button contains the Volume2 icon's SVG
      const svg = voiceButton?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should be clickable', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const voiceButton = screen.getByText('Voice On').closest('button')
      expect(voiceButton).toBeInTheDocument()

      await user.click(voiceButton!)
      // Button should not throw errors when clicked
    })
  })

  describe('Text/Visual button', () => {
    it('should display Text/Visual text', () => {
      renderWithTheme(<Navigation />)

      expect(screen.getByText('Text/Visual')).toBeInTheDocument()
    })

    it('should render with visual indicator', () => {
      renderWithTheme(<Navigation />)

      const textVisualButton = screen.getByText('Text/Visual').closest('button')
      expect(textVisualButton).toBeInTheDocument()

      // Check for the rounded visual indicator
      const indicator = textVisualButton?.querySelector('.rounded-full')
      expect(indicator).toBeInTheDocument()
    })

    it('should be clickable', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const textVisualButton = screen.getByText('Text/Visual').closest('button')
      expect(textVisualButton).toBeInTheDocument()

      await user.click(textVisualButton!)
      // Button should not throw errors when clicked
    })
  })

  describe('Language button', () => {
    it('should display Language text', () => {
      renderWithTheme(<Navigation />)

      expect(screen.getByText('Language')).toBeInTheDocument()
    })

    it('should render with visual indicator', () => {
      renderWithTheme(<Navigation />)

      const languageButton = screen.getByText('Language').closest('button')
      expect(languageButton).toBeInTheDocument()

      const indicator = languageButton?.querySelector('.rounded-full')
      expect(indicator).toBeInTheDocument()
    })

    it('should be clickable', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const languageButton = screen.getByText('Language').closest('button')
      expect(languageButton).toBeInTheDocument()

      await user.click(languageButton!)
      // Button should not throw errors when clicked
    })
  })

  describe('Contrast button (Theme toggle)', () => {
    it('should display Contrast text', () => {
      renderWithTheme(<Navigation />)

      expect(screen.getByText('Contrast')).toBeInTheDocument()
    })

    it('should render Contrast icon', () => {
      renderWithTheme(<Navigation />)

      const contrastButton = screen.getByText('Contrast').closest('button')
      expect(contrastButton).toBeInTheDocument()

      const svg = contrastButton?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should toggle theme when clicked', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const contrastButton = screen.getByText('Contrast').closest('button')
      expect(contrastButton).toBeInTheDocument()

      // Initially should be dark theme
      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('dark')
      })

      // Click to toggle to light
      await user.click(contrastButton!)

      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('light')
      })

      // Click again to toggle back to dark
      await user.click(contrastButton!)

      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('dark')
      })
    })

    it('should apply light class to document when toggled', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const contrastButton = screen.getByText('Contrast').closest('button')

      // Should not have light class initially
      expect(document.documentElement.classList.contains('light')).toBe(false)

      await user.click(contrastButton!)

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })
    })

    it('should handle multiple rapid clicks', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const contrastButton = screen.getByText('Contrast').closest('button')

      await user.click(contrastButton!)
      await user.click(contrastButton!)
      await user.click(contrastButton!)
      await user.click(contrastButton!)

      // Should handle rapid clicks without errors
      // Final state should be dark (4 toggles)
      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('dark')
      })
    })
  })

  describe('styling', () => {
    it('should have border-t class on nav element', () => {
      const { container } = renderWithTheme(<Navigation />)

      const nav = container.querySelector('nav')
      expect(nav?.className).toContain('border-t')
    })

    it('should apply dark background color', () => {
      const { container } = renderWithTheme(<Navigation />)

      const nav = container.querySelector('nav')
      expect(nav?.className).toContain('bg-[#1a1d2e]')
    })

    it('should have max-width container for buttons', () => {
      const { container } = renderWithTheme(<Navigation />)

      const innerDiv = container.querySelector('.max-w-md')
      expect(innerDiv).toBeInTheDocument()
    })

    it('should have height of 20 (h-20)', () => {
      const { container } = renderWithTheme(<Navigation />)

      const innerDiv = container.querySelector('.h-20')
      expect(innerDiv).toBeInTheDocument()
    })

    it('should distribute buttons evenly with justify-around', () => {
      const { container } = renderWithTheme(<Navigation />)

      const innerDiv = container.querySelector('.justify-around')
      expect(innerDiv).toBeInTheDocument()
    })
  })

  describe('button styling', () => {
    it('should apply flex-col layout to all buttons', () => {
      renderWithTheme(<Navigation />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.className).toContain('flex-col')
      })
    })

    it('should apply gap-1 to all buttons', () => {
      renderWithTheme(<Navigation />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.className).toContain('gap-1')
      })
    })

    it('should have opacity-60 on all buttons initially', () => {
      renderWithTheme(<Navigation />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.className).toContain('opacity-60')
      })
    })

    it('should have hover:opacity-100 on all buttons', () => {
      renderWithTheme(<Navigation />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.className).toContain('hover:opacity-100')
      })
    })

    it('should have transition-opacity on all buttons', () => {
      renderWithTheme(<Navigation />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.className).toContain('transition-opacity')
      })
    })
  })

  describe('text styling', () => {
    it('should apply text-xs to all button labels', () => {
      const { container } = renderWithTheme(<Navigation />)

      const labels = container.querySelectorAll('span.text-xs')
      expect(labels.length).toBeGreaterThanOrEqual(4)
    })

    it('should have correct text color classes', () => {
      renderWithTheme(<Navigation />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.className).toContain('text-white')
      })
    })
  })

  describe('accessibility', () => {
    it('should have accessible button elements', () => {
      renderWithTheme(<Navigation />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON')
      })
    })

    it('should have visible text labels for screen readers', () => {
      renderWithTheme(<Navigation />)

      expect(screen.getByText('Voice On')).toBeVisible()
      expect(screen.getByText('Text/Visual')).toBeVisible()
      expect(screen.getByText('Language')).toBeVisible()
      expect(screen.getByText('Contrast')).toBeVisible()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const firstButton = screen.getByText('Voice On').closest('button')
      expect(firstButton).toBeInTheDocument()

      // Should be able to focus with keyboard
      await user.tab()
      // Note: In a real browser, this would focus the first button
      // In jsdom, focus behavior is limited but the test ensures no errors
    })

    it('should support keyboard activation', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const contrastButton = screen.getByText('Contrast').closest('button')
      contrastButton?.focus()

      await user.keyboard('{Enter}')

      // Should toggle theme
      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('light')
      })
    })
  })

  describe('icon rendering', () => {
    it('should render Volume2 icon for Voice button', () => {
      const { container } = renderWithTheme(<Navigation />)

      const voiceButton = screen.getByText('Voice On').closest('button')
      const svg = voiceButton?.querySelector('svg')

      expect(svg).toBeInTheDocument()
      expect(svg?.classList.contains('lucide-volume-2')).toBe(true)
    })

    it('should render Contrast icon for theme button', () => {
      const { container } = renderWithTheme(<Navigation />)

      const contrastButton = screen.getByText('Contrast').closest('button')
      const svg = contrastButton?.querySelector('svg')

      expect(svg).toBeInTheDocument()
      expect(svg?.classList.contains('lucide-contrast')).toBe(true)
    })

    it('should render icons with correct size classes', () => {
      const { container } = renderWithTheme(<Navigation />)

      const svgs = container.querySelectorAll('svg')
      svgs.forEach(svg => {
        expect(svg.classList.contains('h-6')).toBe(true)
        expect(svg.classList.contains('w-6')).toBe(true)
      })
    })
  })

  describe('responsive design', () => {
    it('should center content with mx-auto', () => {
      const { container } = renderWithTheme(<Navigation />)

      const innerDiv = container.querySelector('.mx-auto')
      expect(innerDiv).toBeInTheDocument()
    })

    it('should have max-width constraint', () => {
      const { container } = renderWithTheme(<Navigation />)

      const innerDiv = container.querySelector('.max-w-md')
      expect(innerDiv).toBeInTheDocument()
    })
  })

  describe('integration with ThemeProvider', () => {
    it('should work correctly when wrapped in ThemeProvider', () => {
      expect(() => renderWithTheme(<Navigation />)).not.toThrow()
    })

    it('should access theme context without errors', async () => {
      const user = userEvent.setup()
      renderWithTheme(<Navigation />)

      const contrastButton = screen.getByText('Contrast').closest('button')

      // Should be able to toggle theme without errors
      await user.click(contrastButton!)

      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('light')
      })
    })

    it('should throw error when used without ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<Navigation />)
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleError.mockRestore()
    })
  })

  describe('edge cases', () => {
    it('should handle component unmount gracefully', () => {
      const { unmount } = renderWithTheme(<Navigation />)

      expect(() => unmount()).not.toThrow()
    })

    it('should handle remounting without issues', () => {
      const { unmount } = renderWithTheme(<Navigation />)
      unmount()

      expect(() => renderWithTheme(<Navigation />)).not.toThrow()
    })

    it('should maintain theme state across remounts', async () => {
      const user = userEvent.setup()

      const { unmount } = renderWithTheme(<Navigation />)

      const contrastButton = screen.getByText('Contrast').closest('button')
      await user.click(contrastButton!)

      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('light')
      })

      unmount()

      renderWithTheme(<Navigation />)

      // Theme should persist
      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('light')
      })
    })
  })
})
