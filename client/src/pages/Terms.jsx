import { Link } from 'react-router-dom'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing or using the Bodija Health Hub (BHH) website, digital platforms (including LiveCare and hEar Menders), and services, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website or services.

These terms apply to all visitors, users, patients, partners, and anyone who accesses or uses our services. We reserve the right to update these terms at any time, and continued use of our services constitutes acceptance of any changes.`,
  },
  {
    title: '2. Use of Website',
    content: `You agree to use our website and digital platforms only for lawful purposes and in accordance with these Terms. You agree not to:

- Use the website in any way that violates any applicable law or regulation.
- Attempt to gain unauthorized access to any part of the website, its systems, or networks.
- Use automated systems, bots, or scrapers to access or collect data from the website.
- Interfere with or disrupt the website or servers connected to it.
- Impersonate any person or entity, or misrepresent your affiliation with any person or entity.

We reserve the right to restrict or terminate your access to the website at our discretion, without notice, for any conduct that we believe violates these terms or is harmful to others.`,
  },
  {
    title: '3. User Accounts',
    content: `Certain features of our digital platforms may require you to create an account. When you create an account, you agree to:

- Provide accurate, current, and complete information during registration.
- Maintain and update your information to keep it accurate and complete.
- Maintain the security of your password and accept all risks of unauthorized access.
- Notify us immediately if you become aware of any unauthorized use of your account.

You are responsible for all activities that occur under your account. BHH is not liable for any loss or damage arising from unauthorized use of your credentials.`,
  },
  {
    title: '4. Appointments & Services',
    content: `Bodija Health Hub facilitates access to healthcare services through its network of partner clinics, specialists, and digital platforms. Please note:

- **Appointment Scheduling:** Booking an appointment through our website or platforms does not guarantee availability. Appointments are subject to provider availability and may be rescheduled.
- **Service Availability:** Specific services may vary by location and partner provider. BHH reserves the right to modify, suspend, or discontinue any service at any time.
- **Fees and Payment:** Fees for services are determined by the respective providers and may be subject to change. Payment terms will be communicated at the time of booking.
- **Insurance:** Coverage and acceptance of insurance plans vary by provider and service. Please confirm coverage with your provider before your appointment.`,
  },
  {
    title: '5. Healthcare Disclaimer',
    content: `**IMPORTANT: The content on our website and digital platforms is for informational and educational purposes only. It does not constitute medical advice, diagnosis, or treatment.**

The information provided through BHH's website, blog, health resources, and digital platforms should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.

If you think you may have a medical emergency, call your doctor or emergency services immediately. BHH does not recommend or endorse any specific tests, physicians, products, procedures, opinions, or other information that may be mentioned on our platforms.

Reliance on any information provided by BHH, its employees, or other users of our platforms is solely at your own risk.`,
  },
  {
    title: '6. Intellectual Property',
    content: `All content on the BHH website and digital platforms — including but not limited to text, graphics, logos, icons, images, audio clips, video clips, data compilations, software, and the overall design and arrangement — is the property of Bodija Health Hub or its licensors and is protected by Nigerian and international copyright, trademark, and intellectual property laws.

You may not:

- Reproduce, duplicate, copy, sell, resell, or exploit any content from our website without express written permission.
- Modify, adapt, or reverse-engineer any part of our website or platforms.
- Use our trademarks, logos, or branding without prior written consent.

You are granted a limited, non-exclusive, non-transferable license to access and use the website for personal, non-commercial purposes.`,
  },
  {
    title: '7. Limitation of Liability',
    content: `To the fullest extent permitted by law, Bodija Health Hub, its directors, employees, partners, agents, suppliers, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:

- Loss of profits, data, use, goodwill, or other intangible losses.
- Damages resulting from your access to or use of (or inability to access or use) the website or platforms.
- Any conduct or content of any third party on the platforms.
- Unauthorized access, use, or alteration of your transmissions or content.

BHH's total liability for any claim arising from or related to these terms or our services shall not exceed the amount you have paid to BHH in the twelve (12) months preceding the claim.

Our services are provided "as is" and "as available" without warranties of any kind, whether express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.`,
  },
  {
    title: '8. Indemnification',
    content: `You agree to defend, indemnify, and hold harmless Bodija Health Hub and its officers, directors, employees, agents, and affiliates from and against any claims, liabilities, damages, losses, and expenses, including reasonable legal fees, arising out of or in any way connected with:

- Your use of the website or digital platforms.
- Your violation of these Terms of Use.
- Your violation of any third-party right, including privacy, intellectual property, or other proprietary rights.
- Any content you submit, post, or transmit through the platforms.

This obligation shall survive the termination of these Terms and your use of the services.`,
  },
  {
    title: '9. Governing Law',
    content: `These Terms of Use shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria. Any disputes arising under or in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Ibadan, Oyo State, Nigeria.

If any provision of these terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that the remaining provisions shall remain in full force and effect.`,
  },
  {
    title: '10. Changes to Terms',
    content: `We reserve the right to modify or replace these Terms of Use at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.

By continuing to access or use our services after those revisions become effective, you agree to be bound by the revised terms.`,
  },
  {
    title: '11. Contact',
    content: `If you have any questions about these Terms of Use, please contact us:

**Bodija Health Hub**
Email: legal@bodijahealthhub.com
Phone: +234 800 000 0000
Address: Bodija, Ibadan, Oyo State, Nigeria`,
  },
]

export default function Terms() {
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
              Terms of Use
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Please read these terms carefully before using our website, digital platforms, or services. By accessing BHH, you agree to the terms outlined below.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Last Updated: January 1, 2025
            </p>
          </div>
        </div>
      </section>

      {/* Healthcare Disclaimer Banner */}
      <section className="py-8 bg-amber-50 border-b border-amber-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-600 font-bold text-lg">!</span>
            </div>
            <div>
              <h3 className="font-bold text-amber-800 mb-1">Healthcare Disclaimer</h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                The content on our website and digital platforms is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
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
              These Terms of Use were last updated on <strong className="text-gray-800">January 1, 2025</strong>.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              For questions about these terms, please reach out to us.
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
