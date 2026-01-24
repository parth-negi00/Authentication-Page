import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Simulated database of forms
  const [forms, setForms] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [newFormDetails, setNewFormDetails] = useState({ name: "", description: "" });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateRedirect = (e) => {
    e.preventDefault();
    // Route to builder and pass the name/description via state
    navigate("/builder", { state: { ...newFormDetails, isNew: true } });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ padding: '10px 20px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3>Enterprise Resource Portal</h3>
        <button onClick={handleLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px' }}>Logout</button>
      </nav>

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Forms</h2>
        <button 
          onClick={() => setShowModal(true)} 
          style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Create New Form
        </button>
      </div>

      {/* Forms Table */}
      {forms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', border: '2px dashed #ccc', color: '#888' }}>
          <h3>No form built earlier</h3>
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
              <tr key={form.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={tableCellStyle}>{form.name}</td>
                <td style={tableCellStyle}>{form.description}</td>
                <td style={tableCellStyle}>
                  <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '12px', background: form.status === 'Published' ? '#d4edda' : '#fff3cd' }}>
                    {form.status}
                  </span>
                </td>
                <td style={tableCellStyle}>{form.lastUpdated}</td>
                <td style={tableCellStyle}>
                  <button onClick={() => navigate('/preview', { state: { items: form.items } })} style={actionBtnStyle}>View</button>
                  <button onClick={() => navigate('/builder', { state: { ...form, isNew: false } })} style={{ ...actionBtnStyle, background: '#ffc107' }}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Create Form Modal (The Card) */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <h3>Create New Form</h3>
            <form onSubmit={handleCreateRedirect}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Form Name</label>
                <input 
                  required 
                  style={modalInputStyle} 
                  type="text" 
                  value={newFormDetails.name} 
                  onChange={(e) => setNewFormDetails({...newFormDetails, name: e.target.value})}
                  placeholder="e.g. Employee Survey"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
                <textarea 
                  required 
                  style={modalInputStyle} 
                  value={newFormDetails.description} 
                  onChange={(e) => setNewFormDetails({...newFormDetails, description: e.target.value})}
                  placeholder="Describe the purpose of this form..."
                />
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