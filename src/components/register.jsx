//Work is needed
import React, { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async () => {
    try {
      const user = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Registered:", user.user.email);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={registerUser}>Register</button>
    </div>
  );
}
