"use client";
import Logout from "../component/logout"
import Searchbar from "../component/search"
import React from 'react';
import styles from '../../style/home.module.css';
import {
    Bell, Map as MapIcon, Sun
} from 'lucide-react';

const navbar = ({ onLocationSelect }) => {
    return (
        <div style={{ position: "sticky", top: 0, zIndex: 1000, backgroundColor: "#0a0a0a", height: "6vh", }}>
            <header className={styles.header}>
                <div className={styles.logo}>
                    <div className={styles.logoIcon}></div>
                    <span>WASTE OPS <span className={styles.analyticsText}>ANALYTICS</span></span>
                </div>

                <Searchbar onSelect={onLocationSelect} />

                <Logout />
                <div className={styles.headerRight}>
                    <Bell className={styles.icon} size={20} />
                    <div className={styles.userInfo}>
                        <div className={styles.userText}>
                            <p className={styles.userName}>Admin User</p>
                            <p className={styles.userRole}>City Supervisor</p>
                        </div>
                        <div className={styles.avatar}></div>
                    </div>
                </div>
            </header>
        </div>
    )
}

export default navbar