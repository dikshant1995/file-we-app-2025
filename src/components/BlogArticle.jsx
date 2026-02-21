import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from '../data/blogData';
import './Blog.css';

const BlogArticle = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const post = blogPosts.find(p => p.slug === slug);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!post) {
            navigate('/blog');
        }
    }, [post, navigate]);

    if (!post) return null;

    return (
        <div className="blog-article-page">
            <Helmet>
                <title>{post.seo.title}</title>
                <meta name="description" content={post.seo.description} />
            </Helmet>

            <div className="article-container">
                <Link to="/blog" className="back-to-blog">← Back to Insights</Link>

                <header className="article-header">
                    <div className="article-meta">
                        <span>{post.date}</span> • <span>By {post.author}</span>
                    </div>
                    <h1 className="article-title gradient-text-ai">{post.title}</h1>
                </header>

                <div
                    className="article-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="article-footer glass-panel">
                    <h3>Ready to check your eligibility?</h3>
                    <p>Use our AI-powered tool to see the best personal loan offers from 12+ banks instantly.</p>
                    <Link to="/" className="cta-btn">Check Eligibility Now</Link>
                </div>
            </div>
        </div>
    );
};

export default BlogArticle;
