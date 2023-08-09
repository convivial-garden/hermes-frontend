import React, { Component } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useMatch,
  useResolvedPath,
} from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import moment from 'moment';
import RepeatedContractList from './pages/RepeatedContractList';
import ContractFormContainer from './pages/ContractFormContainer';
import CustomerList from './pages/CustomerList';
import AllCustomers from './pages/AllCustomers';
import ContractList from './pages/ContractList';
import ContractSelfList from './pages/ContractSelfList';
import ActiveStaff from './pages/ActiveStaff';
import AddressDetail from './pages/AddressDetail';
import ContractArchive from './pages/ContractArchive';
import MapView from './pages/MapView';
import SettingsView from './pages/SettingsView';
import Preorders from './pages/Preorders';
import DelayedPaymentList from './pages/DelayedPaymentList';
import { getSales } from './utils/transportFunctions';
import initKeycloak from './utils/keycloak';
import registerServiceWorker from './utils/registerServiceWorker';
import { PUBHOST } from './utils/transportFunctions';

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
    this.state = {
      totalSales: 0,
    };

    moment.locale('de');
    // todo should run before render
    window.addEventListener('keydown', (event) => {
      if (event.key === 'F4') {
        event.preventDefault();
        window.location = `${PUBHOST}newcontract`;
      }
      if (event.key === 'F3') {
        event.preventDefault();
        window.location = `${PUBHOST}`;
      }
    });

    registerServiceWorker();
    if (
      localStorage.getItem('token') === null ||
      localStorage.getItem('tokenByAdaper') === true
    ) {
      initKeycloak();
    }
  }

  componentDidMount() {
    this.update();
  }

  update(date) {
    const actualDate = date || moment();
    getSales(actualDate).then((totalPrice) => {
      this.setState({ totalSales: totalPrice.data.totalPrice });
    });
  }

  render() {
    return (
      <BrowserRouter>
        {/* <main> */}
        <Navbar className='main-navigation'>
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav>
              <CustomLink
                className='nav-link btn btn-primary text-white ms-3'
                to='disposerv/disposerv/1/newcontract'
              >
                <Nav>Neuer Auftrag</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/1/staff'
              >
                <Nav>Personaleinsatz</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className='nav-link' to='disposerv/disposerv/1/'>
                <Nav>Auftragsübersicht</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/1/preorders'
              >
                <Nav>Vorbestellungen</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/1/repeated'
              >
                <Nav>Daueraufträge</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/1/customers'
              >
                <Nav>Kundensuche</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/1/allcustomers'
              >
                <Nav>Kundenliste</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/1/archive'
              >
                <Nav>Auftragsarchiv</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/1/delayedcustomers'
              >
                <Nav>Nachzahlungen</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className='nav-link' to='disposerv/disposerv/1/self'>
                <Nav>Meine Aufträge</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className='nav-link' to='disposerv/disposerv/1/map'>
                <Nav>Karte</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className='nav-link'
                to='disposerv/disposerv/1/settings'
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
          <Routes className='mt-2'>
          <Route
              path='/'
              element={<ContractList appUpdate={this.update} />}
            />
            <Route
              path='disposerv/disposerv/1/'
              element={<ContractList appUpdate={this.update} />}
            />
            <Route
              path='disposerv/disposerv/1/self/'
              element={<ContractSelfList appUpdate={this.update} />}
            />
            <Route
              path='disposerv/disposerv/1/newcontract'
              element={<ContractFormContainer />}
            />
            <Route
              path='disposerv/disposerv/1/customers'
              element={<CustomerList />}
            />
            <Route
              path='disposerv/disposerv/1/allcustomers'
              element={<AllCustomers />}
            />
            <Route
              path='disposerv/disposerv/1/staff'
              element={<ActiveStaff />}
            />
            <Route
              path='disposerv/disposerv/1/test/:id'
              element={<AddressDetail />}
            />
            <Route
              path='disposerv/disposerv/1/archive'
              element={<ContractArchive />}
            />
            <Route
              path='disposerv/disposerv/1/preorders'
              element={<Preorders />}
            />
            <Route
              path='disposerv/disposerv/1/delayedcustomers'
              element={<DelayedPaymentList />}
            />
            <Route path='disposerv/disposerv/1/map' element={<MapView />} />
            <Route
              path='disposerv/disposerv/1/settings'
              element={<SettingsView />}
            />
            <Route
              path='disposerv/disposerv/1/repeated'
              element={<RepeatedContractList />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
