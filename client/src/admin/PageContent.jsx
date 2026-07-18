import { useState, useEffect } from 'react';
import ContentEditor from './ContentEditor';
import ImageUpload from './ImageUpload';
import Modal from './Modal';

const PAGES = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'services', label: 'Services' },
  { id: 'platforms', label: 'Platforms' },
  { id: 'contact', label: 'Contact' },
  { id: 'blog', label: 'Blog' },
  { id: 'careers', label: 'Careers' },
  { id: 'faq', label: 'FAQ' },
];

const PageContent = () => {
  const [selectedPage, setSelectedPage] = useState('home');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [sectionModal, setSectionModal] = useState({ open: false, index: null, mode: 'add' });

  const [pageData, setPageData] = useState({
    title: '',
    metaTitle: '',
    metaDescription: '',
    sections: [],
  });

  const [editingSection, setEditingSection] = useState({
    title: '',
    content: '',
    image: '',
    buttonText: '',
    buttonLink: '',
  });

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`/api/admin/page-content/${selectedPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPageData((prev) => ({ ...prev, ...data }));
        } else {
          setPageData({
            title: PAGES.find((p) => p.id === selectedPage)?.label || '',
            metaTitle: '',
            metaDescription: '',
            sections: [],
          });
        }
      } catch {
        setPageData({
          title: PAGES.find((p) => p.id === selectedPage)?.label || '',
          metaTitle: '',
          metaDescription: '',
          sections: [],
        });
      }
      setLoading(false);
    };
    fetchPage();
  }, [selectedPage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`/api/admin/page-content/${selectedPage}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pageData),
      });
      if (res.ok) {
        setToast({ type: 'success', message: 'Page content saved successfully' });
      } else {
        setToast({ type: 'error', message: 'Failed to save page content' });
      }
    } catch {
      setToast({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const openAddSection = () => {
    setEditingSection({ title: '', content: '', image: '', buttonText: '', buttonLink: '' });
    setSectionModal({ open: true, index: null, mode: 'add' });
  };

  const openEditSection = (index) => {
    setEditingSection({ ...pageData.sections[index] });
    setSectionModal({ open: true, index, mode: 'edit' });
  };

  const saveSection = () => {
    const sections = [...pageData.sections];
    if (sectionModal.mode === 'add') {
      sections.push(editingSection);
    } else {
      sections[sectionModal.index] = editingSection;
    }
    setPageData((prev) => ({ ...prev, sections }));
    setSectionModal({ open: false, index: null, mode: 'add' });
  };

  const removeSection = (index) => {
    setPageData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const moveSection = (index, direction) => {
    const sections = [...pageData.sections];
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= sections.length) return;
    [sections[index], sections[swapIndex]] = [sections[swapIndex], sections[index]];
    setPageData((prev) => ({ ...prev, sections }));
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Page Content</h1>
          <p className="text-gray-500 mt-1">Edit individual page content and sections</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
          >
            {PAGES.map((page) => (
              <option key={page.id} value={page.id}>{page.label}</option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Page Meta */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Page Settings</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
              <input
                type="text"
                value={pageData.title}
                onChange={(e) => setPageData((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title (SEO)</label>
              <input
                type="text"
                value={pageData.metaTitle}
                onChange={(e) => setPageData((prev) => ({ ...prev, metaTitle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Title for search engines"
              />
              <p className="text-xs text-gray-400 mt-1">{pageData.metaTitle.length}/60 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
              <textarea
                value={pageData.metaDescription}
                onChange={(e) => setPageData((prev) => ({ ...prev, metaDescription: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Description for search engines"
              />
              <p className="text-xs text-gray-400 mt-1">{pageData.metaDescription.length}/160 characters</p>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Page Sections</h2>
              <button
                onClick={openAddSection}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Section
              </button>
            </div>

            {pageData.sections.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>No sections yet. Add your first section to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pageData.sections.map((section, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveSection(i, -1)}
                        disabled={i === 0}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveSection(i, 1)}
                        disabled={i === pageData.sections.length - 1}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <span className="text-xs text-gray-400 w-5 text-center font-mono">{i + 1}</span>
                    {section.image && (
                      <img src={section.image} alt="" className="w-12 h-12 object-cover rounded-lg" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{section.title || 'Untitled Section'}</p>
                      <p className="text-sm text-gray-500 truncate">{section.content?.slice(0, 80) || 'No content'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditSection(i)}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => removeSection(i)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section Edit Modal */}
      <Modal
        isOpen={sectionModal.open}
        onClose={() => setSectionModal({ open: false, index: null, mode: 'add' })}
        title={sectionModal.mode === 'add' ? 'Add Section' : 'Edit Section'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
            <input
              type="text"
              value={editingSection.title}
              onChange={(e) => setEditingSection((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Section heading"
            />
          </div>
          <ContentEditor
            label="Content"
            value={editingSection.content}
            onChange={(v) => setEditingSection((prev) => ({ ...prev, content: v }))}
            rows={6}
          />
          <ImageUpload
            currentImage={editingSection.image}
            onUpload={(file) => {
              const reader = new FileReader();
              reader.onloadend = () => setEditingSection((prev) => ({ ...prev, image: reader.result }));
              reader.readAsDataURL(file);
            }}
            onRemove={() => setEditingSection((prev) => ({ ...prev, image: '' }))}
            label="Section Image (optional)"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Text</label>
              <input
                type="text"
                value={editingSection.buttonText}
                onChange={(e) => setEditingSection((prev) => ({ ...prev, buttonText: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="e.g. Learn More"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Button Link</label>
              <input
                type="text"
                value={editingSection.buttonLink}
                onChange={(e) => setEditingSection((prev) => ({ ...prev, buttonLink: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                placeholder="e.g. /services"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setSectionModal({ open: false, index: null, mode: 'add' })}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={saveSection}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              {sectionModal.mode === 'add' ? 'Add Section' : 'Save Changes'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PageContent;
