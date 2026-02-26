import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/blogData';
import './Blog.css';

const BlogHome = () => {
    const [allPosts, setAllPosts] = React.useState([]);

    React.useEffect(() => {
        try {
            const localBlogs = JSON.parse(localStorage.getItem('laxmi_blogs') || '[]');
            // Merge: Dynamic blogs first, then static ones
            setAllPosts([...(Array.isArray(localBlogs) ? localBlogs : []), ...blogPosts]);
        } catch (err) {
            console.error('Error parsing blogs:', err);
            setAllPosts([...blogPosts]);
        }
    }, []);

    return (
        <div className="blog-home-page">
            <div className="blog-nav-header">
                <Link to="/" className="back-to-home">← Back to Home</Link>
            </div>

            <div className="blog-hero">
                <h1 className="text-glow">Financial <span className="gradient-text-ai">Knowledge Hub</span></h1>
                <p>Expert insights to help you navigate the world of personal finance and loans.</p>
            </div>

            <div className="blog-grid">
                {allPosts.map((post) => (
                    <article key={post.id} className="blog-card glass-panel">
                        <div className="blog-card-content">
                            <div className="blog-date">{post.date}</div>
                            <h2 className="blog-title">{post.title}</h2>
                            <p className="blog-summary">{post.summary}</p>
                            <Link to={`/blog/${post.slug}`} className="read-more-btn">
                                Read Full Article <span className="arrow">→</span>
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};

export default BlogHome;
