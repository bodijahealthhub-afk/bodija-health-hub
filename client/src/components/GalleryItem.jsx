import { useState } from 'react'

export default function GalleryItem({ item }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
        onClick={() => setOpen(true)}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.caption || item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <span className="text-4xl">📷</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-sm font-medium">{item.caption || item.title}</p>
          {item.category && <p className="text-xs text-white/70">{item.category}</p>}
        </div>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white/80 hover:text-white text-3xl font-light"
            onClick={() => setOpen(false)}
          >
            &times;
          </button>
          <div className="max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            {item.image ? (
              <img
                src={item.image}
                alt={item.caption || item.title}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <span className="text-6xl">📷</span>
              </div>
            )}
            {(item.caption || item.title) && (
              <p className="text-white text-center mt-4 text-sm">{item.caption || item.title}</p>
            )}
          </div>
        </div>
      )}
    </>
  )
}
