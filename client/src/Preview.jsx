import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom'; // Added useParams

const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://authentication-page-backend.vercel.app";

export default function Preview() {
    const location = useLocation();
    const navigate = useNavigate();
    const { formId } = useParams(); // Get ID from URL (e.g. /fill/123)
    
    // 1. Initialize Data
    // If we came from Dashboard, use that data. Otherwise start null.
    const [formData, setFormData] = useState(location.state || null);
    
    // 2. Loading State
    // If we have data, we are NOT loading. If we don't, we ARE loading.
    const [loading, setLoading] = useState(!location.state);
    
    const [answers, setAnswers] = useState({});

    // --- EFFECT: Fetch Data if using a Direct Link ---
    useEffect(() => {
        // If we already have data (from Dashboard click), stop here.
        if (formData) return;

        // If we have an ID in the URL, go fetch the form!
        if (formId) {
            const fetchForm = async () => {
                const token = localStorage.getItem("token");
                try {
                    const res = await fetch(`${BACKEND_URL}/api/forms/${formId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    
                    if (res.ok) {
                        const data = await res.json();
                        setFormData(data);
                    } else {
                        alert("Form not found or access denied.");
                        navigate("/dashboard");
                    }
                } catch (err) {
                    console.error("Error loading form:", err);
                    alert("Network Error");
                } finally {
                    setLoading(false);
                }
            };
            fetchForm();
        } else {
            // No ID and no State? Then it really is an error.
            setLoading(false);
        }
    }, [formId, formData, navigate]);

    // Handle Input Changes
    const handleInputChange = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (id, option) => {
        const currentParams = answers[id] || [];
        if (currentParams.includes(option)) {
            setAnswers(prev => ({ ...prev, [id]: currentParams.filter(i => i !== option) }));
        } else {
            setAnswers(prev => ({ ...prev, [id]: [...currentParams, option] }));
        }
    };

    // --- SUBMISSION LOGIC ---
    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to submit.");
            navigate("/login");
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/submissions`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({
                    formId: formData._id,      
                    formName: formData.name,   
                    data: answers     
                })
            });

            if (res.ok) {
                alert("Application Submitted Successfully!");
                navigate("/dashboard");
            } else {
                const data = await res.json();
                alert(data.message || "Submission failed");
            }
        } catch (err) {
            console.error("Submission Error:", err);
            alert("Server Error");
        }
    };

    // --- RENDER STATES ---
    if (loading) return <div style={{padding:'40px', textAlign:'center'}}>Loading Form...</div>;
    
    if (!formData) return (
        <div style={{padding: '20px', textAlign: 'center'}}>
            <h3>No form loaded.</h3>
            <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
        </div>
    );

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'Arial, sans-serif' }}>
            {/* Form Header */}
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', borderTop: '8px solid #673ab7', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>{formData.name}</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>{formData.description}</p>
            </div>

            {/* Questions Loop */}
            {formData.items.map((q) => {
                if (q.type === 'section') {
                    return (
                        <div key={q.id} style={{ marginTop: '30px', marginBottom: '15px', borderBottom: '2px solid #673ab7', paddingBottom: '5px' }}>
                            <h2 style={{ fontSize: '24px', color: '#673ab7', margin: 0 }}>{q.label}</h2>
                        </div>
                    );
                }

                return (
                    <div key={q.id} style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px' }}>
                        <label style={{ display: 'block', fontSize: '16px', marginBottom: '15px', fontWeight: 'bold' }}>
                            {q.label}
                        </label>
                        <div>
                            {(() => {
                                const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
                                switch(q.type) {
                                    case 'paragraph': return <textarea rows={4} style={inputStyle} onChange={(e) => handleInputChange(q.id, e.target.value)} />;
                                    case 'select': return (
                                        <select style={inputStyle} onChange={(e) => handleInputChange(q.id, e.target.value)}>
                                            <option value="">Select an option</option>
                                            {q.options && q.options.map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                        </select>
                                    );
                                    case 'radio': return (
                                        <div>{q.options && q.options.map((opt, i) => (
                                            <div key={i} style={{ marginBottom: '8px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input type="radio" name={q.id} value={opt} onChange={(e) => handleInputChange(q.id, e.target.value)} style={{ marginRight: '10px' }} />{opt}
                                                </label>
                                            </div>
                                        ))}</div>
                                    );
                                    case 'checkbox': return (
                                        <div>{q.options && q.options.map((opt, i) => (
                                            <div key={i} style={{ marginBottom: '8px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center' }}>
                                                    <input type="checkbox" value={opt} onChange={() => handleCheckboxChange(q.id, opt)} style={{ marginRight: '10px' }} />{opt}
                                                </label>
                                            </div>
                                        ))}</div>
                                    );
                                    default: return <input type={q.type} style={inputStyle} onChange={(e) => handleInputChange(q.id, e.target.value)} />;
                                }
                            })()}
                        </div>
                    </div>
                );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', background: 'transparent', color: '#666', border: 'none', cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSubmit} style={{ padding: '12px 30px', background: '#673ab7', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>Submit Application</button>
            </div>
        </div>
    );
}