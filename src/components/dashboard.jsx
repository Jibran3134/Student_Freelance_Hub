//Work is needed
import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) setUserEmail(user.email);
      else setUserEmail("");
    });

    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "items")); // Example collection
      const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(items);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <p>User: {userEmail || "Not logged in"}</p>
      <ul>
        {data.map(item => (
          <li key={item.id}>{item.name || JSON.stringify(item)}</li>
        ))}
      </ul>
    </div>
  );
}
