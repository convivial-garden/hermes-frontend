import React from 'react';
import { createRoot } from 'react-dom/client';

import './index.scss';
import 'moment/locale/de-at';
import 'leaflet/dist/leaflet.css';

console.log('say hy from component.jsx');

export function render() {
  const App = React.lazy(() => import('./App'));
  const parent = document.getElementById('remote_a');
  parent.innerHTML = '<div id="disposerv"></div>';
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
