import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Retrieve the 'items' passed from the Builder
  const { items } = location.state || { items: [] };
  
  // 2. State to store user answers
  const [formData, setFormData] = useState({});

  // Redirect back if someone accesses /preview directly without data
  useEffect(() => {
    if (!items || items.length === 0) {
      alert("No form data found. Redirecting to builder.");
      navigate('/');
    }
  }, [items, navigate]);

  const handleChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    console.log("SUBMITTED DATA:", JSON.stringify(formData, null, 2));
    alert("Form Submitted Successfully! Check Console.");
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Live Form</h2>
        <button 
          onClick={() => navigate('/')} 
          style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}
        >
          ← Edit Form
        </button>
      </div>

      {/* Form Rendering Loop */}
      {items.map((item) => {
        // Render Section Headers
        if (item.type === 'section') {
          return (
            <div key={item.id} style={{ marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #ddd' }}>
               <h3 style={{ color: '#333', margin: '0 0 5px 0' }}>{item.label}</h3>
            </div>
          );
        }

        // Render Inputs
        return (
          <div key={item.id} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
              {item.label}
            </label>
            
            {(() => {
              switch(item.type) {
                case 'paragraph':
                  return <textarea style={inputStyle} rows={4} onChange={(e) => handleChange(item.id, e.target.value)} />;
                case 'select':
                   return (
                     <select style={inputStyle} onChange={(e) => handleChange(item.id, e.target.value)}>
                       <option value="">Select an option</option>
                       <option value="1">Option 1</option>
                       <option value="2">Option 2</option>
                     </select>
                   );
                case 'checkbox':
                  return <input type="checkbox" style={{width:'20px', height:'20px'}} onChange={(e) => handleChange(item.id, e.target.checked)} />;
                case 'date':
                   return <input type="date" style={inputStyle} onChange={(e) => handleChange(item.id, e.target.value)} />;
                case 'file':
                   return <input type="file" style={inputStyle} />;
                default:
                  // Text, Email, Number
                  return <input type={item.type} style={inputStyle} placeholder={`Enter ${item.label}...`} onChange={(e) => handleChange(item.id, e.target.value)} />;
              }
            })()}
          </div>
        );
      })}

      <button 
        onClick={handleSubmit} 
        style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' }}
      >
        Submit Application
      </button>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' };

export default Preview;