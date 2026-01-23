import React, { useState } from 'react';
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

// --- 1. PREVIEW COMPONENT (The "Live" Form) ---
const FormPreview = ({ items, onEdit }) => {
  const [answers, setAnswers] = useState({});

  const handleChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    console.log("FINAL DATA:", JSON.stringify(answers, null, 2));
    alert("Form Submitted! Check Console.");
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Form Preview</h2>
        <button onClick={onEdit} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer' }}>
          ← Back to Editor
        </button>
      </div>

      {items.map((item) => {
        if (item.type === 'section') {
            return <h3 key={item.id} style={{ borderBottom:'1px solid #ccc', paddingBottom:'5px', marginTop:'20px' }}>{item.label}</h3>;
        }

        return (
            <div key={item.id} style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{item.label}</label>
                {(() => {
                    if (item.type === 'paragraph') return <textarea onChange={e => handleChange(item.id, e.target.value)} style={previewStyle} rows={3} />;
                    if (item.type === 'checkbox') return <input type="checkbox" onChange={e => handleChange(item.id, e.target.checked)} />;
                    return <input type={item.type} onChange={e => handleChange(item.id, e.target.value)} style={previewStyle} />;
                })()}
            </div>
        );
      })}

      <button onClick={handleSubmit} style={{ width: '100%', padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', marginTop: '20px', cursor: 'pointer', fontSize:'16px' }}>Submit Form</button>
    </div>
  );
};

// --- 2. BUILDER COMPONENTS ---
const SidebarItem = ({ type, label }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `sidebar-${type}`, data: { label, type, fromSidebar: true } });
  const isSection = type === 'section';
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={{ padding: '10px', border: isSection ? '2px dashed #333' : '1px solid gray', marginBottom: '5px', background: isSection ? '#f0f0f0' : 'white', fontWeight: isSection ? 'bold' : 'normal', cursor: 'grab' }}>
      {label}
    </div>
  );
};

const Canvas = ({ children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });
  return (
    <div ref={setNodeRef} style={{ flex: 1, minHeight: '400px', border: isOver ? '5px solid green' : '2px dashed black', backgroundColor: isOver ? '#e0ffe0' : '#f0f0f0', padding: '20px', paddingBottom: '100px' }}>{children}</div>
  );
};

// --- 3. MAIN FORM BUILDER ---
export default function FormBuilder() {
  const [items, setItems] = useState([{ id: 'section-default', type: 'section', label: 'Form Title' }]);
  const [activeItem, setActiveItem] = useState(null);
  const [collapsedSections, setCollapsedSections] = useState({});
  
  // 🔴 CRITICAL FIX 1: Make sure this state exists
  const [isPreview, setIsPreview] = useState(false);

  const sensors = useSensors(useSensor(MouseSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } }));

  const handleDragStart = (e) => setActiveItem(e.active.data.current);
  const handleDragEnd = (e) => {
    const { active, over } = e;
    setActiveItem(null);
    if (over && over.id === 'canvas-drop-zone') {
      const type = active.data.current.type;
      setItems((prev) => [...prev, { id: Date.now().toString(), label: type === 'section' ? 'New Section' : active.data.current.label, type: type }]);
    }
  };
  const handleDelete = (id) => setItems((prev) => prev.filter(item => item.id !== id));
  const handleUpdateLabel = (id, newLabel) => setItems((prev) => prev.map(item => item.id === id ? { ...item, label: newLabel } : item));
  const toggleSection = (id) => setCollapsedSections(prev => ({ ...prev, [id]: !prev[id] }));

  // 🔴 CRITICAL FIX 2: This function MUST call setIsPreview(true)
  const handleSaveForm = () => {
    if (items.length <= 1) {
        alert("Add some fields first.");
        return;
    }
    console.log("Saving..."); 
    setIsPreview(true); // <--- This switches the screen
  };

  const handleClearForm = () => {
    if (window.confirm("Discard?")) setItems([{ id: Date.now().toString(), type: 'section', label: 'Form Title' }]);
  };

  // 🔴 CRITICAL FIX 3: This logic MUST be here, BEFORE the main return
  if (isPreview) {
      return <FormPreview items={items} onEdit={() => setIsPreview(false)} />;
  }

  // --- STANDARD BUILDER VIEW ---
  let currentSectionId = null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '15px 20px', backgroundColor: '#333', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Form Builder</h2>
          <div>
            <button onClick={handleSaveForm} style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Save & Preview</button>
            <button onClick={handleClearForm} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '10px' }}>New Form</button>
          </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '20px', padding: '20px', flex: 1, backgroundColor: '#f4f6f8' }}>
          
          <div style={{ width: '200px' }}>
            <h3>Tools</h3>
            <div style={{marginBottom:'20px'}}><SidebarItem type="section" label="Add New Section"/></div>
            <SidebarItem type="text" label="Text Input"/><SidebarItem type="email" label="Email Input" /><SidebarItem type="paragraph" label="Long Text"/><SidebarItem type="date" label="Date Picker"/><SidebarItem type="checkbox" label="Checkbox" />
          </div>

          <Canvas>
            {items.map((i) => {
                const isSection = i.type === 'section';
                if (isSection) currentSectionId = i.id;
                const isHidden = !isSection && currentSectionId && collapsedSections[currentSectionId];
                if (isHidden) return null;

                return (
                    <div key={i.id} style={{ padding: '15px', border: isSection ? 'none' : '1px solid #ccc', marginBottom: '10px', background: isSection ? '#333' : 'white', color: isSection ? 'white' : 'black', borderRadius: '5px', marginTop: isSection ? '20px' : '0', marginLeft: isSection ? '0' : '20px', borderLeft: isSection ? 'none' : '4px solid #ddd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isSection ? '0' : '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', width: '80%' }}>
                                {isSection && <button onClick={() => toggleSection(i.id)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '18px', cursor: 'pointer', marginRight: '10px', transform: collapsedSections[i.id] ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</button>}
                                <input type="text" value={i.label} onChange={(e) => handleUpdateLabel(i.id, e.target.value)} style={{ fontWeight: 'bold', border: 'none', borderBottom: isSection ? '1px solid #777' : '1px dashed #ccc', outline: 'none', fontSize: isSection ? '18px' : '16px', width: '100%', color: isSection ? 'white' : '#333', background: 'transparent' }} />
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(i.id); }} style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', borderRadius: '4px', padding: '5px 10px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                        </div>
                        {!isSection && (<div>{(() => { switch(i.type) { case 'paragraph': return <textarea disabled placeholder="User answer..." style={disabledStyle} rows={3} />; case 'checkbox': return <div style={{display:'flex', alignItems:'center', gap:'10px'}}><input disabled type="checkbox" style={{width:'20px', height:'20px'}}/> <label>Option</label></div>; default: return <input disabled type={i.type} placeholder="User answer..." style={disabledStyle} />; } })()}</div>)}
                    </div>
                );
            })}
          </Canvas>
        </div>
        <DragOverlay>{activeItem ? <div style={{ padding: '10px', border: '2px solid blue', background: 'white', width: '150px', pointerEvents: 'none', borderRadius: '4px', opacity: 0.8 }}>{activeItem.label}</div> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}

const previewStyle = { width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' };
const disabledStyle = { width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', backgroundColor: '#fafafa', cursor: 'not-allowed' };