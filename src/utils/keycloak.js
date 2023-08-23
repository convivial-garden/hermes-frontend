import Keycloak from 'keycloak-js';

export let keycloak = null;

function initKeycloak() {
  console.log('initKeycloak');
  const initOptions = {
    url: 'http://keycloak:8080/',
    realm: 'collectivo',
    clientId: 'collectivo-ux',
    onLoad: 'login-required',
  };
  keycloak = new Keycloak(initOptions);
  keycloak.redirectUri = `${window.location.origin}/`;
  keycloak.onAuthSuccess = () => {
    localStorage.setItem('token', keycloak.token);
    // @ts-ignore
    console.log('onAuthSuccess', localStorage.getItem('token'));
  };
  keycloak.onAuthError = () => {
    // @ts-ignore
    console.log('onAuthError');
  };
  keycloak.onAuthRefreshSuccess = () => {
    // @ts-ignore
    console.log('onAuthRefreshSuccess');
  };
  keycloak.onAuthRefreshError = () => {
    // @ts-ignore
    console.log('onAuthRefreshError');
  };
  keycloak.onAuthLogout = () => {
    // @ts-ignore
    console.log('onAuthLogout');
    alert('Your connection has been lost. Please log in again.');
    keycloak.logout();
  };
  keycloak.onTokenExpired = () => {
    // @ts-ignore
    console.log('onTokenExpired');
    keycloak.updateToken(30);
  };
  keycloak.onReady = (authenticated) => {
    if (!authenticated) {
      keycloak.login({
        locale: 'de',
        redirectUri: `${window.location.origin + window.location.pathname}/`,
      });
    } else {
    }
  };
  keycloak.init({
    redirectUri: `${window.location.origin + window.location.pathname}/`,
    onLoad: initOptions.onLoad,
    checkLoginIframe: false,
    flow: 'standard',
  });
}

export default initKeycloak;
