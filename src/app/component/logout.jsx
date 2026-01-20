"use client";
import React from 'react';
import { auth } from '../../../backend/firebase'; // Aapka firebase path
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import styles from '../../style/home.module.css';

const LogoutButton = () => {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Logout ke baad login page par redirect karein
            router.push('/');
        } catch (error) {
            console.error("Logout Error:", error.message);
            alert("Error logging out. Please try again.");
        }
    };

    return (
        <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
        </button>
    );
};

export default LogoutButton;