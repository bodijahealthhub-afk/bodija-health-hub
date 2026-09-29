import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { FeatureProvider } from '../context/FeatureContext'
import Home from '../pages/Home'

function renderHome() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({}),
  }))
  return render(
    <MemoryRouter>
      <FeatureProvider>
        <Home />
      </FeatureProvider>
    </MemoryRouter>
  )
}

function activeSlideGroup() {
  return [...document.querySelectorAll('[aria-roledescription="slide"]')]
    .find(el => el.getAttribute('aria-hidden') === 'false')
}

function currentIndicator() {
  return ['1', '2', '3'].find(n =>
    screen.getByRole('button', { name: `Go to slide ${n}` }).getAttribute('aria-current') === 'true'
  )
}

function tick(ms) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

describe('Home hero carousel (BACR_Carousel_v2.docx + hero redesign spec)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders slide 1: BHH org name as h1, pill eyebrow, doc headline, Book Appointment, disabled Visit Website', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BODIJA HEALTH HUB')
    expect(screen.getByText("Ibadan's Integrated Healthcare Ecosystem")).toBeInTheDocument()
    expect(activeSlideGroup().querySelector('h2').textContent).toContain('Wellness Starts Here.')
    expect(screen.getByText(/A community-based integrated healthcare ecosystem/)).toBeInTheDocument()
    const book = screen.getByRole('link', { name: /Book Appointment/ })
    expect(book).toHaveAttribute('href', '/appointments')
    const visit = screen.getByRole('button', { name: 'Visit Website' })
    expect(visit).toBeDisabled()
    expect(visit).toHaveAttribute('title', 'Website coming soon')
  })

  it('places the white logo mark above the organization name on the active slide', () => {
    const { container } = renderHome()
    const group = activeSlideGroup()
    const logo = group.querySelector('img[src="/hero/bhh-mark-white.png"]')
    expect(logo).toBeTruthy()
    const h1 = group.querySelector('h1')
    expect(logo.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(container.querySelector('img[src="/hero/bacr-mark-white.png"]')).toBeTruthy()
  })

  it('loads background photos with per-slide object-position from CMS', async () => {
    const { container } = renderHome()
    await waitFor(() => {
      expect(container.querySelector('img[src="/hero/slide-1.jpg"]')).toBeTruthy()
    })
    const bg = container.querySelector('img[src="/hero/slide-1.jpg"]')
    expect(bg.style.objectPosition).toBe('68% 45%')
    expect(container.querySelector('img[src="/hero/slide-2.jpg"]')).toBeTruthy()
    expect(container.querySelector('img[src="/hero/slide-3.jpg"]')).toBeTruthy()
  })

  it('falls back to the gradient when a background image fails to load', async () => {
    const { container } = renderHome()
    await waitFor(() => {
      expect(container.querySelector('img[src="/hero/slide-1.jpg"]')).toBeTruthy()
    })
    fireEvent.error(container.querySelector('img[src="/hero/slide-1.jpg"]'))
    expect(container.querySelector('img[src="/hero/slide-1.jpg"]')).toBeNull()
    expect(activeSlideGroup()).toBeTruthy()
  })

  it('falls back cleanly when a logo image fails to load', async () => {
    const { container } = renderHome()
    const logo = container.querySelector('img[src="/hero/bhh-mark-white.png"]')
    fireEvent.error(logo)
    expect(container.querySelector('img[src="/hero/bhh-mark-white.png"]')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BODIJA HEALTH HUB')
  })

  it('advances to BACR slides via next control and returns via indicator', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(currentIndicator()).toBe('2')
    expect(activeSlideGroup().textContent).toContain('Restoring Function. Rebuilding Lives.')
    expect(activeSlideGroup().textContent).toContain("Ibadan's dedicated rehabilitation centre")

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(currentIndicator()).toBe('3')
    expect(activeSlideGroup().textContent).toContain('Every Step Forward Matters.')

    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 1' }))
    expect(currentIndicator()).toBe('1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BODIJA HEALTH HUB')
  })

  it('has three indicators 01/02/03 with aria-current and a 4000ms progress fill on the active one', () => {
    const { container } = renderHome()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(currentIndicator()).toBe('1')
    const fills = container.querySelectorAll('.hero-progress')
    expect(fills).toHaveLength(1)
    expect(fills[0].style.animationDuration).toBe('4000ms')
    expect(fills[0].style.animationPlayState).toBe('running')
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }))
    expect(currentIndicator()).toBe('2')
    expect(container.querySelectorAll('.hero-progress')).toHaveLength(1)
    expect(container.querySelector('.hero-progress').style.animationDuration).toBe('4000ms')
  })

  it('keeps previous slides content byte-faithful (em dashes render)', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    const subtext = activeSlideGroup().querySelector('p')
    expect(subtext.textContent).toContain('\u2014')
    expect(subtext.textContent).toContain('specialist-led')
  })

  it('auto-advances every 4000ms and manual navigation resets the timer', () => {
    vi.useFakeTimers()
    renderHome()
    expect(currentIndicator()).toBe('1')

    tick(4000)
    expect(currentIndicator()).toBe('2')

    tick(2000)
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(currentIndicator()).toBe('3')

    tick(1999)
    expect(currentIndicator()).toBe('3')
    tick(1)
    expect(currentIndicator()).toBe('3')

    tick(2000)
    expect(currentIndicator()).toBe('1')
  })

  it('pauses auto-advance while the pointer is over the hero and resumes after', () => {
    vi.useFakeTimers()
    renderHome()
    const hero = screen.getByRole('region', { name: 'Hero carousel' })

    fireEvent.mouseEnter(hero)
    tick(12000)
    expect(currentIndicator()).toBe('1')

    fireEvent.mouseLeave(hero)
    tick(4000)
    expect(currentIndicator()).toBe('2')
  })

  it('does not auto-advance under prefers-reduced-motion', () => {
    vi.stubGlobal('matchMedia', vi.fn(query => ({
      matches: query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    })))
    vi.useFakeTimers()
    renderHome()
    tick(20000)
    expect(currentIndicator()).toBe('1')
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }))
    expect(currentIndicator()).toBe('2')
  })
})
