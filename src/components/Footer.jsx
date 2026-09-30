import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="brand-wrap">
            <span className="brand-mark"><Leaf size={18} /></span>
            <span className="brand-name">KrishiSetu</span>
          </Link>
          <p>
            Field records, crop history, weather context and practical farm observations in one place.
          </p>
        </div>

        <div className="footer-links">
          <div>
            <h3>Quick links</h3>
            <ul>
              <li><Link to="/dashboard">My Farm</Link></li>
              <li><Link to="/evaluate">Evaluate Field</Link></li>
              <li><Link to="/dashboard">Monthly Tracker</Link></li>
              <li><Link to="/weather">Weather</Link></li>
            </ul>
          </div>

          <div>
            <h3>Resources</h3>
            <ul>
              <li><Link to="/dashboard">Crop Health</Link></li>
              <li><Link to="/disease">Reports</Link></li>
              <li><Link to="/dashboard">Resources</Link></li>
              <li><Link to="/dashboard">Contact</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>Built for real field conditions.</span>
        <span>Prototype demonstration data.</span>
      </div>

      <div className="footer-note">
        Information shown on the platform is for record-keeping and informational purposes and is not a replacement for professional agronomic advice.
      </div>
    </footer>
  );
};

export default Footer;
