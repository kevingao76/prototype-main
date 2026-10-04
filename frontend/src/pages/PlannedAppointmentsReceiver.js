import React from 'react'
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";
import Calendar from '../components/PlannedAppointmentsPage/Calender';

const PlannedAppointmentsPage = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="receiver" />
        <main>
          <Calendar userType="receiver"/>
        </main>
        <Footer />
      </div>
    </>

  )
}

export default PlannedAppointmentsPage
