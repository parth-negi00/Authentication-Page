import React, { useState, useEffect, useCallback } from 'react'; // <--- 1. Import useCallback
import { useLocation, useNavigate } from 'react-router-dom';
const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://authentication-page-backend.vercel.app";
export default function Responses() {
    const location = useLocation();
    const navigate = useNavigate();
    const { _id, name, items } = location.state || {};
    
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isAdmin = currentUser?.privilege === 'admin';

    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null); 
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({}); 

    // --- FIX: Wrap this function in useCallback ---
    const fetchResponses = useCallback(async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/submissions/form/${_id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setSubmissions(data);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    }, [_id]); // <--- Dependency for the function itself

    // --- FIX: Add fetchResponses to dependency array ---
    useEffect(() => {
        if (!_id) return;
        fetchResponses();
    }, [_id, fetchResponses]); 

    const handleOpenModal = (sub) => {
        setSelectedSubmission(sub);
        setEditData(sub.data || {}); 
        setIsEditing(false); 
    };

    const handleEditChange = (qId, value) => {
        setEditData(prev => ({ ...prev, [qId]: value }));
    };

    const handleSaveChanges = async () => {
        if (!window.confirm("Update this submission? This will archive the old version.")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/submissions/${selectedSubmission._id}`, {
                method: "PUT", 
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify({ data: editData })
            });

            if (res.ok) {
                alert("Submission Updated! Old version saved to history.");
                fetchResponses(); 
                setSelectedSubmission(null);
                setIsEditing(false);
            } else {
                alert("Failed to update.");
            }
        } catch (err) {
            console.error(err);
            alert("Server Error");
        }
    };

    if (!location.state) return <div style={{padding:'20px'}}>No form loaded.</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>{isAdmin ? `All Responses: ${name}` : `My History: ${name}`}</h1>
                    <p style={{ color: '#666' }}>Total Submissions: {submissions.length}</p>
                </div>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Back to Dashboard</button>
            </div>

            {loading ? <p>Loading data...</p> : (
                <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>{isAdmin ? "Employee Name" : "Submitted By"}</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Latest Update</th>
                                <th style={{ padding: '15px', borderBottom: '2px solid #ddd' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {submissions.map((sub) => (
                                <tr key={sub._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}>{sub.userId?.name || "You"}</td>
                                    <td style={{ padding: '15px' }}>{new Date(sub.submittedAt).toLocaleString()}</td>
                                    <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                                        <button 
                                            onClick={() => handleOpenModal(sub)}
                                            style={{ padding: '6px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                        >
                                            View Details
                                        </button>
                                        
                                        <button 
                                            onClick={() => navigate(`/history/${sub._id}`)}
                                            style={{ padding: '6px 12px', background: '#6610f2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                                            title="View Version History"
                                        >
                                            🕒 History {sub.history && sub.history.length > 0 ? `(${sub.history.length})` : ''}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedSubmission && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <h2 style={{ margin: 0 }}>Submission Details</h2>
                            <button onClick={() => setSelectedSubmission(null)} style={{ background: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                        </div>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <p style={{margin: '5px 0'}}><strong>Date:</strong> {new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                            </div>
                            
                            {isAdmin && (
                                !isEditing ? (
                                    <button 
                                        onClick={() => setIsEditing(true)} 
                                        style={{ padding: '8px 15px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ✏️ Edit
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => setIsEditing(false)} 
                                        style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                )
                            )}
                        </div>

                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

                        {items.map(q => {
                            if (q.type === 'section') return <h4 key={q.id} style={{ color: '#666', borderBottom: '1px solid #ddd' }}>{q.label}</h4>;
                            
                            const currentVal = editData[q.id] || "";

                            return (
                                <div key={q.id} style={{ marginBottom: '15px' }}>
                                    <strong style={{ display: 'block', fontSize: '14px', marginBottom: '5px' }}>{q.label}</strong>
                                    
                                    {isEditing ? (
                                        <input 
                                            type="text" 
                                            value={currentVal}
                                            onChange={(e) => handleEditChange(q.id, e.target.value)}
                                            style={{ width: '100%', padding: '8px', border: '1px solid #007bff', borderRadius: '4px', background: '#eef6ff' }}
                                        />
                                    ) : (
                                        <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '4px', fontSize: '14px' }}>
                                            {Array.isArray(currentVal) ? currentVal.join(", ") : (currentVal || <span style={{color:'#999', fontStyle:'italic'}}>No answer</span>)}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            {isEditing ? (
                                <button 
                                    onClick={handleSaveChanges} 
                                    style={{ flex: 1, padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Save as New Version
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setSelectedSubmission(null)} 
                                    style={{ flex: 1, padding: '12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}