import React, { Component, Suspense } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useMatch,
  useNavigate,
  useResolvedPath,
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import { getSales, PUBHOST } from './utils/transportFunctions.jsx';
import initKeycloak, { keycloak } from '@/utils/keycloak.js';
import RepeatedContractList from './pages/RepeatedContractList';
import 'react-toastify/dist/ReactToastify.css';
import registerServiceWorker from './utils/registerServiceWorker';
import { ToastContainer, toast } from 'react-toastify';

const ContractNew = React.lazy(() => import('./pages/ContractNew'));
const CustomerList = React.lazy(() => import('./pages/CustomerList'));
const AllCustomers = React.lazy(() => import('./pages/AllCustomers'));
const ContractList = React.lazy(() => import('./pages/ContractList'));
const ContractSelfList = React.lazy(() => import('./pages/ContractSelfList'));
const ActiveStaff = React.lazy(() => import('./pages/ActiveStaff'));
const AddressDetail = React.lazy(() => import('./pages/AddressDetail'));
const ContractArchive = React.lazy(() => import('./pages/ContractArchive'));
const MapView = React.lazy(() => import('./pages/MapView'));
const SettingsView = React.lazy(() => import('./pages/SettingsView'));
const Preorders = React.lazy(() => import('./pages/Preorders'));
const DelayedPaymentList = React.lazy(() =>
  import('./pages/DelayedPaymentList'),
);

function CustomLink({ children, to, ...props }) {
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });

  return (
    <div>
      <Link
        style={{ textDecoration: match ? 'underline' : 'none' }}
        to={to}
        {...props}
      >
        {children}
      </Link>
      {/* {match && " (active)"} */}
    </div>
  );
}

class App extends Component {
  constructor() {
    super();
    this.update = this.update.bind(this);
    this.registerKeys = this.registerKeys.bind(this);
    this.navigate = this.navigate.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.state = {
      totalSales: 0,
      navigate: useNavigate,
    };

    moment.locale('de');
    // todo should run before render

    registerServiceWorker();
    const token = localStorage.getItem('token');
    // init keycloak when token is not set
    if (token == null) {
      if (keycloak == null || !keycloak.authenticated) {
        initKeycloak();
      }
    }
  }
  navigate(path) {
    this.state.navigate(path);
  }
  registerKeys() {
    console.log('register keys', this);
    window.addEventListener('keydown', this.handleKeyDown);
  }
  handleKeyDown(event) {
    if (event.key === 'F4') {
      event.preventDefault();
      document.getElementById('new-contract').click();
    }
    if (event.key === 'F3') {
      event.preventDefault();
      window.location = `${PUBHOST}`;
    }
  }

  componentDidMount() {
    this.update();
    this.registerKeys();
  }
  componentWillUnmount() {
    window.removeEventListener('keydown', this.handleKeyDown);
  }

  update(date) {
    const actualDate = date || moment();
    getSales(actualDate).then((totalPrice) => {
      this.setState({ totalSales: totalPrice.data.totalPrice });
    });
  }

  render() {
    if (keycloak == null || !keycloak.authenticated) {
      return <div> not authenticated</div>;
    }
    return (
      <BrowserRouter>
        <ToastContainer />
        {/* <main> */}
        <Navbar className='main-navigation'>
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav>
              <CustomLink
                className='btn btn-primary ms-3'
                to='disposerv/disposerv/newcontract'
              >
                <Nav id='new-contract'>Neuer Auftrag</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className='nav-link' to='disposerv/disposerv/staff'>
                <Nav>Personaleinsatz</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className='nav-link' to='disposerv/disposerv/'>
                <Nav>Auftragsübersicht</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/preorders'
              >
                <Nav>Vorbestellungen</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/repeated'
              >
                <Nav>Daueraufträge</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/allcustomers'
              >
                <Nav>Kundenliste</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/archive'
              >
                <Nav>Auftragsarchiv</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/delayedcustomers'
              >
                <Nav>Nachzahlungen</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className='nav-link' to='disposerv/disposerv/self'>
                <Nav>Meine Aufträge</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className='nav-link' to='disposerv/disposerv/map'>
                <Nav>Karte</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/settings'
              >
                <Nav>
                  <FontAwesomeIcon icon={faCog} />
                </Nav>
              </CustomLink>
            </Nav>
            <Nav className='ml-auto'>
              <span style={{ color: '#000000' }}>
                Tagesumsatz {this.state.totalSales} €
              </span>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div className='content-wrapper mt-4'>
          <Suspense fallback={<>loading...</>}>
            <Routes className='mt-2'>
              <Route
                path='/'
                element={<ContractList appUpdate={this.update} />}
              />
              <Route
                path='disposerv/disposerv/'
                element={<ContractList appUpdate={this.update} />}
              />
              <Route
                path='disposerv/disposerv/self/'
                element={<ContractSelfList appUpdate={this.update} />}
              />
              <Route
                path='disposerv/disposerv/newcontract'
                element={<ContractNew />}
              />
              <Route
                path='disposerv/disposerv/customers'
                element={<CustomerList />}
              />
              <Route
                path='disposerv/disposerv/allcustomers'
                element={<AllCustomers />}
              />
              <Route
                path='disposerv/disposerv/staff'
                element={<ActiveStaff />}
              />
              <Route
                path='disposerv/disposerv/test/:id'
                element={<AddressDetail />}
              />
              <Route
                path='disposerv/disposerv/archive'
                element={<ContractArchive />}
              />
              <Route
                path='disposerv/disposerv/preorders'
                element={<Preorders />}
              />
              <Route
                path='disposerv/disposerv/delayedcustomers'
                element={<DelayedPaymentList />}
              />
              <Route path='disposerv/disposerv/map' element={<MapView />} />
              <Route
                path='disposerv/disposerv/settings'
                element={<SettingsView />}
              />
              <Route
                path='disposerv/disposerv/repeated'
                element={<RepeatedContractList />}
              />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
