"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Phone, MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { db } from '../../../backend/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import styles from '../../style/contact.module.css';

export default function ContactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        organisation: '',
        mobile: '',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await addDoc(collection(db, "adminRequests"), {
                organisation: formData.organisation,
                mobile: formData.mobile,
                message: formData.message,
                createdAt: serverTimestamp()
            });

            alert("Request sent successfully! Our team will contact you.");
            router.push('/login');
        } catch (error) {
            console.error("Error saving request:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <button onClick={() => router.back()} className={styles.backBtn}>
                <ArrowLeft size={20} /> Back
            </button>

            <div className={styles.contactCard}>
                <div className={styles.header}>
                    <h2>Admin Request Form</h2>
                    <p>Please provide your details to join the Waste Ops network.</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label><Building2 size={16} /> Organisation Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Municipal Corp"
                            required
                            value={formData.organisation}
                            onChange={(e) => setFormData({ ...formData, organisation: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label><Phone size={16} /> Mobile Number</label>
                        <input
                            type="tel"
                            placeholder="+91 XXXXX XXXXX"
                            required
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label><MessageSquare size={16} /> Why do you want to join?</label>
                        <textarea
                            placeholder="Briefly describe your role or purpose..."
                            required
                            rows="4"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={loading}
                    >
                        {loading ? "SENDING..." : "SUBMIT REQUEST"} <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}