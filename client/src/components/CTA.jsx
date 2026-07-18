import { Link } from 'react-router-dom'

export default function CTA({ title, subtitle, buttonText, buttonLink }) {
  return (
    <section className="py-20 bg-gradient-to-r from-primary to-secondary text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          {title || "Ready to Take the Next Step?"}
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
          {subtitle || "Schedule your appointment today and experience healthcare that puts you first."}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to={buttonLink || "/appointments"}
            className="inline-flex items-center px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg"
          >
            {buttonText || "Book Appointment"}
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-all border border-white/30"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  )
}
