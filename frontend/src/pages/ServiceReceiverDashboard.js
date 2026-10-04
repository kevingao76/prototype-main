import React from 'react'
import Dashboard from '../components/DashboardPage/Dashboard';
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";


const ServiceReceiverDashboard = () => {
    return (
        <>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
            <Navbar userType="receiver" />
            <main>
                <Dashboard userType="receiver" />
            </main>
            <Footer />
        </div>
        </>

    )
}

export default ServiceReceiverDashboard
