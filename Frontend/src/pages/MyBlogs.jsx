import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { blogApi } from '../api';
import Navbar from '../components/Navbar';
import '../styles/MyBlogs.css';

const MyBlogs = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [myBlogs, setMyBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyBlogs();
  }, []);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const allBlogs = await blogApi.getAllBlogPosts();
      // Filter blogs by current user
      const userBlogs = allBlogs.filter(blog => 
        blog.userId === currentUser?.id || blog.userEmail === currentUser?.email
      );
      setMyBlogs(userBlogs);
    } catch (err) {
      console.error('Error fetching my blogs:', err);
      setError('Failed to load your blog posts.');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
  };

  const handleDeleteBlog = async (blogId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      try {
        await blogApi.deleteBlogPost(blogId);
        setMyBlogs(prevBlogs => prevBlogs.filter(blog => blog.id !== blogId));
        alert('Blog post deleted successfully!');
      } catch (err) {
        console.error('Error deleting blog:', err);
        alert('Failed to delete blog post. Please try again.');
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-dialog-overlay">
        <div className="auth-dialog">
          <h2>Authentication Required</h2>
          <p>You need to login first to view your blog posts.</p>
          <div className="auth-dialog-actions">
            <button onClick={() => navigate('/auth/login')} className="btn-primary">Login</button>
            <button onClick={() => navigate('/')} className="btn-outline">Go Back</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-blogs-container">
      <Navbar />
      
      <div className="content-container">
        <div className="page-header">
          <h1>My Blog Posts</h1>
          <button 
            onClick={() => navigate('/create-blog')} 
            className="btn-primary"
          >
            Write New Blog
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your blog posts...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={fetchMyBlogs} className="btn-primary">Try Again</button>
          </div>
        ) : myBlogs.length > 0 ? (
          <div className="blogs-grid">
            {myBlogs.map(blog => (
              <div key={blog.id} className="blog-card">
                {blog.imageUrl && (
                  <div className="blog-image-wrapper">
                    <img src={blog.imageUrl} alt={blog.title} className="blog-card-image" />
                  </div>
                )}
                <div className="blog-card-content">
                  <h3>{blog.title}</h3>
                  <p className="blog-date">
                    Published on {formatDateTime(blog.createdAt)}
                    {blog.updatedAt !== blog.createdAt && (
                      <span className="updated"> • Updated {formatDateTime(blog.updatedAt)}</span>
                    )}
                  </p>
                  <p className="blog-snippet">{blog.content.substring(0, 150)}...</p>
                  
                  {blog.tags && blog.tags.length > 0 && (
                    <div className="blog-tags">
                      {blog.tags.map((tag, idx) => (
                        <span key={idx} className="blog-tag">{tag}</span>
                      ))}
                    </div>
                  )}

                  <div className="blog-stats">
                    <span className="stat-item">
                      <span className="stat-icon">❤️</span>
                      <span className="stat-count">{blog.likeCount || 0}</span>
                    </span>
                    <span className="stat-item">
                      <span className="stat-icon">💬</span>
                      <span className="stat-count">{blog.commentCount || 0}</span>
                    </span>
                  
                  </div>

                  <div className="blog-actions">
                    <button 
                      onClick={() => navigate(`/blog/${blog.id}`)}
                      className="btn-outline"
                    >
                      View
                    </button>
                    <button 
                      onClick={() => navigate(`/blog/edit/${blog.id}`)}
                      className="btn-outline edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteBlog(blog.id, blog.title)}
                      className="btn-outline delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No Blog Posts Yet</h2>
            <p>You haven't written any blog posts yet. Share your travel experiences with the world!</p>
            <button 
              onClick={() => navigate('/create-blog')} 
              className="btn-primary"
            >
              Write Your First Blog
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;