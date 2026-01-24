import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DndContext,
  rectIntersection,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';

// --- Sidebar Item ---
const SidebarItem = ({ type, label }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: `sidebar-${type}`,
    data: { label, type, fromSidebar: true }
  });
  const isSection = type === 'section';
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ padding: '10px', border: isSection ? '2px dashed #333' : '1px solid gray', marginBottom: '5px', background: isSection ? '#f0f0f0' : 'white', fontWeight: isSection ? 'bold' : 'normal', cursor: 'grab' }}>
      {label}
    </div>
  );
};

// --- Drop Zone ---
const Canvas = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });
  return (
    <div ref={setNodeRef} style={{ flex: 1, minHeight: '400px', border: isOver ? '5px solid green' : '2px dashed black', backgroundColor: isOver ? '#e0ffe0' : '#f0f0f0', padding: '20px', transition: 'all 0.2s' }}>
      {children}
    </div>
  );
};

export default function FormBuilder() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get metadata passed from Dashboard (Card info or existing form info)
  // FIX: We specifically look for _id here
  const { _id, name, description, items: existingItems, isNew } = location.state || { 
    name: "New Form", 
    description: "", 
    items: [], 
    isNew: true 
  };

  const [items, setItems] = useState(isNew ? [] : existingItems);
  const [activeItem, setActiveItem] = useState(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
  );

  const handleDragStart = (e) => setActiveItem(e.active.data.current);

  const handleDragEnd = (e) => {
    const { active, over } = e;
    setActiveItem(null);
    if (over && over.id === 'canvas-drop-zone') {
      const type = active.data.current.type;
      setItems((prev) => [...prev, { 
        id: Date.now().toString(), 
        label: type === 'section' ? 'New Section Header' : active.data.current.label, 
        type: type 
      }]);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this field?")) {
      setItems((prevItems) => prevItems.filter(item => item.id !== id));
    }
  };

  const handleUpdateLabel = (id, newLabel) => {
    setItems((prev) => prev.map(item => item.id === id ? { ...item, label: newLabel } : item));
  };

  // --- UPDATED SAVE FUNCTION ---
  const handleSaveForm = () => {
    if (items.length === 0) return alert("Canvas is empty.");
    
    navigate('/preview', { 
      state: { 
        // FIX: Pass the ID if we are editing an old form. If New, pass null.
        id: isNew ? null : _id,
        items, 
        name, 
        description 
      } 
    }); 
  };

  const handleDiscard = () => {
    if (window.confirm("Discard changes and return to Dashboard?")) {
      navigate('/dashboard');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Builder Header */}
      <div style={{ padding: '15px 20px', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>{name}</h2>
            <small style={{ color: '#aaa' }}>{description}</small>
          </div>
          <div>
            <button onClick={handleSaveForm} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Publish Form</button>
            <button onClick={handleDiscard} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}>Discard</button>
          </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '20px', padding: '20px', flex: 1, backgroundColor: '#f4f6f8' }}>
          
          <div style={{ width: '200px' }}>
            <h3>Tools</h3>
            <div style={{marginBottom: '20px'}}><SidebarItem type="section" label="Add New Section"/></div>
            <p style={{fontSize:'12px', color:'#666', marginBottom: '10px'}}>Fields:</p>
            <SidebarItem type="text" label="Text Input"/>
            <SidebarItem type="number" label="Number Input"/>
            <SidebarItem type="email" label="Email Input" />
            <SidebarItem type="paragraph" label="Long Text"/>
            <SidebarItem type="date" label="Date Picker"/>
            <SidebarItem type="file" label="File Upload"/>
            <SidebarItem type="select" label="Dropdown" />
            <SidebarItem type="checkbox" label="Checkbox" />
          </div>

          <Canvas>
            {items.length === 0 ? <p style={{textAlign: 'center', color: '#888', marginTop: '50px'}}>Drag items here</p> : items.map(i => {
                const isSection = i.type === 'section';
                return (
                    <div key={i.id} style={{ padding: '15px', border: isSection ? 'none' : '1px solid #ccc', marginBottom: '10px', background: isSection ? '#333' : 'white', color: isSection ? 'white' : 'black', borderRadius: '5px', marginTop: isSection ? '20px' : '0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSection ? '0' : '12px' }}>
                            <input type="text" value={i.label} onChange={(e) => handleUpdateLabel(i.id, e.target.value)} style={{ fontWeight: 'bold', border: 'none', borderBottom: isSection ? '1px solid #777' : '1px dashed #ccc', outline: 'none', fontSize: isSection ? '18px' : '16px', width: '75%', color: isSection ? 'white' : '#333', background: 'transparent' }} />
                            <button onClick={() => handleDelete(i.id)} style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                        </div>
                        {!isSection && (
                            <div>
                                {(() => {
                                    const inputStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fafafa', cursor: 'not-allowed' };
                                    switch(i.type) {
                                        case 'paragraph': return <textarea disabled placeholder="User answer..." style={inputStyle} rows={3} />;
                                        case 'select': return <select disabled style={inputStyle}><option>Option 1</option><option>Option 2</option></select>;
                                        case 'checkbox': return <div style={{display:'flex', alignItems:'center', gap: '10px'}}><input disabled type="checkbox" style={{width: '20px', height: '20px'}} /> <label>Option</label></div>;
                                        case 'file': return <input disabled type="file" style={inputStyle} />;
                                        default: return <input disabled type={i.type} placeholder="User answer..." style={inputStyle} />;
                                    }
                                })()}
                            </div>
                        )}
                    </div>
                );
            })}
          </Canvas>
        </div>

        <DragOverlay>
          {activeItem ? <div style={{ padding: '10px', border: '2px solid blue', background: 'white', width: '150px', pointerEvents: 'none', borderRadius: '4px', opacity: 0.8 }}>{activeItem.label}</div> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}