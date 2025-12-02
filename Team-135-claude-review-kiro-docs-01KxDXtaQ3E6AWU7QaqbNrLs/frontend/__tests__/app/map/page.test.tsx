import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import MapPage from '@/app/map/page'

describe('MapPage', () => {
  describe('rendering', () => {
    it('should render the page', () => {
      render(<MapPage />)

      expect(screen.getByText('Basic Resources')).toBeInTheDocument()
    })

    it('should render header with back button', () => {
      render(<MapPage />)

      const backButton = screen.getAllByRole('link')[0]
      expect(backButton).toHaveAttribute('href', '/resources')
    })

    it('should render map placeholder', () => {
      render(<MapPage />)

      expect(screen.getByText('Map View')).toBeInTheDocument()
      expect(screen.getByText('San Francisco')).toBeInTheDocument()
    })

    it('should render resource card', () => {
      render(<MapPage />)

      expect(screen.getByText('Hope Shelter')).toBeInTheDocument()
    })

    it('should render bottom navigation', () => {
      render(<MapPage />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Resources')).toBeInTheDocument()
      expect(screen.getByText('Map')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })
  })

  describe('header', () => {
    it('should have back button linking to resources', () => {
      render(<MapPage />)

      const links = screen.getAllByRole('link')
      const backLink = links.find(link => link.getAttribute('href') === '/resources')
      expect(backLink).toBeInTheDocument()
    })

    it('should display correct title', () => {
      render(<MapPage />)

      const heading = screen.getByText('Basic Resources')
      expect(heading.tagName).toBe('H1')
    })

    it('should style header correctly', () => {
      const { container } = render(<MapPage />)

      const header = container.querySelector('header')
      expect(header?.className).toContain('border-b')
      expect(header?.className).toContain('border-[#2a2d3e]')
    })
  })

  describe('map view', () => {
    it('should display Map View text', () => {
      render(<MapPage />)

      expect(screen.getByText('Map View')).toBeInTheDocument()
    })

    it('should display location (San Francisco)', () => {
      render(<MapPage />)

      expect(screen.getByText('San Francisco')).toBeInTheDocument()
    })

    it('should render MapPin icon in placeholder', () => {
      const { container } = render(<MapPage />)

      const mapPin = container.querySelector('svg.lucide-map-pin')
      expect(mapPin).toBeInTheDocument()
    })

    it('should have gradient background for map', () => {
      const { container } = render(<MapPage />)

      const mapDiv = container.querySelector('.bg-gradient-to-br')
      expect(mapDiv).toBeInTheDocument()
    })

    it('should render location markers', () => {
      const { container } = render(<MapPage />)

      // Check for marker elements (rounded circles with specific positioning)
      const markers = container.querySelectorAll('.rounded-full.border-white')
      expect(markers.length).toBeGreaterThanOrEqual(3)
    })

    it('should have animated marker', () => {
      const { container } = render(<MapPage />)

      const animatedMarker = container.querySelector('.animate-pulse')
      expect(animatedMarker).toBeInTheDocument()
    })

    it('should position markers absolutely', () => {
      const { container } = render(<MapPage />)

      const marker = container.querySelector('.absolute.rounded-full')
      expect(marker).toBeInTheDocument()
    })
  })

  describe('resource card', () => {
    it('should display shelter name', () => {
      render(<MapPage />)

      expect(screen.getByText('Hope Shelter')).toBeInTheDocument()
    })

    it('should show verified status', () => {
      render(<MapPage />)

      expect(screen.getByText('Verified Today')).toBeInTheDocument()
    })

    it('should display hours information', () => {
      render(<MapPage />)

      expect(screen.getByText('Open until 8:00 PM')).toBeInTheDocument()
    })

    it('should show pet-friendly badge', () => {
      render(<MapPage />)

      expect(screen.getByText('Pet-friendly')).toBeInTheDocument()
    })

    it('should display distance information', () => {
      render(<MapPage />)

      expect(screen.getByText('Walk north 0.3 miles')).toBeInTheDocument()
    })

    it('should show phone number', () => {
      render(<MapPage />)

      expect(screen.getByText('(555) 123-4567')).toBeInTheDocument()
    })

    it('should have Talk to someone button', () => {
      render(<MapPage />)

      expect(screen.getByText('Talk to someone')).toBeInTheDocument()
    })

    it('should style resource card with dark background', () => {
      const { container } = render(<MapPage />)

      const card = screen.getByText('Hope Shelter').closest('div')?.parentElement?.parentElement
      expect(card?.className).toContain('bg-[#1a1d2e]')
      expect(card?.className).toContain('rounded-3xl')
    })

    it('should render CheckCircle icon for verified status', () => {
      const { container } = render(<MapPage />)

      const verifiedSection = screen.getByText('Verified Today').closest('div')
      const checkIcon = verifiedSection?.querySelector('svg.lucide-check-circle')
      expect(checkIcon).toBeInTheDocument()
    })

    it('should render Clock icon for hours', () => {
      const { container } = render(<MapPage />)

      const hoursSection = screen.getByText('Open until 8:00 PM').closest('div')
      const clockIcon = hoursSection?.querySelector('svg.lucide-clock')
      expect(clockIcon).toBeInTheDocument()
    })

    it('should render Phone icon in button', () => {
      const { container } = render(<MapPage />)

      const button = screen.getByText('Talk to someone')
      const phoneIcon = button.querySelector('svg.lucide-phone')
      expect(phoneIcon).toBeInTheDocument()
    })
  })

  describe('bottom navigation', () => {
    it('should render all 4 navigation items', () => {
      render(<MapPage />)

      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Resources')).toBeInTheDocument()
      expect(screen.getByText('Map')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })

    it('should have Home link', () => {
      render(<MapPage />)

      const links = screen.getAllByRole('link')
      const homeLink = links.find(link => link.getAttribute('href') === '/' && link.textContent?.includes('Home'))
      expect(homeLink).toBeInTheDocument()
    })

    it('should have Resources link', () => {
      render(<MapPage />)

      const links = screen.getAllByRole('link')
      const resourcesLink = links.find(link => link.getAttribute('href') === '/resources')
      expect(resourcesLink).toBeInTheDocument()
    })

    it('should highlight Map as active', () => {
      render(<MapPage />)

      const mapButton = screen.getByText('Map').closest('button')
      expect(mapButton?.className).toContain('text-white')
      expect(mapButton?.className).not.toContain('text-white/60')
    })

    it('should render Home icon', () => {
      const { container } = render(<MapPage />)

      const homeButton = screen.getByText('Home').closest('button')
      const homeIcon = homeButton?.querySelector('svg.lucide-home')
      expect(homeIcon).toBeInTheDocument()
    })

    it('should render MapPin icon', () => {
      const { container } = render(<MapPage />)

      const mapButton = screen.getByText('Map').closest('button')
      const mapIcon = mapButton?.querySelector('svg.lucide-map-pin')
      expect(mapIcon).toBeInTheDocument()
    })
  })

  describe('styling and layout', () => {
    it('should have dark background', () => {
      const { container } = render(<MapPage />)

      const mainDiv = container.querySelector('.bg-\\[\\#1a1d2e\\]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should be full height', () => {
      const { container } = render(<MapPage />)

      const mainDiv = container.querySelector('.min-h-screen')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should have flex column layout', () => {
      const { container } = render(<MapPage />)

      const mainDiv = container.querySelector('.flex-col')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should position resource card at bottom', () => {
      const { container } = render(<MapPage />)

      const cardContainer = screen.getByText('Hope Shelter')
        .closest('.bg-\\[\\#1a1d2e\\]')
        ?.parentElement

      expect(cardContainer?.className).toContain('absolute')
      expect(cardContainer?.className).toContain('bottom-0')
    })

    it('should make main content relative for absolute positioning', () => {
      const { container } = render(<MapPage />)

      const main = container.querySelector('main')
      expect(main?.className).toContain('relative')
    })

    it('should fill main area with map', () => {
      const { container } = render(<MapPage />)

      const main = container.querySelector('main')
      expect(main?.className).toContain('flex-1')
    })
  })

  describe('badge styling', () => {
    it('should style pet-friendly badge with green background', () => {
      render(<MapPage />)

      const badge = screen.getByText('Pet-friendly').closest('div')
      expect(badge?.className).toContain('bg-[#7a9278]')
      expect(badge?.className).toContain('rounded-full')
    })

    it('should use small text in badge', () => {
      render(<MapPage />)

      const badgeText = screen.getByText('Pet-friendly')
      expect(badgeText.className).toContain('text-xs')
      expect(badgeText.className).toContain('font-semibold')
    })
  })

  describe('button styling', () => {
    it('should style Talk to someone button with blue background', () => {
      render(<MapPage />)

      const button = screen.getByText('Talk to someone')
      expect(button.className).toContain('bg-blue-600')
      expect(button.className).toContain('hover:bg-blue-700')
    })

    it('should make button full width', () => {
      render(<MapPage />)

      const button = screen.getByText('Talk to someone')
      expect(button.className).toContain('w-full')
    })

    it('should have appropriate button height', () => {
      render(<MapPage />)

      const button = screen.getByText('Talk to someone')
      expect(button.className).toContain('h-12')
    })

    it('should round button corners', () => {
      render(<MapPage />)

      const button = screen.getByText('Talk to someone')
      expect(button.className).toContain('rounded-xl')
    })
  })

  describe('accessibility', () => {
    it('should have semantic HTML structure', () => {
      const { container } = render(<MapPage />)

      expect(container.querySelector('header')).toBeInTheDocument()
      expect(container.querySelector('main')).toBeInTheDocument()
      expect(container.querySelector('nav')).toBeInTheDocument()
    })

    it('should have proper heading', () => {
      render(<MapPage />)

      const heading = screen.getByText('Basic Resources')
      expect(heading.tagName).toBe('H1')
    })

    it('should have h2 for resource name', () => {
      render(<MapPage />)

      const shelterName = screen.getByText('Hope Shelter')
      expect(shelterName.tagName).toBe('H2')
    })

    it('should have accessible button', () => {
      render(<MapPage />)

      const button = screen.getByRole('button', { name: /Talk to someone/i })
      expect(button).toBeInTheDocument()
    })

    it('should have accessible links', () => {
      render(<MapPage />)

      const links = screen.getAllByRole('link')
      expect(links.length).toBeGreaterThan(0)

      links.forEach(link => {
        expect(link).toHaveAttribute('href')
      })
    })

    it('should provide text alternatives for icons', () => {
      render(<MapPage />)

      // Icons should be accompanied by text labels
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Resources')).toBeInTheDocument()
      expect(screen.getByText('Map')).toBeInTheDocument()
      expect(screen.getByText('Profile')).toBeInTheDocument()
    })
  })

  describe('map markers styling', () => {
    it('should style primary marker differently', () => {
      const { container } = render(<MapPage />)

      const primaryMarker = container.querySelector('.bg-blue-500.animate-pulse')
      expect(primaryMarker).toBeInTheDocument()
      expect(primaryMarker?.className).toContain('h-10')
      expect(primaryMarker?.className).toContain('w-10')
    })

    it('should style secondary markers', () => {
      const { container } = render(<MapPage />)

      const markers = container.querySelectorAll('.bg-green-500')
      expect(markers.length).toBeGreaterThanOrEqual(2)

      markers.forEach(marker => {
        expect(marker.className).toContain('h-8')
        expect(marker.className).toContain('w-8')
      })
    })

    it('should add shadow to markers', () => {
      const { container } = render(<MapPage />)

      const markers = container.querySelectorAll('.rounded-full.border-white')
      markers.forEach(marker => {
        expect(marker.className).toContain('shadow-lg')
      })
    })
  })

  describe('responsive design', () => {
    it('should have max-width container for navigation', () => {
      const { container } = render(<MapPage />)

      const navContainer = container.querySelector('nav .max-w-md')
      expect(navContainer).toBeInTheDocument()
    })

    it('should center navigation content', () => {
      const { container } = render(<MapPage />)

      const navContainer = container.querySelector('nav .mx-auto')
      expect(navContainer).toBeInTheDocument()
    })

    it('should have max-width for resource card', () => {
      const { container } = render(<MapPage />)

      const card = screen.getByText('Hope Shelter')
        .closest('.max-w-md')
      expect(card).toBeInTheDocument()
    })

    it('should add padding to resource card container', () => {
      const { container } = render(<MapPage />)

      const cardContainer = screen.getByText('Hope Shelter')
        .closest('.bg-\\[\\#1a1d2e\\]')
        ?.parentElement

      expect(cardContainer?.className).toContain('p-4')
    })
  })

  describe('edge cases', () => {
    it('should handle component unmount gracefully', () => {
      const { unmount } = render(<MapPage />)

      expect(() => unmount()).not.toThrow()
    })

    it('should render without errors', () => {
      expect(() => render(<MapPage />)).not.toThrow()
    })
  })

  describe('layout structure', () => {
    it('should position map absolutely to fill space', () => {
      const { container } = render(<MapPage />)

      const mapContainer = container.querySelector('main > .absolute.inset-0')
      expect(mapContainer).toBeInTheDocument()
    })

    it('should overlay resource card on map', () => {
      const { container } = render(<MapPage />)

      const main = container.querySelector('main')
      expect(main?.className).toContain('relative')

      const overlay = main?.querySelector('.absolute.bottom-0')
      expect(overlay).toBeInTheDocument()
    })

    it('should center map placeholder content', () => {
      const { container } = render(<MapPage />)

      const centerContainer = container.querySelector('.flex.items-center.justify-center')
      expect(centerContainer).toBeInTheDocument()
    })
  })
})
