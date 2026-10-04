import React from 'react';
import Footer from '../components/SupportComponents/Footer';
import Navbar from "../components/SupportComponents/Navbar";
import ServiceDetails from "../components/Services/ServiceDetails";


const ServiceDetailPage = () => {
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar userType="receiver" />
        <main>
          <ServiceDetails />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ServiceDetailPage;
