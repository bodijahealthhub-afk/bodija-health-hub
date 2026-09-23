import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'What Are Cookies',
    content: `Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, understanding how you use our site, and improving our services.`,
  },
  {
    title: 'How We Use Cookies',
    content: `Bodija Health Hub uses cookies to:

- **Essential Functionality:** Enable core website features such as page navigation, form submission, and secure areas.
- **Preferences:** Remember your settings and choices (such as language or region) for a more personalised experience.
- **Analytics:** Understand how visitors interact with our website so we can improve content, layout, and usability.
- **Security:** Detect and prevent fraudulent activity and protect our website and users.`,
  },
  {
    title: 'Types of Cookies We Use',
    content: `**Essential Cookies**
Required for the website to function properly. These cannot be disabled through our site.

**Functional Cookies**
Remember your preferences and settings to enhance your experience on return visits.

**Analytics Cookies**
Help us understand how visitors use our website by collecting and reporting information anonymously.

**Security Cookies**
Help us detect and prevent security risks and protect our users and website.`,
  },
  {
    title: 'Third-Party Cookies',
    content: `Some cookies on our site are set by third-party services that appear on our pages, such as:

- **Google Maps** — for displaying our location.
- **Social Media Platforms** — for enabling social sharing and embedded content.
- **Analytics Providers** — for helping us understand website usage.

These third parties have their own privacy and cookie policies, which we encourage you to review.`,
  },
  {
    title: 'Managing Your Cookie Preferences',
    content: `You can control and manage cookies in several ways:

- **Browser Settings:** Most web browsers allow you to block or delete cookies through their settings. Refer to your browser's help documentation for instructions.
- **Opt-Out Links:** You can opt out of certain third-party cookies through their respective opt-out mechanisms.
- **Consequences:** Please note that disabling essential cookies may affect the functionality of our website and some features may not work as intended.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Cookie Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will update the "Last Updated" date at the bottom of this page. We encourage you to review this policy periodically.`,
  },
  {
    title: 'Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Cookie Policy, please contact us:

**Bodija Health Hub**
Email: privacy@bodijahealthhub.com
Phone: +234 800 000 0000
Address: Bodija, Ibadan, Oyo State, Nigeria`,
  },
]

export default function CookiePolicy() {
  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-primary/90 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium mb-6">
              Legal
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6">
              Cookie Policy
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              This policy explains how Bodija Health Hub uses cookies and similar technologies to improve your experience on our website.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Effective Date: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {sections.map(({ title, content }) => (
              <div key={title}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
                <div className="text-gray-600 leading-relaxed space-y-3 whitespace-pre-line">
                  {content.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('- ')) {
                      const items = paragraph.split('\n').filter(Boolean)
                      return (
                        <ul key={i} className="list-disc list-inside space-y-1 ml-4">
                          {items.map((item, j) => (
                            <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>') }} />
                          ))}
                        </ul>
                      )
                    }
                    return (
                      <p key={i} dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>') }} />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Last Updated */}
      <section className="py-12 bg-warm-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <p className="text-gray-500 mb-4">
              This Cookie Policy was last updated on <strong className="text-gray-800">January 1, 2025</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              If you have any questions about this policy, please contact us.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
