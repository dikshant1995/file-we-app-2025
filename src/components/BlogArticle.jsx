import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blogData';
import './Blog.css';

const BlogArticle = () => {
    const { slug } = useParams();
    const navigate = useNavigate();

    // Check both sources for the post
    const [post, setPost] = React.useState(null);

    useEffect(() => {
        const staticPost = blogPosts.find(p => p.slug === slug);
        if (staticPost) {
            setPost(staticPost);
        } else {
            const localBlogs = JSON.parse(localStorage.getItem('laxmi_blogs') || '[]');
            const dynamicPost = localBlogs.find(p => p.slug === slug);
            if (dynamicPost) {
                setPost(dynamicPost);
            } else {
                navigate('/blog');
            }
        }
        window.scrollTo(0, 0);
    }, [slug, navigate]);

    if (!post) return null;

    return (
        <div className="blog-article-page">
            <div className="article-container">
                <Link to="/blog" className="back-to-blog">← Back to Insights</Link>

                <header className="article-header">
                    <div className="article-meta">
                        <span>{post.date} • By {post.author}</span>
                    </div>
                    <h1 className="article-title gradient-text-ai">{post.title}</h1>
                </header>

                <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="article-footer glass-panel">
                    <h3>Ready to check your eligibility?</h3>
                    <p>Our AI analyzes 12+ banks to find your best matches instantly.</p>
                    <Link to="/" className="cta-btn">Check Eligibility Now</Link>
                </div>
            </div>
        </div>
    );
};

export default BlogArticle;
