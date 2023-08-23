import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.scss';
import 'moment/locale/de-at';
import 'leaflet/dist/leaflet.css';

console.log('say hy from index.jsx');

export function render() {
  const App = React.lazy(() => import('./App'));
  const el = document.getElementById('disposerv');
  const root = createRoot(el);
  root.render(<App />);
}

const M = {};
M.setup = (container) => {
  console.log('setup', container);
};

M.render = render;

export default M;
