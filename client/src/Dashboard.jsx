import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://authentication-page-backend.vercel.app";

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("forms"); 
    
    const [forms, setForms] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Search States
    const [searchId, setSearchId] = useState("");
    const [searchOrgId, setSearchOrgId] = useState("");

    // New User Form State
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', mobileNumber: '' });
    const [isCreatingUser, setIsCreatingUser] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = JSON.parse(localStorage.getItem("user"));
        
        if (!token || !userData) {
            navigate("/login");
        } else {
            setUser(userData);
            fetchForms(token);
            if (userData.privilege === 'admin') {
                fetchUsers(token);
            }
        }
    }, [navigate]);

    // --- API CALLS ---
    const fetchForms = async (token) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/forms`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setForms(data);
        } catch (err) { console.error("Error fetching forms", err); }
    };

    const fetchUsers = async (token) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/users`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (err) { console.error("Error fetching users", err); }
    };

    const handleDeleteForm = async (formId) => {
        if (!window.confirm("Are you sure you want to delete this form?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/forms/${formId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setForms(forms.filter(f => f._id !== formId));
                alert("Form deleted successfully.");
            } else {
                alert("Failed to delete form.");
            }
        } catch (err) {
            alert("Server Error");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BACKEND_URL}/api/users`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (res.ok) {
                alert("User Created Successfully!");
                setUsers([...users, data]); 
                setIsCreatingUser(false);
                setNewUser({ name: '', email: '', password: '', mobileNumber: '' });
            } else {
                alert(data.message || "Failed to create user");
            }
        } catch (err) {
            alert("Server Error");
        }
    };

    const handleShare = (formId) => {
        const link = `${window.location.origin}/fill/${formId}`;
        navigator.clipboard.writeText(link).then(() => {
            alert("Link copied! Send this to your employees.");
        });
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleCreateForm = () => {
        navigate("/form-builder", { 
            state: { isNew: true, name: "Untitled Form", description: "", items: [] } 
        }); 
    };

    // --- SEARCH FILTER ---
    const filteredUsers = users.filter(u => {
        const matchId = searchId ? u._id.toLowerCase().includes(searchId.toLowerCase()) : true;
        const matchOrg = searchOrgId ? (u.organizationId || "").toLowerCase().includes(searchOrgId.toLowerCase()) : true;
        return matchId && matchOrg;
    });

    if (!user) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid #ddd', paddingBottom: '10px' }}>
                <div>
                    <h1 style={{ margin: 0 }}>{user.name}'s Dashboard</h1>
                    <div style={{ marginTop: '5px' }}>
                        <span style={{ color: '#666', fontSize: '14px', marginRight: '15px' }}>
                            Role: <strong>{user.privilege === 'admin' ? 'Admin 👑' : 'Respondent'}</strong>
                        </span>
                        <span style={{ fontSize: '12px', background: '#eee', padding: '3px 8px', borderRadius: '4px' }}>
                            Your Org ID: {user.organizationId}
                        </span>
                    </div>
                </div>
                <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
            </div>

            {/* TABS (Only for Admin) */}
            {user.privilege === 'admin' && (
                <div style={{ marginBottom: '20px' }}>
                    <button 
                        onClick={() => setActiveTab("forms")} 
                        style={{ padding: '10px 20px', marginRight: '10px', background: activeTab === 'forms' ? '#007bff' : '#f0f0f0', color: activeTab === 'forms' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        📝 Manage Forms
                    </button>
                    <button 
                        onClick={() => setActiveTab("users")} 
                        style={{ padding: '10px 20px', background: activeTab === 'users' ? '#007bff' : '#f0f0f0', color: activeTab === 'users' ? 'white' : 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        👥 Manage Users
                    </button>
                </div>
            )}

            {/* === FORMS TAB === */}
            {activeTab === 'forms' && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3>{user.privilege === 'admin' ? "Your Forms" : "Assigned Forms"}</h3>
                        
                        {/* SECURITY: Only Admins can see the Create Button */}
                        {user.privilege === 'admin' && (
                            <button onClick={handleCreateForm} style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Create New Form</button>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {forms.map(form => (
                            <div key={form._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                <h4 style={{ margin: '0 0 10px 0' }}>{form.name}</h4>
                                <p style={{ color: '#666', fontSize: '13px', marginBottom: '15px' }}>{form.description || "No description"}</p>
                                
                                {/* ACTION BUTTONS */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {/* 1. Fill Button (Everyone) */}
<button 
    onClick={() => navigate('/preview', { state: form })} 
    style={{ flex: 1, fontSize: '12px', padding: '8px', background: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
    title="Fill New Response"
>
    Fill
</button>

{/* 2. View Button (Everyone - Read Only Template) */}
<button 
    onClick={() => navigate('/view', { state: form })} 
    style={{ flex: 1, fontSize: '12px', padding: '8px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
    title="View Form"
>
    View
</button>

{/* 3. NEW: History/Responses Button (Everyone) */}
{/* Renamed to 'History' for Respondents, 'Responses' for Admin */}
<button 
    onClick={() => navigate('/responses', { state: form })} 
    style={{ fontSize: '12px', padding: '8px 12px', background: '#6610f2', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '5px' }}
    title={user.privilege === 'admin' ? "View All Responses" : "View My History"}
>
    {user.privilege === 'admin' ? "📊" : "📄"}
</button>

{/* 4. Admin Only Buttons */}
{user.privilege === 'admin' && (
    <>
        <button 
            onClick={() => handleDeleteForm(form._id)} 
            style={{ fontSize: '12px', padding: '8px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '5px' }}
        >
            🗑️
        </button>
        <button 
            onClick={() => handleShare(form._id)} 
            style={{ fontSize: '12px', padding: '8px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '5px' }}
            title="Copy Link"
        >
            🔗
        </button>
    </>
)}
                                </div>
                            </div>
                        ))}
                        
                        {/* Friendly Message for Empty Respondent Dashboard */}
                        {forms.length === 0 && (
                            <div style={{gridColumn: '1/-1', textAlign: 'center', color: '#666', marginTop: '40px'}}>
                                {user.privilege === 'admin' 
                                    ? <p>No forms created yet. Click "+ Create New Form" to start.</p>
                                    : <p><strong>No forms visible.</strong><br/>Please wait for your Admin to share a form link with you.</p>
                                }
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* USERS TAB - ALREADY HIDDEN FOR NON-ADMINS via activeTab check */}
            {activeTab === 'users' && user.privilege === 'admin' && (
                <div>
                    {/* ... (Existing User Tab Code - No changes needed here because the tab button itself is hidden) ... */}
                    {/* I will include the minimal structure so the file is complete */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <h3>Organization Users</h3>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <input type="text" placeholder="Search by User ID..." value={searchId} onChange={(e) => setSearchId(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }} />
                                <input type="text" placeholder="Search by Org ID..." value={searchOrgId} onChange={(e) => setSearchOrgId(e.target.value)} style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }} />
                            </div>
                        </div>
                        <button onClick={() => setIsCreatingUser(!isCreatingUser)} style={{ padding: '10px 15px', background: isCreatingUser ? '#666' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{isCreatingUser ? "Cancel" : "+ Add User"}</button>
                    </div>

                    {isCreatingUser && (
                        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
                            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required style={{ padding: '8px' }} />
                                <input type="email" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required style={{ padding: '8px' }} />
                                <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required style={{ padding: '8px' }} />
                                <input type="text" placeholder="Mobile Number" value={newUser.mobileNumber} onChange={e => setNewUser({...newUser, mobileNumber: e.target.value})} style={{ padding: '8px' }} />
                                <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create User</button>
                            </form>
                        </div>
                    )}

                    <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Name</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Email</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Mobile</th>
                                <th style={{ padding: '12px', borderBottom: '2px solid #ddd' }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>{u.name}</td>
                                    <td style={{ padding: '12px' }}>{u.email}</td>
                                    <td style={{ padding: '12px' }}>{u.mobileNumber || "N/A"}</td>
                                    <td style={{ padding: '12px' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Dashboard;