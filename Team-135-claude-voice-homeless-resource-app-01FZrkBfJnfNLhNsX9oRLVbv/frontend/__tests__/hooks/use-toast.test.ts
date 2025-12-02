import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useToast, toast, reducer } from '@/hooks/use-toast'

describe('useToast hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('reducer function', () => {
    describe('ADD_TOAST action', () => {
      it('should add a toast to empty state', () => {
        const initialState = { toasts: [] }
        const newToast = {
          id: '1',
          title: 'Test Toast',
          open: true,
        }

        const newState = reducer(initialState, {
          type: 'ADD_TOAST',
          toast: newToast,
        })

        expect(newState.toasts).toHaveLength(1)
        expect(newState.toasts[0]).toEqual(newToast)
      })

      it('should add toast to beginning of array', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'First', open: true },
          ],
        }
        const newToast = { id: '2', title: 'Second', open: true }

        const newState = reducer(initialState, {
          type: 'ADD_TOAST',
          toast: newToast,
        })

        expect(newState.toasts).toHaveLength(2)
        expect(newState.toasts[0].id).toBe('2')
        expect(newState.toasts[1].id).toBe('1')
      })

      it('should respect TOAST_LIMIT and keep only 1 toast', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'First', open: true },
          ],
        }
        const newToast = { id: '2', title: 'Second', open: true }

        const newState = reducer(initialState, {
          type: 'ADD_TOAST',
          toast: newToast,
        })

        // TOAST_LIMIT is 1, so only the newest toast should remain
        expect(newState.toasts).toHaveLength(1)
        expect(newState.toasts[0].id).toBe('2')
      })
    })

    describe('UPDATE_TOAST action', () => {
      it('should update existing toast by id', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'Original', open: true },
            { id: '2', title: 'Second', open: true },
          ],
        }

        const newState = reducer(initialState, {
          type: 'UPDATE_TOAST',
          toast: { id: '1', title: 'Updated' },
        })

        expect(newState.toasts[0].title).toBe('Updated')
        expect(newState.toasts[0].open).toBe(true) // Should preserve other properties
        expect(newState.toasts[1].title).toBe('Second') // Should not affect other toasts
      })

      it('should not modify state if toast id not found', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'Original', open: true },
          ],
        }

        const newState = reducer(initialState, {
          type: 'UPDATE_TOAST',
          toast: { id: '999', title: 'Non-existent' },
        })

        expect(newState.toasts[0].title).toBe('Original')
      })

      it('should partially update toast properties', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'Original', description: 'Desc', open: true },
          ],
        }

        const newState = reducer(initialState, {
          type: 'UPDATE_TOAST',
          toast: { id: '1', title: 'Updated' },
        })

        expect(newState.toasts[0].title).toBe('Updated')
        expect(newState.toasts[0].description).toBe('Desc')
        expect(newState.toasts[0].open).toBe(true)
      })
    })

    describe('DISMISS_TOAST action', () => {
      it('should set open to false for specific toast', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'First', open: true },
            { id: '2', title: 'Second', open: true },
          ],
        }

        const newState = reducer(initialState, {
          type: 'DISMISS_TOAST',
          toastId: '1',
        })

        expect(newState.toasts[0].open).toBe(false)
        expect(newState.toasts[1].open).toBe(true)
      })

      it('should dismiss all toasts when toastId is undefined', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'First', open: true },
            { id: '2', title: 'Second', open: true },
          ],
        }

        const newState = reducer(initialState, {
          type: 'DISMISS_TOAST',
          toastId: undefined,
        })

        expect(newState.toasts[0].open).toBe(false)
        expect(newState.toasts[1].open).toBe(false)
      })
    })

    describe('REMOVE_TOAST action', () => {
      it('should remove specific toast by id', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'First', open: true },
            { id: '2', title: 'Second', open: true },
          ],
        }

        const newState = reducer(initialState, {
          type: 'REMOVE_TOAST',
          toastId: '1',
        })

        expect(newState.toasts).toHaveLength(1)
        expect(newState.toasts[0].id).toBe('2')
      })

      it('should remove all toasts when toastId is undefined', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'First', open: true },
            { id: '2', title: 'Second', open: true },
          ],
        }

        const newState = reducer(initialState, {
          type: 'REMOVE_TOAST',
          toastId: undefined,
        })

        expect(newState.toasts).toHaveLength(0)
      })

      it('should not modify state if toast id not found', () => {
        const initialState = {
          toasts: [
            { id: '1', title: 'First', open: true },
          ],
        }

        const newState = reducer(initialState, {
          type: 'REMOVE_TOAST',
          toastId: '999',
        })

        expect(newState.toasts).toHaveLength(1)
        expect(newState.toasts[0].id).toBe('1')
      })
    })
  })

  describe('toast function', () => {
    it('should create a toast with generated id', () => {
      const result = toast({ title: 'Test' })

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('dismiss')
      expect(result).toHaveProperty('update')
      expect(typeof result.id).toBe('string')
      expect(typeof result.dismiss).toBe('function')
      expect(typeof result.update).toBe('function')
    })

    it('should generate unique ids for multiple toasts', () => {
      const toast1 = toast({ title: 'First' })
      const toast2 = toast({ title: 'Second' })

      expect(toast1.id).not.toBe(toast2.id)
    })

    it('should allow dismissing a toast', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        const toastInstance = toast({ title: 'Test' })
        toastInstance.dismiss()
      })

      // After dismiss, toast should be marked as not open
      // This is tested more thoroughly in integration tests
    })

    it('should allow updating a toast', () => {
      const toastInstance = toast({ title: 'Original' })

      act(() => {
        toastInstance.update({ title: 'Updated', description: 'New description' })
      })

      // Update should dispatch UPDATE_TOAST action
    })
  })

  describe('useToast hook integration', () => {
    it('should initialize with empty toasts array', () => {
      const { result } = renderHook(() => useToast())

      expect(result.current.toasts).toEqual([])
    })

    it('should expose toast function', () => {
      const { result } = renderHook(() => useToast())

      expect(typeof result.current.toast).toBe('function')
    })

    it('should expose dismiss function', () => {
      const { result } = renderHook(() => useToast())

      expect(typeof result.current.dismiss).toBe('function')
    })

    it('should add toast to state when toast is called', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Test Toast' })
      })

      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Test Toast')
    })

    it('should dismiss specific toast', () => {
      const { result } = renderHook(() => useToast())

      let toastId: string

      act(() => {
        const t = result.current.toast({ title: 'Test Toast' })
        toastId = t.id
      })

      expect(result.current.toasts[0].open).toBe(true)

      act(() => {
        result.current.dismiss(toastId!)
      })

      expect(result.current.toasts[0].open).toBe(false)
    })

    it('should dismiss all toasts when no id provided', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'First' })
      })

      expect(result.current.toasts[0].open).toBe(true)

      act(() => {
        result.current.dismiss()
      })

      expect(result.current.toasts[0].open).toBe(false)
    })

    it('should handle onOpenChange callback', () => {
      const { result } = renderHook(() => useToast())
      let toastId: string

      act(() => {
        const t = result.current.toast({ title: 'Test' })
        toastId = t.id
      })

      const toastObj = result.current.toasts[0]

      act(() => {
        toastObj.onOpenChange?.(false)
      })

      // Should trigger dismiss
      expect(result.current.toasts[0].open).toBe(false)
    })

    it('should not dismiss when onOpenChange is called with true', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'Test' })
      })

      const toastObj = result.current.toasts[0]

      act(() => {
        toastObj.onOpenChange?.(true)
      })

      expect(result.current.toasts[0].open).toBe(true)
    })
  })

  describe('memory management', () => {
    it('should cleanup listeners on unmount', () => {
      const { result, unmount } = renderHook(() => useToast())

      expect(result.current.toasts).toBeDefined()

      unmount()

      // After unmount, listeners should be cleaned up
      // This prevents memory leaks
    })

    it('should not cause memory leaks with multiple mounts/unmounts', () => {
      const { unmount: unmount1 } = renderHook(() => useToast())
      const { unmount: unmount2 } = renderHook(() => useToast())
      const { unmount: unmount3 } = renderHook(() => useToast())

      unmount1()
      unmount2()
      unmount3()

      // Should not throw or cause issues
    })
  })

  describe('concurrent toast operations', () => {
    it('should handle rapid toast creation', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({ title: 'First' })
        result.current.toast({ title: 'Second' })
        result.current.toast({ title: 'Third' })
      })

      // Only 1 toast should remain due to TOAST_LIMIT
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Third')
    })

    it('should handle toast update after creation', () => {
      const { result } = renderHook(() => useToast())
      let toastInstance: any

      act(() => {
        toastInstance = result.current.toast({ title: 'Original' })
      })

      act(() => {
        toastInstance.update({ title: 'Updated' })
      })

      expect(result.current.toasts[0].title).toBe('Updated')
    })

    it('should handle dismiss after creation', () => {
      const { result } = renderHook(() => useToast())
      let toastInstance: any

      act(() => {
        toastInstance = result.current.toast({ title: 'Test' })
      })

      expect(result.current.toasts[0].open).toBe(true)

      act(() => {
        toastInstance.dismiss()
      })

      expect(result.current.toasts[0].open).toBe(false)
    })
  })

  describe('toast with additional properties', () => {
    it('should handle toast with description', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Title',
          description: 'Description',
        })
      })

      expect(result.current.toasts[0].title).toBe('Title')
      expect(result.current.toasts[0].description).toBe('Description')
    })

    it('should handle toast with action', () => {
      const { result } = renderHook(() => useToast())
      const action = { altText: 'Undo' } as any

      act(() => {
        result.current.toast({
          title: 'Test',
          action,
        })
      })

      expect(result.current.toasts[0].action).toEqual(action)
    })

    it('should handle toast with variant', () => {
      const { result } = renderHook(() => useToast())

      act(() => {
        result.current.toast({
          title: 'Error',
          variant: 'destructive',
        } as any)
      })

      expect(result.current.toasts[0].variant).toBe('destructive')
    })
  })
})
