import React from 'react'
import Calendar from '../components/PlannedAppointmentsPage/Calender';
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";

const BrowseServicesReceiver = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="provider" />
        <main>
          <Calendar userType="provider" />
        </main>
        <Footer />
      </div>
    </>
  )
}

export default BrowseServicesReceiver
