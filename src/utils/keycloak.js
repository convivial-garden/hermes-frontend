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
  keycloak.redirectUri = window.location.origin + "/";
  keycloak.onAuthSuccess = () => {
    localStorage.setItem('token', keycloak.token);
    console.log('onAuthSuccess', localStorage.getItem('token'));
    console.log('onAuthSuccess');
  };
  keycloak.onAuthError = () => {
    console.log('onAuthError');
  };
  keycloak.onAuthRefreshSuccess = () => {
    console.log('onAuthRefreshSuccess');
  };
  keycloak.onAuthRefreshError = () => {
    console.log('onAuthRefreshError');
  };
  keycloak.onAuthLogout = () => {
    console.log('onAuthLogout');
    alert(t('Your connection has been lost. Please log in again.'));
    keycloak.logout();
  };
  keycloak.onTokenExpired = () => {
    console.log('onTokenExpired');
    keycloak.updateToken(30)
  };
  keycloak.onReady = (authenticated) => {
    console.log('onReady', authenticated);
    if (!authenticated) {
      keycloak.login({
        locale: 'de',
        redirectUri: window.location.origin + window.location.pathname + '/',
      });
    } else {
    }
  };
  keycloak
    .init({
      redirectUri: window.location.origin + window.location.pathname + "/",
      onLoad: initOptions.onLoad,
      checkLoginIframe: false,
      flow: "standard",

     });
}

export default initKeycloak;
