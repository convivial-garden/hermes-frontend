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
import ContractNew from './pages/ContractNew';
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
import { getSales, PUBHOST } from './utils/transportFunctions.jsx';
import initKeycloak, { keycloak } from '@/utils/keycloak.js';
import registerServiceWorker from './utils/registerServiceWorker';

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
      keycloak == null || !keycloak.authenticated
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
    if (keycloak == null || !keycloak.authenticated) {
      return <div> not authenticated</div>;
    }
    return (
      <BrowserRouter>
        {/* <main> */}
        <Navbar className="main-navigation">
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav>
              <CustomLink
                className="nav-link btn btn-primary text-white ms-3"
                to="disposerv/disposerv/newcontract"
              >
                <Nav>Neuer Auftrag</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className="nav-link"
                to="disposerv/disposerv/staff"
              >
                <Nav>Personaleinsatz</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className="nav-link" to="disposerv/disposerv/">
                <Nav>Auftragsübersicht</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className="nav-link"
                to="disposerv/disposerv/preorders"
              >
                <Nav>Vorbestellungen</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className="nav-link"
                to="disposerv/disposerv/repeated"
              >
                <Nav>Daueraufträge</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className="nav-link"
                to="disposerv/disposerv/customers"
              >
                <Nav>Kundensuche</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className="nav-link"
                to="disposerv/disposerv/allcustomers"
              >
                <Nav>Kundenliste</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className="nav-link"
                to="disposerv/disposerv/archive"
              >
                <Nav>Auftragsarchiv</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className="nav-link"
                to="disposerv/disposerv/delayedcustomers"
              >
                <Nav>Nachzahlungen</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className="nav-link" to="disposerv/disposerv/self">
                <Nav>Meine Aufträge</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink className="nav-link" to="disposerv/disposerv/map">
                <Nav>Karte</Nav>
              </CustomLink>
            </Nav>
            <Nav>
              <CustomLink
                className="nav-link"
                to="disposerv/disposerv/settings"
              >
                <Nav>
                  <FontAwesomeIcon icon={faCog} />
                </Nav>
              </CustomLink>
            </Nav>
            <Nav className="ml-auto">
              <span style={{ color: '#000000' }}>
                Tagesumsatz
                {' '}
                {this.state.totalSales}
                {' '}
                €
              </span>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <div className="content-wrapper mt-4">
          <Routes className="mt-2">
            <Route
              path="/"
              element={<ContractList appUpdate={this.update} />}
            />
            <Route
              path="disposerv/disposerv/"
              element={<ContractList appUpdate={this.update} />}
            />
            <Route
              path="disposerv/disposerv/self/"
              element={<ContractSelfList appUpdate={this.update} />}
            />
            <Route
              path="disposerv/disposerv/newcontract"
              element={<ContractNew />}
            />
            <Route
              path="disposerv/disposerv/customers"
              element={<CustomerList />}
            />
            <Route
              path="disposerv/disposerv/allcustomers"
              element={<AllCustomers />}
            />
            <Route
              path="disposerv/disposerv/staff"
              element={<ActiveStaff />}
            />
            <Route
              path="disposerv/disposerv/test/:id"
              element={<AddressDetail />}
            />
            <Route
              path="disposerv/disposerv/archive"
              element={<ContractArchive />}
            />
            <Route
              path="disposerv/disposerv/preorders"
              element={<Preorders />}
            />
            <Route
              path="disposerv/disposerv/delayedcustomers"
              element={<DelayedPaymentList />}
            />
            <Route path="disposerv/disposerv/map" element={<MapView />} />
            <Route
              path="disposerv/disposerv/settings"
              element={<SettingsView />}
            />
            <Route
              path="disposerv/disposerv/repeated"
              element={<RepeatedContractList />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
