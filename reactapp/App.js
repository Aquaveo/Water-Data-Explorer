import { Route } from 'react-router-dom';

import ErrorBoundary from 'components/error/ErrorBoundary';
import Layout from 'components/layout/Layout';
import Loader from 'components/loader/Loader';

import WDEView from 'views/catalog.js';

import 'App.scss';

function App() {
  const PATH_HOME = '/';
  const PATH_ABOUT = '/about';
  const PATH_GETTING_STARTED = '/about';

  return (
    <>
      <ErrorBoundary>
          <Loader>
            <Layout 
              navLinks={[
                {title: 'App', to: PATH_HOME, eventKey: 'link-home'},
                {title: 'Getting Started', to: PATH_GETTING_STARTED, eventKey: 'link-getting-started'},
                {title: 'About', to: PATH_ABOUT, eventKey: 'link-about'},

              ]}
              routes={[
                <Route path={PATH_HOME} element={<WDEView />} key='route-home' />,
                <Route path={PATH_ABOUT} element={<WDEView />} key='route-about' />,
                <Route path={PATH_GETTING_STARTED} element={<WDEView />} key='route-getting-started' />,
              ]}
            />
          </Loader>
      </ErrorBoundary>
    </>
  );
}

export default App;