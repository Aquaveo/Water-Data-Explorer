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

              ]}
              routes={[
                <Route path={PATH_HOME} element={<WDEView />} key='route-home' />,
              ]}
            />
          </Loader>
      </ErrorBoundary>
    </>
  );
}

export default App;