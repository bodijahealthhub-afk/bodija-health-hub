import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

describe('Home hero carousel (BACR_Carousel_v2.docx)', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    })
  })

  it('renders slide 1 with doc content: eyebrow, headline, Book Appointment link, disabled Visit Website', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Wellness Starts Here.')
    expect(screen.getByText("Ibadan's Integrated Healthcare Ecosystem")).toBeInTheDocument()
    expect(screen.getByText(/A community-based integrated healthcare ecosystem/)).toBeInTheDocument()
    const book = screen.getByRole('link', { name: /Book Appointment/ })
    expect(book).toHaveAttribute('href', '/appointments')
    const visit = screen.getByRole('button', { name: 'Visit Website' })
    expect(visit).toBeDisabled()
    expect(visit).toHaveAttribute('title', 'Website coming soon')
  })

  it('advances to BACR slides via next control and returns via dot', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Restoring Function. Rebuilding Lives.')
    expect(screen.getAllByText('Bodija Advanced Care & Rehabilitation Centre').length).toBeGreaterThan(0)
    expect(screen.getByText(/Recovery is not just physical/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Next slide' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Every Step Forward Matters.')
    expect(screen.getByText(/our specialist-led programmes are built to restore what matters most/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 1' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Wellness Starts Here.')
  })

  it('has three carousel dots with aria-current on the active one', () => {
    renderHome()
    const dots = ['Go to slide 1', 'Go to slide 2', 'Go to slide 3'].map((label) =>
      screen.getByRole('button', { name: label })
    )
    expect(dots[0]).toHaveAttribute('aria-current', 'true')
    expect(dots[1]).not.toHaveAttribute('aria-current')
    fireEvent.click(dots[1])
    expect(dots[1]).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Restoring Function. Rebuilding Lives.')
  })

  it('keeps previous slides content byte-faithful (em dashes render)', () => {
    renderHome()
    fireEvent.click(screen.getByRole('button', { name: 'Go to slide 3' }))
    const subtext = screen.getByText(/From physiotherapy and speech therapy/)
    expect(subtext.textContent).toContain('\u2014')
    expect(subtext.textContent).toContain('specialist-led')
  })
})
