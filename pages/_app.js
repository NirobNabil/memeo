
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../redux/reducers/index';
import "filepond/dist/filepond.min.css";

import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'
import '../styles/globals.css'
import "./../styles/styles.css";



const store = createStore(rootReducer, applyMiddleware(thunk));

TimeAgo.addDefaultLocale(en)
TimeAgo.addLocale(en)
function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
        <Provider store={store}>
          <ThemeProvider attribute="class">
              <Component {...pageProps} />
          </ThemeProvider>
        </Provider>
    </SessionProvider>
  );
}

export default MyApp
