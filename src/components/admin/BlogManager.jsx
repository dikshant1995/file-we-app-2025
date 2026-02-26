import React, { useState, useEffect } from 'react';
import { FileText, Plus, Save, Trash2, Upload, Eye, X } from 'lucide-react';
import './BlogManager.css';

const BlogManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [showEditor, setShowEditor] = useState(false);
    const [currentBlog, setCurrentBlog] = useState({
        title: '',
        slug: '',
        summary: '',
        content: '',
        author: 'LoanAI Expert',
        image: null
    });

    // Load blogs on mount
    useEffect(() => {
        try {
            const localBlogs = JSON.parse(localStorage.getItem('laxmi_blogs') || '[]');
            setBlogs(Array.isArray(localBlogs) ? localBlogs : []);
        } catch (err) {
            console.error('Error parsing blogs:', err);
            setBlogs([]);
        }
    }, []);

    const handleSaveBlog = (e) => {
        e.preventDefault();

        if (!currentBlog.title || !currentBlog.content) {
            alert('Please fill in at least the title and content.');
            return;
        }

        const newBlog = {
            ...currentBlog,
            id: currentBlog.id || Date.now(),
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            slug: currentBlog.slug || currentBlog.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
        };

        const updatedBlogs = currentBlog.id
            ? blogs.map(b => b.id === currentBlog.id ? newBlog : b)
            : [newBlog, ...blogs];

        localStorage.setItem('laxmi_blogs', JSON.stringify(updatedBlogs));
        setBlogs(updatedBlogs);
        setShowEditor(false);
        resetForm();
    };

    const handleDeleteBlog = (id) => {
        if (window.confirm('Are you sure you want to delete this blog?')) {
            const updatedBlogs = blogs.filter(b => b.id !== id);
            localStorage.setItem('laxmi_blogs', JSON.stringify(updatedBlogs));
            setBlogs(updatedBlogs);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCurrentBlog({ ...currentBlog, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setCurrentBlog({
            title: '',
            slug: '',
            summary: '',
            content: '',
            author: 'LoanAI Expert',
            image: null
        });
    };

    const handleEdit = (blog) => {
        setCurrentBlog(blog);
        setShowEditor(true);
    };

    return (
        <div className="blog-manager-container">
            <div className="blog-header-box">
                <div>
                    <h2>Financial Hub Manager</h2>
                    <p>Write, update, and publish financial insights</p>
                </div>
                {!showEditor && (
                    <button className="btn-add-blog" onClick={() => setShowEditor(true)}>
                        <Plus size={18} />
                        New Insight
                    </button>
                )}
            </div>

            {showEditor ? (
                <div className="blog-editor glass-panel">
                    <div className="editor-header">
                        <h3>{currentBlog.id ? 'Edit Article' : 'Compose New Insight'}</h3>
                        <button className="btn-close-editor" onClick={() => { setShowEditor(false); resetForm(); }}>
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveBlog} className="editor-form">
                        <div className="form-row">
                            <div className="form-group flex-2">
                                <label>Article Title</label>
                                <input
                                    type="text"
                                    value={currentBlog.title}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                                    placeholder="e.g., 5 Ways to Lower Your Interest Rate"
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Slug (URL Path)</label>
                                <input
                                    type="text"
                                    value={currentBlog.slug}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, slug: e.target.value })}
                                    placeholder="auto-generated-if-empty"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Executive Summary (Appears on Card)</label>
                            <textarea
                                value={currentBlog.summary}
                                onChange={(e) => setCurrentBlog({ ...currentBlog, summary: e.target.value })}
                                placeholder="Briefly describe what this article is about..."
                                rows="2"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group flex-1">
                                <label>Author Display Name</label>
                                <input
                                    type="text"
                                    value={currentBlog.author}
                                    onChange={(e) => setCurrentBlog({ ...currentBlog, author: e.target.value })}
                                />
                            </div>
                            <div className="form-group flex-1">
                                <label>Featured Image</label>
                                <div className="image-upload-wrapper">
                                    <input
                                        type="file"
                                        id="blog-image"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <label htmlFor="blog-image" className="btn-upload-sim">
                                        <Upload size={16} />
                                        {currentBlog.image ? 'Change Image' : 'Select Hero Image'}
                                    </label>
                                    {currentBlog.image && <span className="upload-status">✓ Image ready</span>}
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Article Content (HTML Supported)</label>
                            <textarea
                                className="content-textarea"
                                value={currentBlog.content}
                                onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                                placeholder="Write your full article here. Use <h2> for headings and <p> for paragraphs..."
                                rows="12"
                            />
                        </div>

                        <div className="editor-actions">
                            <button type="button" className="btn-cancel" onClick={() => { setShowEditor(false); resetForm(); }}>
                                Discard
                            </button>
                            <button type="submit" className="btn-publish">
                                <Save size={18} />
                                {currentBlog.id ? 'Update Insight' : 'Publish to Hub'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="blog-list-wrapper glass-panel">
                    {blogs.length === 0 ? (
                        <div className="empty-blogs">
                            <FileText size={48} opacity={0.3} />
                            <p>No custom insights created yet.</p>
                            <button className="btn-text-link" onClick={() => setShowEditor(true)}>
                                Write your first post now
                            </button>
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Article</th>
                                    <th>Author & Date</th>
                                    <th>Slug</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {blogs.map(blog => (
                                    <tr key={blog.id}>
                                        <td>
                                            <div className="blog-title-cell">{blog.title}</div>
                                            <div className="blog-summary-cell">{blog.summary.substring(0, 60)}...</div>
                                        </td>
                                        <td>
                                            <div className="blog-meta-cell">{blog.author}</div>
                                            <div className="blog-date-cell">{blog.date}</div>
                                        </td>
                                        <td><code>/{blog.slug}</code></td>
                                        <td>
                                            <div className="action-row">
                                                <button className="action-btn-small" title="Edit" onClick={() => handleEdit(blog)}>
                                                    <Plus size={16} />
                                                </button>
                                                <button className="action-btn-small delete" title="Delete" onClick={() => handleDeleteBlog(blog.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default BlogManager;
