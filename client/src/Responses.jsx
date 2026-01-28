import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://authentication-page-backend.vercel.app";

export default function Responses() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get Form Info passed from Dashboard
    const { _id, name, items } = location.state || {};
    
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!_id) return;
        fetchResponses();
    }, [_id]);

    const fetchResponses = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/submissions/form/${_id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSubmissions(data);
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!location.state) return <div style={{padding:'20px'}}>No form loaded.</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Responses: {name}</h1>
                    <p style={{ color: '#666' }}>Total Submissions: {submissions.length}</p>
                </div>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back to Dashboard</button>
            </div>

            {/* DATA TABLE */}
            {loading ? <p>Loading data...</p> : (
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Employee</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Email</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Date</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => (
                                <tr key={sub._id} style={{ borderBottom: '1px solid #eee' }}>
                                    {/* Safely handle missing user details */}
                                    <td style={{ padding: '15px' }}>{sub.userId?.name || "Unknown User"}</td>
                                    <td style={{ padding: '15px' }}>{sub.userId?.email || "No Email"}</td>
                                    <td style={{ padding: '15px' }}>{new Date(sub.submittedAt).toLocaleString()}</td>
                                    <td style={{ padding: '15px' }}>
                                        <button 
                                            onClick={() => setSelectedSubmission(sub)}
                                            style={{ padding: '6px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                        >
                                            View Answers
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No responses yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* === DETAIL MODAL (Pop-up) === */}
            {selectedSubmission && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h2 style={{ margin: 0 }}>Submission Details</h2>
                            <button onClick={() => setSelectedSubmission(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                        </div>
                        
                        <p><strong>By:</strong> {selectedSubmission.userId?.name || "Unknown"}</p>
                        <p><strong>Date:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

                        {/* RENDER ANSWERS LOOP */}
                        {items.map(q => {
                            if (q.type === 'section') return <h4 key={q.id} style={{ color: '#666', borderBottom: '1px solid #ddd' }}>{q.label}</h4>;
                            
                            // --- THE FIX IS HERE ---
                            // We use (selectedSubmission.data || {}) so it never reads from undefined
                            const answerData = selectedSubmission.data || {};
                            const answer = answerData[q.id];
                            
                            return (
                                <div key={q.id} style={{ marginBottom: '15px' }}>
                                    <strong style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>{q.label}</strong>
                                    <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                                        {Array.isArray(answer) ? answer.join(", ") : (answer || <span style={{color:'#999', fontStyle:'italic'}}>No answer provided</span>)}
                                    </div>
                                </div>
                            );
                        })}

                        <button onClick={() => setSelectedSubmission(null)} style={{ marginTop: '20px', width: '100%', padding: '10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}