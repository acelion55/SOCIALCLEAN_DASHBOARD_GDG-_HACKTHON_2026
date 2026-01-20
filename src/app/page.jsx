"use client";
import React, { useState } from "react";
import { auth } from "../../backend/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import styles from "../style/login.module.css";
import { Lock, Mail, ArrowRight } from "lucide-react";
import AdminRequest from "./component/newadmin"

const page = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Login success hone par dashboard par bhejein
            router.push("/home");
        } catch (err) {
            setError("Invalid Email or Password. Please try again.");
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <div className={styles.logoIcon}></div>
                    <h1>WASTE OPS <span>ADMIN</span></h1>
                    <p>Sign in to manage city operations</p>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Mail size={20} className={styles.icon} />
                        <input
                            type="email"
                            placeholder="Admin Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <Lock size={20} className={styles.icon} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className={styles.errorMsg}>{error}</p>}

                    <button type="submit" className={styles.loginBtn}>
                        LOGIN TO PANEL <ArrowRight size={18} />
                    </button>
                </form>
                <AdminRequest />
            </div>
        </div>
    );
};

export default page;