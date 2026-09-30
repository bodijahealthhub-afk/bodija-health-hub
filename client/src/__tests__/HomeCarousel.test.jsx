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

describe('Home hero carousel (BACR_Carousel_v2.docx + lockup redesign)', () => {
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

  it('renders slide 1: BACR lockup as the h1, no pill, doc headline, Book Appointment, disabled Visit Website', () => {
    renderHome()
    const h1 = screen.getByRole('heading', { level: 1, name: 'BACR' })
    expect(h1.querySelector('img[src="/hero/bacr-mark-white.png"]')).toBeTruthy()
    expect(screen.queryByText('Bodija Advanced Care & Rehabilitation Centre')).toBeNull()
    expect(activeSlideGroup().querySelector('h2').textContent).toContain('Restoring Function. Rebuilding Lives.')
    expect(activeSlideGroup().textContent).toContain("Ibadan's dedicated rehabilitation centre")
    const book = screen.getByRole('link', { name: /Book Appointment/ })
    expect(book).toHaveAttribute('href', '/appointments')
    const visit = screen.getByRole('button', { name: 'Visit Website' })
    expect(visit).toBeDisabled()
    expect(visit).toHaveAttribute('title', 'Website coming soon')
  })

  it('shows the BACR lockup big (in-your-face) and no separate org text on BACR slides', () => {
    const { container } = renderHome()
    const group = activeSlideGroup()
    const lockup = group.querySelector('h1 img[src="/hero/bacr-mark-white.png"]')
    expect(lockup).toBeTruthy()
    expect(lockup.getAttribute('class')).toContain('h-40')
    expect(lockup.getAttribute('class')).toContain('md:h-56')
    expect(lockup.getAttribute('alt')).toBe('BACR')
    const textH1 = [...group.querySelectorAll('h1')].find(el => el.textContent.includes('BACR'))
    expect(textH1).toBeUndefined()
    expect(container.querySelectorAll('img[src="/hero/bacr-mark-white.png"]')).toHaveLength(2)
  })

  it('renders the BHH slide third: mark above big bold BHH, pill reads Bodija Health Hub', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    const group = activeSlideGroup()
    const h1 = group.querySelector('h1')
    expect(h1.textContent).toBe('BHH')
    expect(h1.getAttribute('class')).toContain('text-8xl')
    const mark = group.querySelector('img[src="/hero/bhh-mark-white.png"]')
    expect(mark).toBeTruthy()
    expect(mark.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByText('Bodija Health Hub')).toBeInTheDocument()
    expect(group.querySelector('h2').textContent).toContain('Wellness Starts Here.')
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

  it('falls back to big BACR text when the lockup image fails to load', () => {
    renderHome()
    const lockup = activeSlideGroup().querySelector('img[src="/hero/bacr-mark-white.png"]')
    fireEvent.error(lockup)
    expect(activeSlideGroup().querySelector('img[src="/hero/bacr-mark-white.png"]')).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'BACR' }).textContent).toBe('BACR')
  })

  it('navigates: 1 = Restoring (BACR), 2 = Every Step (BACR), 3 = Wellness (BHH)', () => {
    renderHome()
    expect(activeSlideGroup().textContent).toContain('Restoring Function. Rebuilding Lives.')

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(currentIndicator()).toBe('2')
    expect(activeSlideGroup().textContent).toContain('Every Step Forward Matters.')
    expect(activeSlideGroup().textContent).toContain('specialist-led')
    expect(screen.getByRole('heading', { level: 1, name: 'BACR' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(currentIndicator()).toBe('3')
    expect(activeSlideGroup().textContent).toContain('Wellness Starts Here.')
    expect(screen.getByRole('heading', { level: 1, name: 'BHH' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 1' }))
    expect(currentIndicator()).toBe('1')
    expect(activeSlideGroup().textContent).toContain('Restoring Function. Rebuilding Lives.')
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
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 2' }))
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
