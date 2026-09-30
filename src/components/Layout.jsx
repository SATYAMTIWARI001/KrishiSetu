import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="farm-shell min-h-screen">
      <div className="top-banner">
        Field records · crop history · weather context
      </div>

      <Navbar />

      <main className="page-main">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
