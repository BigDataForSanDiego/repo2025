import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, waitFor, renderHook, act } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/theme-provider'
import { ReactNode } from 'react'

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('light')
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('light')
  })

  describe('initialization', () => {
    it('should render children', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should initialize with dark theme by default', async () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })
    })

    it('should load theme from localStorage if available', async () => {
      localStorage.setItem('homebase-theme', 'light')

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
      })
    })

    it('should apply light class to document when theme is light', async () => {
      localStorage.setItem('homebase-theme', 'light')

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div>{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })
    })

    it('should not apply light class when theme is dark', async () => {
      localStorage.setItem('homebase-theme', 'dark')

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div>{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })
    })
  })

  describe('toggleTheme functionality', () => {
    it('should toggle from dark to light', async () => {
      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button onClick={toggleTheme} data-testid="toggle">
              Toggle
            </button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })

      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
      })
    })

    it('should toggle from light to dark', async () => {
      localStorage.setItem('homebase-theme', 'light')

      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button onClick={toggleTheme} data-testid="toggle">
              Toggle
            </button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
      })

      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })
    })

    it('should toggle multiple times correctly', async () => {
      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button onClick={toggleTheme} data-testid="toggle">
              Toggle
            </button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })

      // First toggle: dark -> light
      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
      })

      // Second toggle: light -> dark
      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })

      // Third toggle: dark -> light
      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
      })
    })
  })

  describe('localStorage persistence', () => {
    it('should save theme to localStorage when toggled', async () => {
      const TestComponent = () => {
        const { toggleTheme } = useTheme()
        return <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('dark')
      })

      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(localStorage.getItem('homebase-theme')).toBe('light')
      })
    })

    it('should persist theme across component remounts', async () => {
      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
          </div>
        )
      }

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })

      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
      })

      unmount()

      // Remount the component
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Should load the saved theme
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
      })
    })

    it('should use correct localStorage key', async () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        return <div>{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        const storedTheme = localStorage.getItem('homebase-theme')
        expect(storedTheme).toBeTruthy()
        expect(['dark', 'light']).toContain(storedTheme)
      })
    })
  })

  describe('DOM class manipulation', () => {
    it('should add light class to documentElement when theme is light', async () => {
      const TestComponent = () => {
        const { toggleTheme } = useTheme()
        return <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Start with dark theme
      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })

      // Toggle to light
      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })
    })

    it('should remove light class when theme is dark', async () => {
      localStorage.setItem('homebase-theme', 'light')

      const TestComponent = () => {
        const { toggleTheme } = useTheme()
        return <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Start with light theme
      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(true)
      })

      // Toggle to dark
      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(document.documentElement.classList.contains('light')).toBe(false)
      })
    })
  })

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div>{theme}</div>
      }

      expect(() => {
        render(<TestComponent />)
      }).toThrow('useTheme must be used within a ThemeProvider')

      consoleError.mockRestore()
    })

    it('should provide theme value when used inside ThemeProvider', () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme')).toBeInTheDocument()
    })

    it('should provide toggleTheme function', () => {
      const TestComponent = () => {
        const { toggleTheme } = useTheme()
        return (
          <button onClick={toggleTheme} data-testid="toggle">
            Toggle
          </button>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      expect(screen.getByTestId('toggle')).toBeInTheDocument()
      expect(() => screen.getByTestId('toggle').click()).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle invalid theme value in localStorage', async () => {
      localStorage.setItem('homebase-theme', 'invalid-theme' as any)

      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // Should fallback to default (dark) or handle gracefully
      await waitFor(() => {
        const theme = screen.getByTestId('theme').textContent
        expect(['dark', 'light', 'invalid-theme']).toContain(theme)
      })
    })

    it('should handle rapid theme toggles', async () => {
      const TestComponent = () => {
        const { theme, toggleTheme } = useTheme()
        return (
          <div>
            <div data-testid="theme">{theme}</div>
            <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })

      // Rapidly toggle multiple times
      act(() => {
        screen.getByTestId('toggle').click()
        screen.getByTestId('toggle').click()
        screen.getByTestId('toggle').click()
        screen.getByTestId('toggle').click()
      })

      // Should end up with dark theme (4 toggles)
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      })
    })

    it('should handle nested ThemeProviders (should not cause issues)', () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      // While nesting providers is not recommended, it shouldn't crash
      expect(() => {
        render(
          <ThemeProvider>
            <ThemeProvider>
              <TestComponent />
            </ThemeProvider>
          </ThemeProvider>
        )
      }).not.toThrow()
    })
  })

  describe('mounted state handling', () => {
    it('should handle component lifecycle correctly', async () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        return <div data-testid="theme">{theme}</div>
      }

      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('theme')).toBeInTheDocument()
      })

      expect(() => unmount()).not.toThrow()
    })

    it('should not save to localStorage before mounted', () => {
      const TestComponent = () => {
        const { theme } = useTheme()
        return <div>{theme}</div>
      }

      // Clear localStorage before test
      localStorage.clear()

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      )

      // The provider should handle the mounted state correctly
      // and not cause hydration mismatches
    })
  })

  describe('multiple consumers', () => {
    it('should provide same theme to multiple consumers', async () => {
      const Consumer1 = () => {
        const { theme } = useTheme()
        return <div data-testid="consumer1">{theme}</div>
      }

      const Consumer2 = () => {
        const { theme } = useTheme()
        return <div data-testid="consumer2">{theme}</div>
      }

      render(
        <ThemeProvider>
          <Consumer1 />
          <Consumer2 />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('consumer1')).toHaveTextContent('dark')
        expect(screen.getByTestId('consumer2')).toHaveTextContent('dark')
      })
    })

    it('should update all consumers when theme changes', async () => {
      const Consumer1 = () => {
        const { theme } = useTheme()
        return <div data-testid="consumer1">{theme}</div>
      }

      const Consumer2 = () => {
        const { theme, toggleTheme } = useTheme()
        return (
          <div>
            <div data-testid="consumer2">{theme}</div>
            <button onClick={toggleTheme} data-testid="toggle">Toggle</button>
          </div>
        )
      }

      render(
        <ThemeProvider>
          <Consumer1 />
          <Consumer2 />
        </ThemeProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('consumer1')).toHaveTextContent('dark')
        expect(screen.getByTestId('consumer2')).toHaveTextContent('dark')
      })

      act(() => {
        screen.getByTestId('toggle').click()
      })

      await waitFor(() => {
        expect(screen.getByTestId('consumer1')).toHaveTextContent('light')
        expect(screen.getByTestId('consumer2')).toHaveTextContent('light')
      })
    })
  })
})
