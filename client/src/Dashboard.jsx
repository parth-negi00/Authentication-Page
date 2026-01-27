import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://authentication-page-backend.vercel.app";

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState("forms"); 
    
    // Data States
    const [forms, setForms] = useState([]);
    const [users, setUsers] = useState([]);
    
    // Search States (Keep these to filter the list)
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const handleCreateForm = () => {
        navigate("/FormBuilder.jsx"); 
    };

    // --- SEARCH FILTER LOGIC ---
    // We filter based on IDs, even though we don't show them in the table
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
                        <h3>Your Forms</h3>
                        <button onClick={handleCreateForm} style={{ padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Create New Form</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                        {forms.map(form => (
                            <div key={form._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                                <h4 style={{ margin: '0 0 10px 0' }}>{form.name}</h4>
                                <p style={{ color: '#666', fontSize: '13px' }}>{form.description || "No description"}</p>
                                <div style={{ marginTop: '15px' }}>
                                    <button onClick={() => navigate('/preview', { state: form })} style={{ fontSize: '12px', padding: '5px 10px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>View/Fill</button>
                                </div>
                            </div>
                        ))}
                        {forms.length === 0 && <p>No forms created yet.</p>}
                    </div>
                </div>
            )}

            {/* === USERS TAB === */}
            {activeTab === 'users' && (
                <div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <h3>Organization Users</h3>
                            
                            {/* SEARCH INPUTS (Preserved) */}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <input 
                                    type="text" 
                                    placeholder="Search by User ID..." 
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
                                />
                                <input 
                                    type="text" 
                                    placeholder="Search by Org ID..." 
                                    value={searchOrgId}
                                    onChange={(e) => setSearchOrgId(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '200px' }}
                                />
                            </div>
                        </div>

                        <button onClick={() => setIsCreatingUser(!isCreatingUser)} style={{ padding: '10px 15px', background: isCreatingUser ? '#666' : '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                            {isCreatingUser ? "Cancel" : "+ Add User"}
                        </button>
                    </div>

                    {/* ADD USER FORM */}
                    {isCreatingUser && (
                        <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #ddd' }}>
                            <h4>Add New Respondent</h4>
                            <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input type="text" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} required style={{ padding: '8px' }} />
                                <input type="email" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} required style={{ padding: '8px' }} />
                                <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} required style={{ padding: '8px' }} />
                                <input type="text" placeholder="Mobile Number" value={newUser.mobileNumber} onChange={e => setNewUser({...newUser, mobileNumber: e.target.value})} style={{ padding: '8px' }} />
                                <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Create User</button>
                            </form>
                        </div>
                    )}

                    {/* USERS TABLE (Reverted Columns) */}
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
                    
                    {filteredUsers.length === 0 && (
                        <p style={{ marginTop: '20px', color: '#666', textAlign: 'center' }}>
                            {users.length === 0 ? "No users found in your organization." : "No users match your search."}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;