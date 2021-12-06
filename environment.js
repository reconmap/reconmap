window.env = {
    REACT_APP_SECURE_TRANSPORT_ENABLED: false,

    // Reconmap API's URL including protocol and port but not trailing slash
    REACT_APP_DEFAULT_API_URL: 'http://localhost:5510',

    // hostname:port for the Reconmap's notifications service
    REACT_APP_NOTIFICATIONS_SERVICE_HOST_PORT: 'localhost:5520',

    // hostname:port for the Reconmap's agent service
    REACT_APP_AGENT_SERVICE_HOST_PORT: 'localhost:5520',

    // Web application context path e.g. / (for http://127.0.0.1:5500) or /reconmap (for http://127.0.0.1:5500/reconmap)
    // REACT_APP_CONTEXT_PATH: '/reconmap'
};
