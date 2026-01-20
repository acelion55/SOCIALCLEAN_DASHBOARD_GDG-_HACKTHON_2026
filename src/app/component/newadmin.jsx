"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import styles from '../../style/adminrequest.module.css';

const newadmin = () => {
    const router = useRouter();

    return (
        <button
            className={styles.requestBtn}
            onClick={() => router.push('/contactus')}
        >
            <UserPlus size={18} />
            Want to be an Admin?
        </button>
    );
};

export default newadmin;