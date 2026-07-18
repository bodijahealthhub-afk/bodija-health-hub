import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Main Pages',
    links: [
      { name: 'Home', path: '/' },
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Careers', path: '/careers' },
      { name: 'Health Resources', path: '/resources' },
    ],
  },
  {
    title: 'Our Ecosystem',
    links: [
      { name: 'Ecosystem Overview', path: '/ecosystem' },
      { name: 'Partner With Us', path: '/partners' },
    ],
  },
  {
    title: 'Our Platforms',
    links: [
      { name: 'LiveCare', path: '/platforms' },
      { name: 'hEar Menders', path: '/platforms' },
      { name: 'Upcoming: BACR', path: '/upcoming' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Use', path: '/terms' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { name: 'Email Us', path: 'mailto:info@bodijahealthhub.com', external: true },
      { name: 'Call Us', path: 'tel:+2348000000000', external: true },
      { name: 'Visit Us', path: '/contact' },
    ],
  },
]

export default function Sitemap() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">
              Site Navigation
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Sitemap
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              A complete overview of all pages and resources available on the Bodija Health Hub website.
            </p>
          </div>
        </div>
      </section>

      {/* Sitemap Links */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {columns.map((col) => (
              <div key={col.title}>
                <h2 className="text-lg font-bold text-gray-900 mb-5">{col.title}</h2>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      {link.external ? (
                        <a
                          href={link.path}
                          className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.path}
                          className="text-gray-600 hover:text-primary transition-colors text-sm font-medium"
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="py-12 bg-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 mb-6">
            Can't find what you're looking for?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary font-semibold rounded-full border border-gray-200 hover:border-primary transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
