import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'Information We Collect',
    content: `As a healthcare ecosystem, we collect information necessary to provide you with coordinated, quality care. This includes:

**Personal Information:** Name, date of birth, contact details (phone, email, address), and government-issued identification where required for medical records.

**Health Information:** Medical history, diagnoses, treatment records, prescriptions, lab results, and hearing assessment data — collected through our partner clinics, hEar Max Centre, and digital platforms such as LiveCare and hEar Menders.

**Digital Platform Data:** When you use LiveCare or hEar Menders, we may collect usage data, device information, wellness check-in responses, and emergency contact details to ensure continuous care.

**Financial Information:** Insurance details and billing information necessary for processing payments and claims.

**Communications:** Messages sent through our contact forms, emails, and in-app communications with care providers.`,
  },
  {
    title: 'How We Use Your Information',
    content: `We use your information to:

- **Provide Care:** Deliver coordinated healthcare across our ecosystem of clinics, specialists, diagnostics, and digital platforms.
- **Coordinate Services:** Ensure seamless communication between your primary care provider, specialists, therapists, and digital health tools.
- **Improve Quality:** Analyze anonymized data to improve our services, protocols, and patient outcomes.
- **Communicate With You:** Send appointment reminders, health alerts, platform updates, and responses to your inquiries.
- **Process Payments:** Handle billing, insurance claims, and financial transactions accurately.
- **Comply With Legal Obligations:** Meet regulatory requirements under Nigerian healthcare laws and international best practices.`,
  },
  {
    title: 'Data Sharing',
    content: `Your health information is treated with the highest level of confidentiality. We may share your data only in the following circumstances:

**Within the BHH Ecosystem:** Your information may be shared between BHH partner clinics, specialists, and digital platforms (LiveCare, hEar Menders) solely for the purpose of providing you with coordinated care.

**With Your Consent:** We will share information with third parties only when you have provided explicit written consent.

**Legal Requirements:** We may disclose information when required by law, court order, or regulatory authority.

**Service Providers:** Trusted technology and infrastructure partners who support our digital platforms are bound by strict confidentiality and data protection agreements.

We do **not** sell, rent, or share your personal or health information with third parties for marketing purposes.`,
  },
  {
    title: 'Data Security',
    content: `Bodija Health Hub implements robust technical and organizational measures to protect your information, including:

- **Encryption:** All data transmitted between our platforms and devices is encrypted using industry-standard TLS protocols.
- **Access Controls:** Only authorized healthcare personnel and staff with a legitimate need can access patient records.
- **Secure Storage:** Electronic health records are stored in secure, access-controlled systems with regular backups.
- **Staff Training:** All personnel receive regular training on data protection, confidentiality, and healthcare privacy standards.
- **Audit Trails:** Access to patient records is logged and auditable to ensure accountability.

While we take every reasonable precaution to protect your data, no method of transmission or storage is completely secure. We continuously update our security practices to address emerging threats.`,
  },
  {
    title: 'Your Rights',
    content: `You have the following rights regarding your personal and health information:

- **Access:** Request a copy of the personal and health information we hold about you.
- **Correction:** Request correction of any inaccurate or incomplete information.
- **Restriction:** Request restrictions on how we use or share your information for treatment, payment, or operations.
- **Portability:** Request a copy of your health records in a commonly used electronic format.
- **Withdrawal of Consent:** Withdraw previously given consent for data sharing, subject to legal and contractual obligations.
- **Deletion:** Request deletion of your personal data, where legally permissible.

To exercise any of these rights, please contact our Data Protection Officer at the details provided in the Contact Us section below.`,
  },
  {
    title: 'Cookies & Tracking',
    content: `Our website and digital platforms use cookies and similar technologies to:

- Ensure the website functions correctly and securely.
- Remember your preferences and settings.
- Analyze website usage to improve user experience.
- Support our digital health platforms (LiveCare, hEar Menders) where applicable.

**Types of Cookies Used:**

- **Essential Cookies:** Required for basic website functionality. These cannot be disabled.
- **Analytics Cookies:** Help us understand how visitors interact with our website.
- **Preference Cookies:** Remember your settings and choices.

You can manage cookie preferences through your browser settings. Disabling essential cookies may affect website functionality.`,
  },
  {
    title: 'Children\'s Privacy',
    content: `Bodija Health Hub provides services to patients of all ages, including children. For patients under the age of 18, a parent or legal guardian must provide consent for the collection and use of personal and health information. We apply the same rigorous data protection standards to children's records as we do to adult records.

If we become aware that we have collected information from a child without parental consent, we will take steps to delete that information promptly.`,
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:

- Update the "Last Updated" date at the bottom of this page.
- Notify registered users via email or platform notification where appropriate.
- Post the revised policy on our website.

We encourage you to review this policy periodically to stay informed about how we protect your information.`,
  },
  {
    title: 'Contact Us',
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

**Bodija Health Hub**
Email: privacy@bodijahealthhub.com
Phone: +234 800 000 0000
Address: Bodija, Ibadan, Oyo State, Nigeria

**Data Protection Officer**
Email: dpo@bodijahealthhub.com

We are committed to resolving any privacy-related concerns promptly and in accordance with applicable law.`,
  },
]

export default function Privacy() {
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
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Your privacy and the confidentiality of your health information are of utmost importance to us. This policy explains how we collect, use, protect, and share your data.
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
              This Privacy Policy was last updated on <strong className="text-gray-800">January 1, 2025</strong>.
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
