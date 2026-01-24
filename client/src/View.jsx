import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const View = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { items, name, description } = location.state || { items: [], name: "Form", description: "" };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <div>
          <h2 style={{ margin: 0 }}>{name}</h2>
          <small style={{ color: '#666' }}>{description}</small>
        </div>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ background: '#333', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', height: 'fit-content' }}
        >
          Back to Dashboard
        </button>
      </div>

      {items.length === 0 ? <p>Empty Form</p> : items.map((item) => {
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
            
            {/* READ ONLY DISPLAY OF SAVED VALUES */}
            {(() => {
              const inputStyle = { width: '100%', padding: '10px', border: '1px solid #eee', borderRadius: '4px', boxSizing: 'border-box', fontSize: '14px', background: '#f9f9f9', color: '#333', cursor: 'default' };
              // We use item.value here!
              const savedValue = item.value || ""; 

              switch(item.type) {
                case 'paragraph': return <textarea disabled style={inputStyle} rows={3} value={savedValue} />;
                case 'select': return <select disabled style={inputStyle} value={savedValue}><option value="">None</option><option value="Option 1">Option 1</option><option value="Option 2">Option 2</option></select>;
                case 'checkbox': return <input disabled type="checkbox" checked={!!savedValue} style={{width:'20px', height:'20px'}} />;
                case 'date': return <input disabled type="date" style={inputStyle} value={savedValue} />;
                case 'file': return <input disabled type="text" style={inputStyle} value={savedValue} />; // Display filename as text
                default: return <input disabled type={item.type} style={inputStyle} value={savedValue} />;
              }
            })()}
          </div>
        );
      })}
    </div>
  );
};

export default View;