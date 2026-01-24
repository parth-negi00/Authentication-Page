import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = "https://authentication-page-backend.vercel.app/";

export default function Dashboard() {
  const navigate = useNavigate();
  
  const [forms, setForms] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [showModal, setShowModal] = useState(false);
  const [newFormDetails, setNewFormDetails] = useState({ name: "", description: "" });

  // --- 1. FETCH FORMS ---
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BACKEND_URL}/api/forms`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setForms(data); 
        }
      } catch (err) {
        console.error("Server error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, []);

  // --- 2. DELETE FUNCTION ---
  const handleDelete = async (id) => {
    // 1. Confirm intention
    if (!window.confirm("Are you sure you want to delete this form? This cannot be undone.")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // 2. Call Backend
      const res = await fetch(`${BACKEND_URL}/api/forms/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        // 3. Update UI (Remove the deleted item from the list locally)
        setForms(forms.filter(form => form._id !== id));
        alert("Form deleted successfully.");
      } else {
        alert("Failed to delete form.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Server error.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateRedirect = (e) => {
    e.preventDefault();
    navigate("/builder", { state: { ...newFormDetails, isNew: true } });
  };

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Loading your forms...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ padding: '10px 20px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Enterprise Resource Portal</h3>
        <button onClick={handleLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Logout</button>
      </nav>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Forms</h2>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Create New Form
        </button>
      </div>

      {forms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', border: '2px dashed #ccc', color: '#888' }}>
          <h3>No forms found</h3>
          <p>Click "Create New Form" to get started.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>
              <th style={tableHeaderStyle}>Form Name</th>
              <th style={tableHeaderStyle}>Description</th>
              <th style={tableHeaderStyle}>Status</th>
              <th style={tableHeaderStyle}>Last Updated</th>
              <th style={tableHeaderStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {forms.map((form) => (
              <tr key={form._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tableCellStyle}>{form.name}</td>
                <td style={tableCellStyle}>{form.description}</td>
                <td style={tableCellStyle}>
                  <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', background: '#d4edda', color: '#155724' }}>
                    {form.status || 'Published'}
                  </span>
                </td>
                <td style={tableCellStyle}>
                  {new Date(form.lastUpdated).toLocaleDateString()}
                </td>
                <td style={tableCellStyle}>
                  {/* VIEW */}
                  <button onClick={() => navigate('/view', { state: form })} style={actionBtnStyle}>View</button>
                  
                  {/* EDIT */}
                  <button onClick={() => navigate('/builder', { state: { ...form, isNew: false } })} style={{ ...actionBtnStyle, background: '#ffc107' }}>Edit</button>

                  {/* DELETE - New Button */}
                  <button 
                    onClick={() => handleDelete(form._id)} 
                    style={{ ...actionBtnStyle, background: '#dc3545', marginRight: 0 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Form Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <h3>Create New Form</h3>
            <form onSubmit={handleCreateRedirect}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Form Name</label>
                <input required style={modalInputStyle} type="text" value={newFormDetails.name} onChange={(e) => setNewFormDetails({...newFormDetails, name: e.target.value})} placeholder="e.g. Employee Survey" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                <textarea required style={modalInputStyle} value={newFormDetails.description} onChange={(e) => setNewFormDetails({...newFormDetails, description: e.target.value})} placeholder="Describe the purpose..." />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 15px', background: '#ccc', border: 'none', borderRadius: '4px' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Continue to Builder</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const tableHeaderStyle = { padding: '12px', borderBottom: '1px solid #dee2e6' };
const tableCellStyle = { padding: '12px' };
const actionBtnStyle = { marginRight: '5px', padding: '5px 10px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modalCardStyle = { background: 'white', padding: '30px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' };
const modalInputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };