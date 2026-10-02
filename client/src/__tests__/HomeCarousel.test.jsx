import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react'
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

  it('renders slide 1: Bodija Health Hub presents pill above the BACR lockup, doc headline, Book Appointment, disabled Visit Website', () => {
    renderHome()
    const h1 = screen.getByRole('heading', { level: 1, name: 'BACR' })
    expect(h1.querySelector('img[src="/hero/bacr-mark-white.png"]')).toBeTruthy()
    const pill = within(activeSlideGroup()).getByText('Bodija Health Hub presents')
    expect(pill.compareDocumentPosition(h1) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
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

  it('renders the BHH slide third: full white lockup inside the h1, no pill, CTAs preserved', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    const group = activeSlideGroup()
    const h1 = group.querySelector('h1')
    const lockup = h1.querySelector('img[src="/hero/bhh-lockup-white.png"]')
    expect(lockup).toBeTruthy()
    expect(lockup.getAttribute('alt')).toBe('BHH')
    expect(h1.querySelector('.text-8xl')).toBeNull()
    expect(within(group).queryByText('Bodija Health Hub')).toBeNull()
    expect(group.querySelector('h2').textContent).toContain('Wellness Starts Here.')
    const explore = within(group).getByRole('link', { name: 'Explore Ecosystem' })
    expect(explore).toHaveAttribute('href', '/ecosystem')
    const ourServices = within(group).getByRole('link', { name: 'Our Services' })
    expect(ourServices).toHaveAttribute('href', '/services')
    expect(within(group).queryByRole('button', { name: 'Visit Website' })).toBeNull()
    expect(within(group).queryByText('Book Appointment')).toBeNull()
  })

  it('falls back to big BHH text when the BHH lockup image fails to load', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    const lockup = activeSlideGroup().querySelector('img[src="/hero/bhh-lockup-white.png"]')
    fireEvent.error(lockup)
    expect(activeSlideGroup().querySelector('img[src="/hero/bhh-lockup-white.png"]')).toBeNull()
    expect(screen.getByRole('heading', { level: 1, name: 'BHH' }).textContent).toBe('BHH')
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

  it('has three indicators 01/02/03 with aria-current and a 7000ms progress fill on the first slide, 4000ms on the others', () => {
    const { container } = renderHome()
    expect(screen.getByText('01')).toBeInTheDocument()
    expect(screen.getByText('02')).toBeInTheDocument()
    expect(screen.getByText('03')).toBeInTheDocument()
    expect(currentIndicator()).toBe('1')
    const fills = container.querySelectorAll('.hero-progress')
    expect(fills).toHaveLength(1)
    expect(fills[0].style.animationDuration).toBe('7000ms')
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

  it('auto-advances the first slide after 7000ms, later slides after 4000ms, and manual navigation resets the timer', () => {
    vi.useFakeTimers()
    renderHome()
    expect(currentIndicator()).toBe('1')

    tick(4000)
    expect(currentIndicator()).toBe('1')

    tick(3000)
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
    tick(7000)
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

describe('Homepage CMS fields (admin Site Content → Homepage tab)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
  })

  it('renders admin-edited copy for every homepage section', async () => {
    const cms = {
      home_trust_title: 'CMS Trust Title',
      home_about_eyebrow: 'CMS About Eyebrow',
      home_values_eyebrow: 'CMS Values Eyebrow',
      home_values_title: 'CMS Values Heading',
      home_values: JSON.stringify([{ title: 'CMS Value One', desc: 'CMS Value Desc' }]),
      home_stats: JSON.stringify([{ value: '12', suffix: '+', label: 'CMS Stat Label' }]),
      home_services_eyebrow: 'CMS Services Eyebrow',
      home_eco_eyebrow: 'CMS Eco Eyebrow',
      home_eco_title: 'CMS Eco Heading',
      home_testi_eyebrow: 'CMS Testimonials Eyebrow',
      home_programmes_title: 'CMS Programmes Heading',
      home_events_title: 'CMS Events Heading',
      home_blog_title: 'CMS Blog Heading',
      contact_headline: 'CMS CTA Headline',
      home_cta_btn1_text: 'CMS CTA Button',
    }
    vi.stubGlobal('fetch', vi.fn().mockImplementation((url) => Promise.resolve({
      ok: true,
      json: async () => (String(url).includes('site-content') ? cms : {}),
    })))
    render(
      <MemoryRouter>
        <FeatureProvider>
          <Home />
        </FeatureProvider>
      </MemoryRouter>
    )
    await waitFor(() => expect(screen.getByText('CMS Trust Title')).toBeInTheDocument())
    expect(screen.getByText('CMS About Eyebrow')).toBeInTheDocument()
    expect(screen.getByText('CMS Values Eyebrow')).toBeInTheDocument()
    expect(screen.getByText('CMS Values Heading')).toBeInTheDocument()
    expect(screen.getByText('CMS Value One')).toBeInTheDocument()
    expect(screen.getByText('CMS Value Desc')).toBeInTheDocument()
    expect(screen.getByText('CMS Stat Label')).toBeInTheDocument()
    expect(screen.getByText('CMS Services Eyebrow')).toBeInTheDocument()
    expect(screen.getByText('CMS Eco Eyebrow')).toBeInTheDocument()
    expect(screen.getByText('CMS Eco Heading')).toBeInTheDocument()
    expect(screen.getByText('CMS Testimonials Eyebrow')).toBeInTheDocument()
    expect(screen.getByText('CMS Programmes Heading')).toBeInTheDocument()
    expect(screen.getByText('CMS Events Heading')).toBeInTheDocument()
    expect(screen.getByText('CMS Blog Heading')).toBeInTheDocument()
    expect(screen.getByText('CMS CTA Headline')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /CMS CTA Button/ })).toHaveAttribute('href', '/contact')
  })
})
