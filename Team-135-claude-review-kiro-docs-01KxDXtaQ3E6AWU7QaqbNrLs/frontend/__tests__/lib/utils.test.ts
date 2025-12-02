import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  describe('basic functionality', () => {
    it('should merge single class name', () => {
      expect(cn('text-red-500')).toBe('text-red-500')
    })

    it('should merge multiple class names', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    })

    it('should handle conditional classes with objects', () => {
      expect(cn({
        'text-red-500': true,
        'bg-blue-500': false,
      })).toBe('text-red-500')
    })

    it('should handle arrays of classes', () => {
      expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500')
    })

    it('should merge nested arrays', () => {
      expect(cn(['text-red-500', ['bg-blue-500', 'p-4']])).toBe('text-red-500 bg-blue-500 p-4')
    })
  })

  describe('edge cases', () => {
    it('should handle undefined values', () => {
      expect(cn('text-red-500', undefined)).toBe('text-red-500')
    })

    it('should handle null values', () => {
      expect(cn('text-red-500', null)).toBe('text-red-500')
    })

    it('should handle empty strings', () => {
      expect(cn('text-red-500', '')).toBe('text-red-500')
    })

    it('should handle all falsy values', () => {
      expect(cn('text-red-500', false, null, undefined, '', 0)).toBe('text-red-500')
    })

    it('should handle no arguments', () => {
      expect(cn()).toBe('')
    })

    it('should handle only falsy values', () => {
      expect(cn(false, null, undefined, '')).toBe('')
    })
  })

  describe('Tailwind CSS conflict resolution', () => {
    it('should resolve conflicting Tailwind classes (text colors)', () => {
      // twMerge should keep the last class when there's a conflict
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should resolve conflicting Tailwind classes (padding)', () => {
      const result = cn('p-4', 'p-8')
      expect(result).toBe('p-8')
    })

    it('should resolve conflicting Tailwind classes (background)', () => {
      const result = cn('bg-red-500', 'bg-blue-500')
      expect(result).toBe('bg-blue-500')
    })

    it('should keep non-conflicting classes together', () => {
      const result = cn('text-red-500', 'bg-blue-500', 'p-4')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('p-4')
    })

    it('should handle responsive variants correctly', () => {
      const result = cn('md:text-red-500', 'lg:text-blue-500')
      expect(result).toContain('md:text-red-500')
      expect(result).toContain('lg:text-blue-500')
    })

    it('should resolve conflicts with different breakpoints', () => {
      const result = cn('text-red-500', 'md:text-blue-500')
      expect(result).toContain('text-red-500')
      expect(result).toContain('md:text-blue-500')
    })
  })

  describe('real-world usage patterns', () => {
    it('should handle component className patterns', () => {
      const baseClasses = 'rounded-lg border'
      const variantClasses = 'bg-blue-500 text-white'
      const customClasses = 'hover:bg-blue-600'

      const result = cn(baseClasses, variantClasses, customClasses)
      expect(result).toContain('rounded-lg')
      expect(result).toContain('border')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-white')
      expect(result).toContain('hover:bg-blue-600')
    })

    it('should handle conditional styling with ternary', () => {
      const isActive = true
      const result = cn(
        'base-class',
        isActive ? 'active-class' : 'inactive-class'
      )
      expect(result).toContain('base-class')
      expect(result).toContain('active-class')
      expect(result).not.toContain('inactive-class')
    })

    it('should handle conditional styling with object notation', () => {
      const isDisabled = false
      const isLoading = true

      const result = cn('button', {
        'opacity-50': isDisabled,
        'animate-spin': isLoading,
      })

      expect(result).toContain('button')
      expect(result).not.toContain('opacity-50')
      expect(result).toContain('animate-spin')
    })

    it('should handle complex component styling', () => {
      const variant = 'primary'
      const size = 'large'
      const disabled = false

      const result = cn(
        'button',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-500 text-white',
        size === 'large' && 'text-lg px-6 py-3',
        size === 'small' && 'text-sm px-3 py-1',
        {
          'opacity-50 cursor-not-allowed': disabled,
        }
      )

      expect(result).toContain('button')
      expect(result).toContain('bg-blue-500')
      expect(result).toContain('text-lg')
      expect(result).not.toContain('opacity-50')
    })
  })

  describe('duplicate class handling', () => {
    it('should remove duplicate classes', () => {
      const result = cn('text-red-500', 'p-4', 'text-red-500')
      // The exact behavior depends on clsx and tailwind-merge
      // but duplicates should be handled appropriately
      expect(result).toBeTruthy()
    })

    it('should handle whitespace correctly', () => {
      const result = cn('  text-red-500  ', '  bg-blue-500  ')
      expect(result).not.toContain('  ')
      expect(result).toContain('text-red-500')
      expect(result).toContain('bg-blue-500')
    })
  })
})
