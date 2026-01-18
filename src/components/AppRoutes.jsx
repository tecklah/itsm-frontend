import { Routes, Route, useLocation, Navigate } from "react-router";
import { 
  AddServiceRequest, 
  AddIncidentTicket,
  ListServiceRequest,
  ListIncidentTicket,
  Login,
  AddAgentChat
} from "../pages/index";

export default function AppRoutes() {
  const location = useLocation();
  
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login key={location.pathname + location.key} />} />
      <Route path="/listservicerequest" element={<ListServiceRequest key={location.pathname + location.key} />} />
      <Route path="/listincidentticket" element={<ListIncidentTicket key={location.pathname + location.key} />} />
      <Route path="/addservicerequest" element={<AddServiceRequest key={location.pathname + location.key} />} />
      <Route path="/addincidentticket" element={<AddIncidentTicket key={location.pathname + location.key} />} />
      <Route path="/agentchat" element={<AddAgentChat key={location.pathname + location.key} />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
};