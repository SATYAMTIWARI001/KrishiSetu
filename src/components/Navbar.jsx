import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Leaf, Sprout, Map, CloudRain, BarChart3, FolderKanban, ChevronRight, Globe2, NotebookPen } from 'lucide-react';
import { useEffect, useState } from 'react';

const navLinks = [
  { name: 'My Farm', path: '/dashboard', icon: Sprout },
  { name: 'Evaluate Field', path: '/evaluate', icon: NotebookPen },
  { name: 'Monthly Tracker', path: '/dashboard', icon: FolderKanban },
  { name: 'Crop Health', path: '/dashboard', icon: Leaf },
  { name: 'Weather', path: '/weather', icon: CloudRain },
  { name: 'Reports', path: '/disease', icon: BarChart3 },
  { name: 'Resources', path: '/dashboard', icon: Globe2 },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`nav-shell ${isScrolled ? 'nav-shell-scrolled' : ''}`}>
      <div className="nav-inner">
        <Link to="/" className="brand-wrap" aria-label="KrishiSetu home">
          <span className="brand-mark"><Leaf size={18} /></span>
          <span className="brand-name">KrishiSetu</span>
        </Link>

        <div className="nav-links hidden md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'nav-link-active' : ''}`}
            >
              <link.icon size={15} />
              <span>{link.name}</span>
            </Link>
          ))}
        </div>

        <div className="nav-actions hidden md:flex">
          <div className="language-pill">
            <Map size={14} />
            <select defaultValue="English" aria-label="Select language">
              <option>English</option>
              <option>हिन्दी</option>
              <option>मराठी</option>
            </select>
          </div>

          <Link to="/evaluate" className="cta-button dark">
            My Farm <ChevronRight size={16} />
          </Link>
        </div>

        <button
          type="button"
          className="mobile-menu-button md:hidden"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMobileMenuOpen((value) => !value)}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="mobile-menu md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`mobile-link ${isActive(link.path) ? 'mobile-link-active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <link.icon size={16} />
              <span>{link.name}</span>
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
