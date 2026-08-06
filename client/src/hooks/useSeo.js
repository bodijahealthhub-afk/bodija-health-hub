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
        if (seo.metaTitle) document.title = seo.metaTitle
        setMeta('name', 'description', seo.metaDescription || DEFAULT_DESCRIPTION)
        setMeta('property', 'og:title', seo.ogTitle || seo.metaTitle)
        setMeta('property', 'og:description', seo.ogDescription || seo.metaDescription)
        setMeta('property', 'og:image', seo.ogImage)
        setMeta('name', 'twitter:card', seo.twitterCard)
        setMeta('name', 'twitter:title', seo.twitterTitle || seo.metaTitle)
        setMeta('name', 'twitter:description', seo.twitterDescription || seo.metaDescription)
        setMeta('name', 'twitter:image', seo.twitterImage)
        setCanonical(seo.canonical)
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
