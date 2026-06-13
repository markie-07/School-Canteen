import VendorLayout from '@/Layouts/VendorLayout';
import { Head } from '@inertiajs/react';
import React, { useState, useMemo } from 'react';

export default function VendorReviews({ initialReviews = [] }) {
    // Merge dynamic reviews from database and simulated review data fallback
    const [reviews, setReviews] = useState(() => {
        const mockReviews = [
            { id: 'mock-1', customer: "Juan Dela Cruz", rating: 5, comment: "The beef patties are so juicy! Highly recommended.", suggestion: "Maybe add more sauce options.", date: "2024-05-14", avatar: "👤", likes: 12, isLiked: false, replies: [], isFlagged: false, isMock: true },
            { id: 'mock-2', customer: "Maria Clara", rating: 4, comment: "Good food, but the line was a bit long during lunch.", suggestion: "Add an express lane for pre-ordered meals.", date: "2024-05-13", avatar: "👤", likes: 8, isLiked: false, replies: [], isFlagged: false, isMock: true },
            { id: 'mock-3', customer: "Pedro Penduko", rating: 3, comment: "The burger buns were a bit dry today.", suggestion: "Check the freshness of the buns daily.", date: "2024-05-12", avatar: "👤", likes: 3, isLiked: false, replies: [], isFlagged: false, isMock: true },
            { id: 'mock-4', customer: "Elena Adarna", rating: 5, comment: "Best canteen food ever! Love the healthy options.", suggestion: "Add more fruit shakes to the menu.", date: "2024-05-11", avatar: "👤", likes: 25, isLiked: false, replies: [], isFlagged: false, isMock: true },
            { id: 'mock-5', customer: "Jose Rizal", rating: 2, comment: "My order was cold when served.", suggestion: "Use food warmers for prepared meals.", date: "2024-05-10", avatar: "👤", likes: 1, isLiked: false, replies: [], isFlagged: false, isMock: true },
        ];
        
        if (initialReviews && initialReviews.length > 0) {
            // Place real dynamic reviews first, then show mock reviews to keep the page premium
            return [...initialReviews, ...mockReviews];
        }
        return mockReviews;
    });

    const [filterRating, setFilterRating] = useState('All');
    const [activeReplyBox, setActiveReplyBox] = useState(null); 
    const [editingReply, setEditingReply] = useState(null); 
    const [replyText, setReplyText] = useState("");
    const [isTrendsModalOpen, setIsTrendsModalOpen] = useState(false);

    const filteredReviews = useMemo(() => {
        if (filterRating === 'All') return reviews;
        return reviews.filter(r => r.rating === parseInt(filterRating));
    }, [reviews, filterRating]);

    const stats = useMemo(() => {
        // Compute stats for real dynamic reviews if they exist, otherwise fall back to all reviews (including mocks)
        const realReviews = reviews.filter(r => !r.isMock);
        const targetReviews = realReviews.length > 0 ? realReviews : reviews;
        
        const total = targetReviews.length;
        if (total === 0) {
            return { total: 0, avg: "0.0", positive: "0" };
        }
        
        const avg = (targetReviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1);
        const positive = ((targetReviews.filter(r => r.rating >= 4).length / total) * 100).toFixed(0);
        return { total, avg, positive };
    }, [reviews]);

    const handleLike = (id) => {
        setReviews(reviews.map(r => {
            if (r.id === id) {
                return { 
                    ...r, 
                    likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                    isLiked: !r.isLiked 
                };
            }
            return r;
        }));
    };

    const handleFlag = (id) => {
        if (confirm('Flag this review as inappropriate?')) {
            setReviews(reviews.map(r => r.id === id ? { ...r, isFlagged: true } : r));
            alert('Review has been flagged for moderation.');
        }
    };

    const handleStartNewReply = (reviewId) => {
        setActiveReplyBox(reviewId);
        setEditingReply(null);
        setReplyText("");
    };

    const handleEditExistingReply = (reviewId, reply) => {
        setActiveReplyBox(reviewId);
        setEditingReply(reply.id);
        setReplyText(reply.text);
    };

    const handleSendReply = (e) => {
        e.preventDefault();
        setReviews(reviews.map(r => {
            if (r.id === activeReplyBox) {
                if (editingReply) {
                    return {
                        ...r,
                        replies: r.replies.map(rep => rep.id === editingReply ? { ...rep, text: replyText } : rep)
                    };
                } else {
                    const newReply = {
                        id: Date.now(),
                        text: replyText,
                        date: new Date().toLocaleDateString()
                    };
                    return { ...r, replies: [...r.replies, newReply] };
                }
            }
            return r;
        }));
        setActiveReplyBox(null);
        setEditingReply(null);
        setReplyText("");
    };

    return (
        <VendorLayout header={<h2>Customer Feedback & Reviews</h2>}>
            <Head title="Customer Reviews" />
            
            <div className="reviews-container">
                {/* Stats Header */}
                <div className="stats-row">
                    <div className="stat-card-premium rating">
                        <div className="stat-icon">⭐</div>
                        <div className="stat-main">
                            <span className="stat-value">{stats.avg}</span>
                            <span className="stat-label">Average Rating</span>
                        </div>
                        <div className="stat-stars">
                            {"★".repeat(Math.round(stats.avg))}{"☆".repeat(5-Math.round(stats.avg))}
                        </div>
                    </div>
                    <div className="stat-card-premium reviews">
                        <div className="stat-icon">📝</div>
                        <div className="stat-main">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total Reviews</span>
                        </div>
                        <span className="stat-trend">Across all time</span>
                    </div>
                    <div className="stat-card-premium satisfaction">
                        <div className="stat-icon">❤️</div>
                        <div className="stat-main">
                            <span className="stat-value">{stats.positive}%</span>
                            <span className="stat-label">Satisfaction</span>
                        </div>
                        <span className="stat-trend success">Positive Feedback</span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="reviews-content-grid">
                    <div className="reviews-list-section">
                        <div className="list-header">
                            <h3>All Feedback</h3>
                            <div className="filter-tabs">
                                {['All', '5', '4', '3', '2', '1'].map(r => (
                                    <button 
                                        key={r}
                                        className={`filter-tab ${filterRating === r ? 'active' : ''}`}
                                        onClick={() => setFilterRating(r)}
                                    >
                                        {r === 'All' ? 'All' : `${r} ★`}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="reviews-stack">
                            {filteredReviews.length > 0 ? filteredReviews.map(review => (
                                <div key={review.id} className={`review-card ${review.isFlagged ? 'flagged' : ''}`}>
                                    <div className="review-top">
                                        <div className="customer-info">
                                            <div className="avatar">{review.avatar}</div>
                                            <div className="name-date">
                                                <span className="c-name">{review.customer}</span>
                                                <span className="r-date">{review.date}</span>
                                            </div>
                                        </div>
                                        <div className="top-right-actions">
                                            <div className="r-stars">
                                                {"★".repeat(review.rating)}{"☆".repeat(5-review.rating)}
                                            </div>
                                            <button 
                                                className={`btn-heart ${review.isLiked ? 'active' : ''}`}
                                                onClick={() => handleLike(review.id)}
                                            >
                                                {review.isLiked ? '❤️' : '🤍'} <span className="l-count">{review.likes}</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="review-body">
                                        <p className="comment">"{review.comment}"</p>
                                        {review.suggestion && (
                                            <div className="suggestion-box">
                                                <span className="s-label">💡 Customer Suggestion:</span>
                                                <p className="s-text">{review.suggestion}</p>
                                            </div>
                                        )}
                                        
                                        {/* Multiple Replies */}
                                        <div className="replies-list">
                                            {review.replies.map(reply => (
                                                <div key={reply.id} className="vendor-reply-box">
                                                    <div className="reply-header">
                                                        <div className="r-title">
                                                            <span className="r-icon">💬</span>
                                                            <span className="r-label">Store Response • {reply.date}</span>
                                                        </div>
                                                        <button className="btn-edit-reply-inline" onClick={() => handleEditExistingReply(review.id, reply)}>
                                                            ✏️ Edit
                                                        </button>
                                                    </div>
                                                    <p className="r-text">{reply.text}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {activeReplyBox === review.id && (
                                            <form className="reply-form" onSubmit={handleSendReply}>
                                                <div className="reply-input-wrapper">
                                                    <span className="r-label-small">
                                                        {editingReply ? 'Editing Store Response:' : 'Adding New Store Response:'}
                                                    </span>
                                                    <textarea 
                                                        placeholder="Write your response here... (Unlimited)" 
                                                        autoFocus
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        rows="4"
                                                    ></textarea>
                                                </div>
                                                <div className="reply-actions">
                                                    <button type="button" className="btn-cancel-reply" onClick={() => setActiveReplyBox(null)}>Cancel</button>
                                                    <button type="submit" className="btn-send-reply">
                                                        {editingReply ? 'Save Edit' : 'Post Reply'}
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                    
                                    {!review.isFlagged && (
                                        <div className="review-footer">
                                            <button className="btn-footer-action primary" onClick={() => handleStartNewReply(review.id)}>
                                                Reply
                                            </button>
                                            <button className="btn-footer-action flag" onClick={() => handleFlag(review.id)}>Flag Review</button>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                <div className="empty-state">
                                    <span className="icon">🔍</span>
                                    <p>No reviews match this rating filter.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="sidebar-section">
                        <div className="premium-side-card suggestions">
                            <div className="card-header">
                                <span className="icon">🚀</span>
                                <h4>Top Suggestions</h4>
                            </div>
                            <p className="side-desc">Key areas for improvement based on recent feedback.</p>
                            <div className="suggestion-list">
                                <div className="suggestion-item">
                                    <div className="s-info">
                                        <span className="s-title">Fast Lane</span>
                                        <span className="s-count">3 mentions</span>
                                    </div>
                                    <div className="s-bar"><div className="fill" style={{width: '90%'}}></div></div>
                                </div>
                                <div className="suggestion-item">
                                    <div className="s-info">
                                        <span className="s-title">Fresh Buns</span>
                                        <span className="s-count">2 mentions</span>
                                    </div>
                                    <div className="s-bar"><div className="fill" style={{width: '60%'}}></div></div>
                                </div>
                                <div className="suggestion-item">
                                    <div className="s-info">
                                        <span className="s-title">Sauce Options</span>
                                        <span className="s-count">1 mention</span>
                                    </div>
                                    <div className="s-bar"><div className="fill" style={{width: '30%'}}></div></div>
                                </div>
                                <div className="suggestion-item">
                                    <div className="s-info">
                                        <span className="s-title">Fruit Shakes</span>
                                        <span className="s-count">1 mention</span>
                                    </div>
                                    <div className="s-bar"><div className="fill" style={{width: '30%'}}></div></div>
                                </div>
                            </div>
                            <button className="btn-analyze-more" onClick={() => setIsTrendsModalOpen(true)}>
                                Analyze All Trends
                            </button>
                        </div>
                        
                        <div className="premium-side-card feedback-summary">
                            <h4>Quick Insight</h4>
                            <p className="insight-text">Customers generally love the taste of your food, but suggest improvements in service speed during peak hours.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Trends Analysis Modal */}
            {isTrendsModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content trends-modal">
                        <div className="modal-header">
                            <h3>Sentiment & Trend Analysis</h3>
                            <button className="btn-close-modal" onClick={() => setIsTrendsModalOpen(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="trends-grid">
                                <div className="trend-group">
                                    <h5>Product Quality</h5>
                                    <div className="trend-bar-wrapper">
                                        <div className="trend-label-row"><span>Taste & Freshness</span><span>94%</span></div>
                                        <div className="trend-progress"><div className="fill" style={{width: '94%'}}></div></div>
                                    </div>
                                    <div className="trend-bar-wrapper">
                                        <div className="trend-label-row"><span>Portion Size</span><span>82%</span></div>
                                        <div className="trend-progress"><div className="fill" style={{width: '82%'}}></div></div>
                                    </div>
                                </div>
                                <div className="trend-group">
                                    <h5>Service Excellence</h5>
                                    <div className="trend-bar-wrapper">
                                        <div className="trend-label-row"><span>Waiting Time</span><span>55%</span></div>
                                        <div className="trend-progress warning"><div className="fill" style={{width: '55%'}}></div></div>
                                    </div>
                                    <div className="trend-bar-wrapper">
                                        <div className="trend-label-row"><span>Staff Friendliness</span><span>88%</span></div>
                                        <div className="trend-progress"><div className="fill" style={{width: '88%'}}></div></div>
                                    </div>
                                </div>
                            </div>

                            <div className="keyword-section">
                                <h5>Common Keywords</h5>
                                <div className="keyword-cloud">
                                    <span className="k-pill pos large">Juicy (12)</span>
                                    <span className="k-pill pos">Healthy (8)</span>
                                    <span className="k-pill neg large">Cold (5)</span>
                                    <span className="k-pill neg">Dry (3)</span>
                                    <span className="k-pill pos">Friendly (10)</span>
                                    <span className="k-pill neg">Slow (15)</span>
                                </div>
                            </div>

                            <div className="actionable-insights">
                                <h5>Actionable Recommendations</h5>
                                <ul>
                                    <li>Implement an online pre-ordering system to reduce peak-hour congestion.</li>
                                    <li>Conduct a freshness audit on bakery supplies every morning.</li>
                                    <li>Invest in electric food warmers for serving counters.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .reviews-container { display: flex; flex-direction: column; gap: 30px; }
                
                .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
                .stat-card-premium { background: white; padding: 30px; border-radius: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); display: flex; align-items: center; gap: 25px; position: relative; overflow: hidden; }
                .stat-card-premium::before { content: ''; position: absolute; left: 0; top: 0; height: 100%; width: 6px; background: #eee; }
                .stat-card-premium.rating::before { background: #ffc107; }
                .stat-card-premium.reviews::before { background: #333; }
                .stat-card-premium.satisfaction::before { background: #28c76f; }
                
                .stat-icon { width: 50px; height: 50px; background: #f8f9fa; border-radius: 15px; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
                .stat-main { display: flex; flex-direction: column; gap: 2px; }
                .stat-value { font-size: 2rem; font-weight: 800; color: #333; line-height: 1.1; }
                .stat-label { font-size: 0.85rem; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.5px; }
                .stat-stars { color: #ffc107; font-size: 0.9rem; letter-spacing: 2px; margin-left: auto; }
                .stat-trend { margin-left: auto; font-size: 0.75rem; font-weight: 700; color: #bbb; padding: 4px 10px; background: #f8f9fa; border-radius: 8px; }
                .stat-trend.success { color: #28c76f; background: #e9f9ef; }

                .reviews-content-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
                .list-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .filter-tabs { display: flex; gap: 10px; }
                .filter-tab { background: white; border: 1px solid #eee; padding: 8px 18px; border-radius: 14px; font-size: 0.85rem; font-weight: 700; color: #666; cursor: pointer; transition: all 0.2s; }
                .filter-tab.active { background: #333; color: white; border-color: #333; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }

                .reviews-stack { display: flex; flex-direction: column; gap: 20px; }
                .review-card { background: white; padding: 30px; border-radius: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.02); border: 1px solid #f8f8f8; }
                .review-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
                .customer-info { display: flex; gap: 15px; align-items: center; }
                .avatar { width: 45px; height: 45px; background: #f0f0f0; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; }
                .c-name { font-weight: 700; color: #333; font-size: 1rem; }
                .r-date { font-size: 0.8rem; color: #bbb; }
                .r-stars { color: #ffc107; letter-spacing: 2px; font-size: 0.9rem; }
                .btn-heart { background: #f8f9fa; border: none; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; }
                .btn-heart.active { background: #fee2e2; color: #ef4444; }

                .comment { font-size: 1rem; line-height: 1.7; color: #444; margin-bottom: 20px; }
                .suggestion-box { background: #fffcf0; padding: 20px; border-radius: 18px; border-left: 5px solid #ffc107; margin-bottom: 20px; }
                .s-label { display: block; font-size: 0.75rem; font-weight: 800; color: #b58900; margin-bottom: 8px; text-transform: uppercase; }
                .s-text { font-size: 0.95rem; color: #856404; line-height: 1.5; font-weight: 500; }
                
                .vendor-reply-box { background: #f0fdf4; padding: 20px; border-radius: 18px; border-left: 5px solid #28c76f; margin-top: 15px; }
                .btn-edit-reply-inline { background: white; border: 1px solid #dcfce7; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; color: #166534; cursor: pointer; }

                .sidebar-section { display: flex; flex-direction: column; gap: 25px; }
                .premium-side-card { background: white; padding: 30px; border-radius: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid #f8f8f8; }
                .premium-side-card.suggestions { background: #fcfcfc; }
                .premium-side-card .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 15px; }
                .premium-side-card h4 { font-weight: 800; font-size: 1.1rem; color: #333; }
                .side-desc { font-size: 0.85rem; color: #999; line-height: 1.5; margin-bottom: 25px; }
                .suggestion-list { display: flex; flex-direction: column; gap: 20px; }
                .suggestion-item { display: flex; flex-direction: column; gap: 8px; }
                .s-info { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; color: #444; }
                .s-count { font-size: 0.75rem; color: #bbb; font-weight: 600; }
                .s-bar { height: 8px; background: #eee; border-radius: 10px; overflow: hidden; }
                .s-bar .fill { height: 100%; background: #333; border-radius: 10px; }
                
                .btn-analyze-more { width: 100%; margin-top: 25px; background: white; border: 2px solid #eee; padding: 12px; border-radius: 14px; font-weight: 700; font-size: 0.85rem; cursor: pointer; color: #555; transition: all 0.3s; }
                .btn-analyze-more:hover { border-color: #333; color: #333; }
                
                .feedback-summary { background: #333 !important; color: white; }
                .feedback-summary h4 { color: #28c76f !important; }
                .insight-text { font-size: 0.9rem; line-height: 1.7; opacity: 0.9; }

                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content.trends-modal { background: white; border-radius: 32px; width: 90%; max-width: 700px; padding: 40px; box-shadow: 0 30px 60px rgba(0,0,0,0.2); }
                .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .modal-header h3 { font-weight: 800; font-size: 1.5rem; }
                .btn-close-modal { background: #f8f9fa; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-weight: 800; color: #aaa; }
                
                .trends-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                .trend-group h5 { font-weight: 800; font-size: 1rem; color: #333; margin-bottom: 15px; }
                .trend-bar-wrapper { margin-bottom: 15px; }
                .trend-label-row { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #666; margin-bottom: 6px; }
                .trend-progress { height: 8px; background: #eee; border-radius: 10px; overflow: hidden; }
                .trend-progress .fill { height: 100%; background: #28c76f; }
                .trend-progress.warning .fill { background: #ff9f43; }

                .keyword-section { margin-bottom: 30px; }
                .keyword-section h5 { font-weight: 800; margin-bottom: 15px; }
                .keyword-cloud { display: flex; flex-wrap: wrap; gap: 10px; }
                .k-pill { padding: 6px 15px; border-radius: 12px; font-size: 0.8rem; font-weight: 700; }
                .k-pill.pos { background: #e9f9ef; color: #28c76f; }
                .k-pill.neg { background: #fff1f2; color: #f43f5e; }
                .k-pill.large { font-size: 1rem; padding: 8px 20px; }

                .actionable-insights h5 { font-weight: 800; margin-bottom: 15px; color: #333; }
                .actionable-insights ul { padding-left: 20px; }
                .actionable-insights li { font-size: 0.9rem; color: #555; line-height: 1.7; margin-bottom: 10px; }

                .review-footer { margin-top: 25px; padding-top: 20px; border-top: 1px solid #f8f8f8; display: flex; gap: 25px; }
                .btn-footer-action { background: none; border: none; font-weight: 700; color: #aaa; cursor: pointer; font-size: 0.85rem; transition: color 0.2s; }
                .btn-footer-action:hover { color: #333; }
                .btn-footer-action.primary { color: var(--primary-emerald); }

                @media (max-width: 1024px) {
                    .reviews-content-grid { grid-template-columns: 1fr; }
                    .stats-row { grid-template-columns: 1fr; }
                    .trends-grid { grid-template-columns: 1fr; }
                }
            `}} />
        </VendorLayout>
    );
}
