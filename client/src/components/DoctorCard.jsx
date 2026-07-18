import { Link } from 'react-router-dom'

export default function DoctorCard({ doctor }) {
  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-secondary/10 overflow-hidden">
        {doctor.photo ? (
          <img
            src={doctor.photo}
            alt={doctor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {doctor.name?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{doctor.name}</h3>
        <p className="text-sm text-primary font-medium mb-2">{doctor.specialization}</p>
        {doctor.experience && (
          <p className="text-xs text-gray-500 mb-4">{doctor.experience} years experience</p>
        )}
        <Link
          to={`/doctors/${doctor._id}`}
          className="inline-flex items-center px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary hover:text-white transition-colors"
        >
          View Profile
        </Link>
        <Link
          to={`/appointments?doctor=${doctor._id}`}
          className="inline-flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors ml-2"
        >
          Book Now
        </Link>
      </div>
    </div>
  )
}
