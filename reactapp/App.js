import { Route } from 'react-router-dom';

import ErrorBoundary from 'components/error/ErrorBoundary';
import Layout from 'components/layout/Layout';
import Loader from 'components/loader/Loader';

import WDEView from 'views/catalog.js';

import 'App.scss';

function App() {
  const PATH_HOME = '/';

  return (
    <>
      <ErrorBoundary>
          <Loader>
            <Layout 
              navLinks={[
                {title: 'Home', to: PATH_HOME, eventKey: 'link-home'},
                {title: 'About', to: PATH_HOME, eventKey: 'link-about'},

              ]}
              routes={[
                <Route path={PATH_HOME} element={<WDEView />} key='route-home' />,
                <Route path={PATH_HOME} element={<WDEView />} key='route-about' />,
              ]}
            />
          </Loader>
      </ErrorBoundary>
    </>
  );
}

export default App;