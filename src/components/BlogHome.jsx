import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { blogPosts } from '../data/blogData';
import './Blog.css';

const BlogHome = () => {
    return (
        <div className="blog-home-page">
            <Helmet>
                <title>Financial Insights & Loan Guides | LoanAI Blog</title>
                <meta name="description" content="Read our latest articles on personal loans, credit scores, and financial planning to help you make better borrowing decisions." />
            </Helmet>

            <div className="blog-hero">
                <h1 className="text-glow">Financial <span className="gradient-text-ai">Knowledge Hub</span></h1>
                <p>Expert insights to help you navigate the world of personal finance and loans.</p>
            </div>

            <div className="blog-grid">
                {blogPosts.map((post) => (
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
