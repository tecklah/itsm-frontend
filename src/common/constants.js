const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const CREATE_SERVICE_REQUEST_URL = `${API_BASE_URL}/service-request`;
export const LIST_SERVICE_REQUEST_URL = `${API_BASE_URL}/service-request`;
export const CREATE_INCIDENT_TICKET_URL = `${API_BASE_URL}/incident-ticket`;
export const LIST_INCIDENT_TICKET_URL = `${API_BASE_URL}/incident-ticket`;
export const LOGIN_URL = `${API_BASE_URL}/login`;
export const CHAT_REQUEST_URL = `${API_BASE_URL}/chat-request`;
export const SERVICE_REQUEST_MAKE_DECISION_URL = `${API_BASE_URL}/service-request-make-decision`;
export const INCIDENT_TICKET_MAKE_DECISION_URL = `${API_BASE_URL}/incident-ticket-make-decision`;