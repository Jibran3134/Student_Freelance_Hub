import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";

// Simple styling
const styles = {
  container: { backgroundColor: "#1E1E2F", color: "#E0E0FF", minHeight: "100vh", padding: "20px", fontFamily: "Arial" },
  card: { backgroundColor: "#2A2A40", padding: "15px", margin: "10px 0", borderRadius: "8px" },
  input: { padding: "8px", margin: "5px", borderRadius: "4px", border: "none" },
  button: { padding: "8px 15px", margin: "5px", borderRadius: "4px", border: "none", backgroundColor: "#6B5BFF", color: "#fff", cursor: "pointer" }
};

function App() {
  // Auth states
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Firestore items
  const [items, setItems] = useState([]);

  // Listen to auth state
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  // Fetch Firestore items
  useEffect(() => {
    const fetchItems = async () => {
      const querySnapshot = await getDocs(collection(db, "items"));
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
    };
    fetchItems();
  }, []);

  // Register
  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword("");
    } catch (err) { alert(err.message); }
  };

  // Login
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(""); setPassword("");
    } catch (err) { alert(err.message); }
  };

  // Logout
  const logout = async () => { await signOut(auth); }

  return (
    <div style={styles.container}>
      <h1>ISE Project Dashboard</h1>

      {!user ? (
        <div style={styles.card}>
          <h2>Register / Login</h2>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <div>
            <button style={styles.button} onClick={register}>Register</button>
            <button style={styles.button} onClick={login}>Login</button>
          </div>
        </div>
      ) : (
        <>
          <div style={styles.card}>
            <h2>Welcome, {user.email}</h2>
            <button style={styles.button} onClick={logout}>Logout</button>
          </div>

          <div style={styles.card}>
            <h2>Firestore Items</h2>
            {items.length === 0 ? <p>No items found.</p> : (
              <ul>
                {items.map(item => (
                  <li key={item.id}>{item.name} - {item.price} - {item.description}</li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
