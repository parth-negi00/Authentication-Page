import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://authentication-page-backend.vercel.app";

export default function History() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const token = localStorage.getItem("token");
            try {
                // We reuse the existing "Get Single Submission" logic or fetch from list
                // Since we didn't make a specific GET /:id route, let's make a quick helper on backend or just filter
                // Ideally, add this simple route to backend: router.get('/:id', ...)
                // For now, let's assume we can fetch it. 
                // NOTE: Make sure to add `router.get("/:id", ...)` to your backend if missing!
                const res = await fetch(`${BACKEND_URL}/api/submissions/${submissionId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) setSubmission(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [submissionId]);

    if (loading) return <div style={{padding:'20px'}}>Loading History...</div>;
    if (!submission) return <div style={{padding:'20px'}}>Record not found.</div>;

    // Combine current data and history into one timeline list
    const timeline = [
        ...submission.history, 
        { 
            versionLabel: "Current Version (Latest)", 
            editedAt: submission.submittedAt, // or last update time
            previousData: submission.data,
            isCurrent: true
        }
    ].reverse(); // Show newest first

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <button onClick={() => navigate(-1)} style={{ marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}>← Back to Responses</button>
            
            <h1>Edit History</h1>
            <p style={{ color: '#666' }}>
                <strong>Record ID:</strong> {submission._id}<br/>
                <strong>Original Entry by:</strong> {submission.userId?.name || "Nishi"}
            </p>

            <div style={{ marginTop: '30px', borderLeft: '4px solid #ddd', paddingLeft: '20px' }}>
                {timeline.map((entry, index) => (
                    <div key={index} style={{ marginBottom: '30px', position: 'relative' }}>
                        {/* Timeline Dot */}
                        <div style={{ position: 'absolute', left: '-29px', top: '0', width: '14px', height: '14px', borderRadius: '50%', background: entry.isCurrent ? '#28a745' : '#6c757d' }}></div>
                        
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #eee' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '10px' }}>
                                <strong style={{ color: entry.isCurrent ? '#28a745' : '#333' }}>
                                    {entry.isCurrent ? "Current Version" : entry.versionLabel || `Version ${timeline.length - index}`}
                                </strong>
                                <span style={{ fontSize: '12px', color: '#666' }}>
                                    {new Date(entry.editedAt).toLocaleString()}
                                </span>
                            </div>

                            {/* Render Data Fields */}
                            {Object.entries(entry.previousData || {}).map(([key, val]) => (
                                <div key={key} style={{ marginBottom: '5px', fontSize: '14px' }}>
                                    <span style={{ fontWeight: 'bold', color: '#555' }}>Question ID {key}:</span> 
                                    <span style={{ marginLeft: '10px' }}>{Array.isArray(val) ? val.join(", ") : val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}