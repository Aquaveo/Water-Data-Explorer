import { Route, Routes, Link } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import PropTypes from 'prop-types';
import { useState, useContext } from 'react';
// Remove LinkContainer import
import Header from 'features/react-tethys/components/layout/Header';
import NavMenu from 'features/react-tethys/components/layout/NavMenu';
import NotFound from 'features/react-tethys/components/error/NotFound';
import { AppContext } from 'features/react-tethys/context/context';

function Layout({ navLinks, routes, children }) {
  const { tethysApp } = useContext(AppContext);
  const [navVisible, setNavVisible] = useState(false);

  return (
    <div className="h-100">
      <Header onNavChange={setNavVisible} />
      <NavMenu navTitle="Navigation" navVisible={navVisible} onNavChange={setNavVisible}>
        <Nav variant="pills" defaultActiveKey={tethysApp.rootUrl} className="flex-column">
          {navLinks.map((link, idx) => (
            <Nav.Link
              as={Link}
              to={link.to}
              eventKey={link.eventKey}
              onClick={() => setNavVisible(false)}
              key={`link-${idx}`}
            >
              {link.title}
            </Nav.Link>
          ))}
        </Nav>
      </NavMenu>
      <Routes>
        {routes}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {children}
    </div>
  );
}

Layout.propTypes = {
  navLinks: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      to: PropTypes.string,
      eventKey: PropTypes.string,
    })
  ),
  routes: PropTypes.any,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
};

export default Layout;
