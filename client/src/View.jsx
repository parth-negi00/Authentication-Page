import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://authentication-page-backend.vercel.app";

export default function View() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // 1. Get the Form Structure passed from Dashboard
    const { _id, name, description, items } = location.state || {};
    
    // State to hold the user's FETCHED answers
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!_id) return;
        fetchSubmission();
    }, [_id]);

    const fetchSubmission = async () => {
        const token = localStorage.getItem("token");
        try {
            // 2. Fetch ALL submissions for this user
            const res = await fetch(`${BACKEND_URL}/api/submissions/my-submissions`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // 3. Find the submission that matches THIS form
                // We grab the LATEST one (data[0] because usually sorted by date)
                const mySubmission = data.find(sub => sub.formId === _id);
                
                if (mySubmission) {
                    setAnswers(mySubmission.data);
                }
            }
        } catch (err) {
            console.error("Error fetching submission:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!location.state) return <div style={{padding:'20px'}}>No form loaded.</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
            {/* Header */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', borderTop: '8px solid #17a2b8', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>{name} <span style={{fontSize:'14px', color:'#666'}}>(Read Only)</span></h1>
                <p style={{ color: '#666', fontSize: '14px' }}>{description}</p>
                {loading && <p style={{color: '#007bff'}}>Checking for your submission...</p>}
                {!loading && Object.keys(answers).length === 0 && <p style={{color: '#dc3545'}}>You have not submitted this form yet.</p>}
            </div>

            {/* Questions Loop (Populated & Disabled) */}
            {items.map((q) => {
                // Handle Section Headers
                if (q.type === 'section') {
                    return (
                        <div key={q.id} style={{ marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #17a2b8', paddingBottom: '5px' }}>
                            <h2 style={{ fontSize: '24px', color: '#17a2b8', margin: 0 }}>{q.label}</h2>
                        </div>
                    );
                }

                // Get the saved answer for this question (if any)
                const userAnswer = answers[q.id] || "";

                return (
                    <div key={q.id} style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px', opacity: 0.8 }}>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '15px', fontWeight: 'bold', color: '#333' }}>
                            {q.label}
                        </label>

                        <div>
                            {(() => {
                                const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', background: '#f9f9f9', color: '#333' };
                                
                                switch(q.type) {
                                    case 'paragraph': 
                                        return <textarea 
                                            rows={4} 
                                            style={inputStyle} 
                                            value={userAnswer}
                                            disabled
                                        />;
                                    
                                    case 'select': 
                                        return (
                                            <input type="text" value={userAnswer} style={inputStyle} disabled />
                                        );
                                    
                                    case 'radio':
                                        return (
                                            <div>
                                                {q.options && q.options.map((opt, i) => (
                                                    <div key={i} style={{ marginBottom: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
                                                            <input 
                                                                type="radio" 
                                                                checked={userAnswer === opt}
                                                                disabled
                                                                style={{ marginRight: '10px' }}
                                                            />
                                                            {opt}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        );

                                    case 'checkbox':
                                        // Answer for checkbox is an array e.g. ["Option A", "Option B"]
                                        const checkedOptions = Array.isArray(userAnswer) ? userAnswer : [];
                                        return (
                                            <div>
                                                {q.options && q.options.map((opt, i) => (
                                                    <div key={i} style={{ marginBottom: '8px' }}>
                                                        <label style={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={checkedOptions.includes(opt)}
                                                                disabled
                                                                style={{ marginRight: '10px' }}
                                                            />
                                                            {opt}
                                                        </label>
                                                    </div>
                                                ))}
                                            </div>
                                        );

                                    default: // text, email, number
                                        return <input 
                                            type="text" 
                                            style={inputStyle} 
                                            value={userAnswer}
                                            disabled
                                        />;
                                }
                            })()}
                        </div>
                    </div>
                );
            })}

            <button 
                onClick={() => navigate('/dashboard')} 
                style={{ padding: '12px 30px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', marginTop: '20px' }}
            >
                Back to Dashboard
            </button>
        </div>
    );
}