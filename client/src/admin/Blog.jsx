import { useState, useEffect } from 'react';
import DataTable from './DataTable';
import SearchBar from './SearchBar';
import BlogForm from './BlogForm';
import Modal from './Modal';
import StatusBadge from './StatusBadge';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch('/api/admin/blog', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts || []);
        }
      } catch {
        setPosts([
          { id: 1, title: '5 Tips for Better Heart Health', author: 'Dr. Adewale', category: 'Health Tips', status: 'published', date: '2026-07-10', views: 234 },
          { id: 2, title: 'Understanding Diabetes: A Complete Guide', author: 'Dr. Amina', category: 'Diseases', status: 'published', date: '2026-07-08', views: 189 },
          { id: 3, title: 'Childhood Vaccination Schedule 2026', author: 'Dr. Chukwuemeka', category: 'Pediatrics', status: 'draft', date: '2026-07-12', views: 0 },
          { id: 4, title: 'Mental Health Awareness in Nigeria', author: 'Dr. Olumide', category: 'Mental Health', status: 'published', date: '2026-07-05', views: 156 },
          { id: 5, title: 'Nutrition Tips for Pregnant Women', author: 'Dr. Amina', category: "Women's Health", status: 'draft', date: '2026-07-14', views: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      setFilteredPosts(
        posts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredPosts(posts);
    }
  }, [posts, searchQuery]);

  const handleSave = async (postData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingPost
        ? `/api/admin/blog/${editingPost.id}`
        : '/api/admin/blog';
      const method = editingPost ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
    } catch {
      // Update locally
    }
    if (editingPost) {
      setPosts((prev) =>
        prev.map((p) => (p.id === editingPost.id ? { ...p, ...postData } : p))
      );
    } else {
      setPosts((prev) => [
        { id: Date.now(), ...postData, views: 0, date: new Date().toISOString().split('T')[0] },
        ...prev,
      ]);
    }
    setShowForm(false);
    setEditingPost(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Update locally
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  const columns = [
    { key: 'title', label: 'Title', render: (val) => <span className="font-medium line-clamp-1">{val}</span> },
    { key: 'author', label: 'Author' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
    { key: 'date', label: 'Date' },
    { key: 'views', label: 'Views', render: (val) => val.toLocaleString() },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (_, row) => (
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); setEditingPost(row); setShowForm(true); }}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}
            className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 mt-1">Manage blog posts and articles</p>
        </div>
        <button
          onClick={() => { setEditingPost(null); setShowForm(true); }}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Post
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <SearchBar placeholder="Search posts..." onSearch={setSearchQuery} className="w-full md:w-96" />
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredPosts}
          pageSize={10}
        />
      )}

      <Modal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingPost(null); }}
        title={editingPost ? 'Edit Post' : 'Create New Post'}
        size="xl"
      >
        <BlogForm
          post={editingPost}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingPost(null); }}
        />
      </Modal>
    </div>
  );
};

export default Blog;
