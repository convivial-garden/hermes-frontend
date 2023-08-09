import React from 'react';
import { createRoot } from 'react-dom/client';
import moment from 'moment';

import './index.scss';
import 'moment/locale/de-at';
import 'leaflet/dist/leaflet.css';

console.log('say hy from index.jsx');

const App = React.lazy(() => import('./App'));


const container = document.getElementById("root");
const root = createRoot(container);

root.render(<App />);
