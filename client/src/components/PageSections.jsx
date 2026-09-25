import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScrollReveal from './ScrollReveal';

/**
 * Renders CMS sections from /api/page-content/:pageId.
 * Public pages mount this so the admin Page Content editor is fully connected.
 */
export default function PageSections({ pageId }) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    if (!pageId) return undefined;
    let active = true;
    fetch(`/api/page-content/${pageId}`)
      .then((res) => (res.ok ? res.json() : { sections: [] }))
      .then((data) => {
        if (active) setSections(Array.isArray(data.sections) ? data.sections : []);
      })
      .catch(() => {
        if (active) setSections([]);
      });
    return () => {
      active = false;
    };
  }, [pageId]);

  if (!sections.length) return null;

  return (
    <>
      {sections.map((section, i) => (
        <section
          key={`${pageId}-section-${i}`}
          className={`py-16 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
        >
          <ScrollReveal>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              {section.image && (
                <img
                  src={section.image}
                  alt=""
                  className="w-full h-48 sm:h-64 object-cover rounded-2xl mb-6"
                />
              )}
              {section.title && (
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
              )}
              {section.content && (
                <div className="prose prose-lg max-w-none text-gray-600 whitespace-pre-wrap">
                  {section.content}
                </div>
              )}
              {section.buttonText && section.buttonLink && (
                <Link
                  to={section.buttonLink}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-colors"
                >
                  {section.buttonText}
                </Link>
              )}
            </div>
          </ScrollReveal>
        </section>
      ))}
    </>
  );
}
