import { useEffect } from 'react'

const DEFAULT_TITLE = 'Bodija Health Hub — Wellness Starts Here'
const DEFAULT_DESCRIPTION =
  'Community-based integrated healthcare ecosystem bringing clinics, specialists, and quality digital solutions together in Ibadan.'

function setMeta(attr, key, value) {
  if (!value) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setCanonical(href) {
  if (!href) return
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// Upsert a single page-level JSON-LD script block (replaces any previous one).
function setJsonLd(script) {
  const tag = 'application/ld+json'
  const prev = document.head.querySelector(`script[data-seo-jsonld]`)
  const el = document.createElement('script')
  el.type = tag
  el.setAttribute('data-seo-jsonld', 'true')
  el.textContent = JSON.stringify(script)
  if (prev) prev.replaceWith(el)
  else document.head.appendChild(el)
}

export default function useSeo(pathname) {
  useEffect(() => {
    const pageId = pathname === '/' ? 'home' : pathname.replace(/^\//, '').replace(/\//g, '-')
    let active = true

    document.title = DEFAULT_TITLE
    setMeta('name', 'description', DEFAULT_DESCRIPTION)

    fetch(`/api/seo/${pageId}`)
      .then(res => (res.ok ? res.json() : {}))
      .then(seo => {
        if (!active) return
        const title = seo.metaTitle || DEFAULT_TITLE
        const description = seo.metaDescription || DEFAULT_DESCRIPTION
        const url = seo.canonical || `${window.location.origin}${pathname === '/' ? '/' : pathname}`
        if (seo.metaTitle) document.title = seo.metaTitle
        setMeta('name', 'description', description)
        setMeta('property', 'og:title', seo.ogTitle || seo.metaTitle)
        setMeta('property', 'og:description', seo.ogDescription || seo.metaDescription)
        setMeta('property', 'og:image', seo.ogImage)
        setMeta('property', 'og:url', url)
        setMeta('property', 'og:type', 'website')
        setMeta('property', 'og:site_name', 'Bodija Health Hub')
        setMeta('name', 'twitter:card', seo.twitterCard || 'summary_large_image')
        setMeta('name', 'twitter:title', seo.twitterTitle || seo.metaTitle)
        setMeta('name', 'twitter:description', seo.twitterDescription || seo.metaDescription)
        setMeta('name', 'twitter:image', seo.twitterImage)
        setCanonical(seo.canonical)

        setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': url,
          name: title,
          description,
          url,
          inLanguage: 'en',
          isPartOf: { '@id': 'https://bodijahealthhub.com/#website' },
          about: { '@id': 'https://bodijahealthhub.com/#organization' },
        })

        if (seo.noindex) {
          let el = document.head.querySelector('meta[name="robots"]')
          if (!el) {
            el = document.createElement('meta')
            el.setAttribute('name', 'robots')
            document.head.appendChild(el)
          }
          el.setAttribute('content', `noindex${seo.nofollow ? ', nofollow' : ''}`)
        } else if (seo.nofollow) {
          let el = document.head.querySelector('meta[name="robots"]')
          if (!el) {
            el = document.createElement('meta')
            el.setAttribute('name', 'robots')
            document.head.appendChild(el)
          }
          el.setAttribute('content', 'nofollow')
        }
      })
      .catch(() => {})

    return () => { active = false }
  }, [pathname])
}
