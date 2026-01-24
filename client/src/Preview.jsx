import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BACKEND_URL = "https://authentication-page-backend.vercel.app/";

const Preview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data passed from Builder or Dashboard
  const { id, items, name, description } = location.state || { id: null, items: [], name: "Form", description: "" };
  
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize formData if we are editing an existing form that already has values
  useEffect(() => {
    if (!items || items.length === 0) {
      alert("No form data found. Redirecting to dashboard.");
      navigate('/dashboard');
    } else {
        // Pre-fill answers if they exist in the saved items
        const initialData = {};
        items.forEach(item => {
            if (item.value) initialData[item.id] = item.value;
        });
        setFormData(initialData);
    }
  }, [items, navigate]);

  const handleChange = (itemId, value) => {
    setFormData(prev => ({ ...prev, [itemId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // --- MAGICAL STEP: MERGE ANSWERS INTO ITEMS ---
    // We take the structure (item) and add the answer (value) to it.
    const itemsWithAnswers = items.map(item => ({
        ...item,
        value: formData[item.id] || "" // <--- This saves what you typed!
    }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BACKEND_URL}/api/forms/submit`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          id: id, 
          formName: name, 
          description: description,
          items: itemsWithAnswers // <--- Send the merged data
        }),
      });

      if (response.ok) {
        alert("Form & Answers Saved Successfully!");
        navigate('/dashboard'); 
      } else {
        const errorData = await response.json();
        alert(`Submission failed: ${errorData.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <div>
            <h2 style={{ margin: 0 }}>{name} - Preview</h2>
            <small style={{ color: '#666' }}>{description}</small>
        </div>
        <button 
          onClick={() => navigate('/builder', { state: location.state })} 
          style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', height: 'fit-content' }}
        >
          ← Edit Structure
        </button>
      </div>

      {items.map((item) => {
        if (item.type === 'section') {
          return (
            <div key={item.id} style={{ marginTop: '30px', marginBottom: '15px', borderBottom: '1px solid #ddd' }}>
               <h3 style={{ color: '#333', margin: '0 0 5px 0' }}>{item.label}</h3>
            </div>
          );
        }

        return (
          <div key={item.id} style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
              {item.label}
            </label>
            
            {(() => {
              const inputStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px' };
              const val = formData[item.id] || ""; // Controlled input

              switch(item.type) {
                case 'paragraph': 
                    return <textarea style={inputStyle} rows={4} value={val} onChange={(e) => handleChange(item.id, e.target.value)} />;
                case 'select': 
                    return (
                        <select style={inputStyle} value={val} onChange={(e) => handleChange(item.id, e.target.value)}>
                            <option value="">Select...</option>
                            <option value="Option 1">Option 1</option>
                            <option value="Option 2">Option 2</option>
                        </select>
                    );
                case 'checkbox': 
                    return <input type="checkbox" checked={!!val} style={{width:'20px', height:'20px'}} onChange={(e) => handleChange(item.id, e.target.checked)} />;
                case 'date': 
                    return <input type="date" style={inputStyle} value={val} onChange={(e) => handleChange(item.id, e.target.value)} />;
                case 'file': 
                    // Files are tricky. For now, we just let them select it, but we can't easily "preview" the value of a file input for security reasons.
                    return <input type="file" style={inputStyle} onChange={(e) => handleChange(item.id, e.target.value)} />;
                default: 
                    return <input type={item.type} style={inputStyle} value={val} onChange={(e) => handleChange(item.id, e.target.value)} />;
              }
            })()}
          </div>
        );
      })}

      <button 
        onClick={handleSubmit} 
        disabled={isSubmitting}
        style={{ width: '100%', padding: '12px', backgroundColor: isSubmitting ? '#ccc' : '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '20px' }}
      >
        {isSubmitting ? "Saving..." : "Save Application Data"}
      </button>
    </div>
  );
};

export default Preview;