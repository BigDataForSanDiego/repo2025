import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile hook', () => {
  const MOBILE_BREAKPOINT = 768

  // Store original window properties
  let originalInnerWidth: number

  beforeEach(() => {
    originalInnerWidth = window.innerWidth
  })

  afterEach(() => {
    // Restore original window width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  describe('initialization', () => {
    it('should return false for desktop width', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(false)
      })
    })

    it('should return true for mobile width', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })

    it('should return true for tablet width below breakpoint', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 767, // Just below 768
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })

    it('should return false for width at breakpoint', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(false)
      })
    })

    it('should return false for width just above breakpoint', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 769,
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(false)
      })
    })
  })

  describe('breakpoint boundaries', () => {
    it('should handle minimum mobile width', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320, // Common minimum mobile width
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })

    it('should handle very large desktop width', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 3840, // 4K width
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(false)
      })
    })

    it('should handle edge case width of 0', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 0,
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })

    it('should handle edge case width of 1', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1,
      })

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })
  })

  describe('media query listener', () => {
    it('should update when window is resized to mobile', async () => {
      // Start with desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const matchMediaMock = vi.fn().mockImplementation(query => {
        const listeners: Array<() => void> = []
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: (_: string, listener: () => void) => {
            listeners.push(listener)
          },
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
          triggerChange: () => {
            listeners.forEach(listener => listener())
          },
        }
      })

      window.matchMedia = matchMediaMock as any

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(false)
      })

      // Simulate resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const mql = matchMediaMock.mock.results[0].value
      mql.triggerChange()

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })

    it('should update when window is resized to desktop', async () => {
      // Start with mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const matchMediaMock = vi.fn().mockImplementation(query => {
        const listeners: Array<() => void> = []
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: (_: string, listener: () => void) => {
            listeners.push(listener)
          },
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
          triggerChange: () => {
            listeners.forEach(listener => listener())
          },
        }
      })

      window.matchMedia = matchMediaMock as any

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(true)
      })

      // Simulate resize to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const mql = matchMediaMock.mock.results[0].value
      mql.triggerChange()

      await waitFor(() => {
        expect(result.current).toBe(false)
      })
    })

    it('should handle multiple resize events', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      const matchMediaMock = vi.fn().mockImplementation(query => {
        const listeners: Array<() => void> = []
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: (_: string, listener: () => void) => {
            listeners.push(listener)
          },
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
          triggerChange: () => {
            listeners.forEach(listener => listener())
          },
        }
      })

      window.matchMedia = matchMediaMock as any

      const { result } = renderHook(() => useIsMobile())

      await waitFor(() => {
        expect(result.current).toBe(false)
      })

      const mql = matchMediaMock.mock.results[0].value

      // Resize to mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })
      mql.triggerChange()

      await waitFor(() => {
        expect(result.current).toBe(true)
      })

      // Resize back to desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
      mql.triggerChange()

      await waitFor(() => {
        expect(result.current).toBe(false)
      })

      // Resize to tablet (mobile range)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      })
      mql.triggerChange()

      await waitFor(() => {
        expect(result.current).toBe(true)
      })
    })
  })

  describe('cleanup', () => {
    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.fn()

      const matchMediaMock = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      }))

      window.matchMedia = matchMediaMock as any

      const { unmount } = renderHook(() => useIsMobile())

      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalled()
    })

    it('should not cause memory leaks on multiple mount/unmount', () => {
      const removeEventListenerSpy = vi.fn()

      const matchMediaMock = vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: removeEventListenerSpy,
        dispatchEvent: vi.fn(),
      }))

      window.matchMedia = matchMediaMock as any

      const { unmount: unmount1 } = renderHook(() => useIsMobile())
      const { unmount: unmount2 } = renderHook(() => useIsMobile())
      const { unmount: unmount3 } = renderHook(() => useIsMobile())

      unmount1()
      unmount2()
      unmount3()

      expect(removeEventListenerSpy).toHaveBeenCalledTimes(3)
    })
  })

  describe('correct media query string', () => {
    it('should use correct media query format', () => {
      const matchMediaSpy = vi.spyOn(window, 'matchMedia')

      renderHook(() => useIsMobile())

      expect(matchMediaSpy).toHaveBeenCalledWith('(max-width: 767px)')
    })
  })

  describe('server-side rendering safety', () => {
    it('should handle initial undefined state gracefully', () => {
      const { result } = renderHook(() => useIsMobile())

      // Initially, the hook returns false due to !!undefined -> false
      // This is safe for SSR as it provides a consistent initial value
      expect(typeof result.current).toBe('boolean')
    })
  })

  describe('common device widths', () => {
    const testCases = [
      { width: 320, device: 'iPhone SE', expected: true },
      { width: 375, device: 'iPhone 12/13', expected: true },
      { width: 390, device: 'iPhone 14', expected: true },
      { width: 414, device: 'iPhone 12 Pro Max', expected: true },
      { width: 768, device: 'iPad Portrait', expected: false },
      { width: 820, device: 'iPad Air', expected: false },
      { width: 1024, device: 'iPad Landscape', expected: false },
      { width: 1280, device: 'Desktop', expected: false },
      { width: 1920, device: 'Full HD', expected: false },
    ]

    testCases.forEach(({ width, device, expected }) => {
      it(`should return ${expected} for ${device} (${width}px)`, async () => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        })

        const { result } = renderHook(() => useIsMobile())

        await waitFor(() => {
          expect(result.current).toBe(expected)
        })
      })
    })
  })

  describe('type safety', () => {
    it('should always return a boolean', async () => {
      const { result } = renderHook(() => useIsMobile())

      expect(typeof result.current).toBe('boolean')

      await waitFor(() => {
        expect(typeof result.current).toBe('boolean')
      })
    })

    it('should never return undefined to consumers', async () => {
      const { result } = renderHook(() => useIsMobile())

      expect(result.current).not.toBe(undefined)

      await waitFor(() => {
        expect(result.current).not.toBe(undefined)
      })
    })
  })
})
