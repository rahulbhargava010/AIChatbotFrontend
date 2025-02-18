import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "../Auth/ProtectedRoute";
import Login from "../Auth/Login";
import Dashboard from "../Dashboard/Dashboard";
import CreateChatbot from "../Dashboard/CreateChatbot";
import TrainChatbot from "../Dashboard/TrainChatbot";
import TestChatbot from "../Dashboard/TestChatbot";
import LeadsTable from "../Dashboard/LeadsTable";
import Conversations from "../Dashboard/Conversations";
import UpdateChatbot from "../Dashboard/UpdateChatbot";
import ChatbotWidget from "../Dashboard/ChatbotWidget";
import TemplateSelection from "../Dashboard/TemplateSelection";
import AdminAnalytics from "../Dashboard/AdminAnalytics";
import ChatStats from "../Dashboard/ChatStats";
import AuthForm from "../Auth/AuthForm";
import ResetPassword from "../Auth/ResetPassword";
import NotFound from "../Dashboard/NotFound";
import Navbar from "../Dashboard/Navbar";
import ProtectedLayout from "../Auth/ProtectedLayout";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthForm type="login" />} />
      <Route path="/" element={<AuthForm type="login" />} />
      <Route path="/signup" element={<AuthForm type="signup" />} />
      <Route
        path="/forgot-password"
        element={<AuthForm type="forgot-password" />}
      />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/chatbot-widget/:chatbotId" element={<ChatbotWidget />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          {" "}
          {/* Navbar will be included here */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/create-chatbot" element={<CreateChatbot />} />
          <Route
            path="/dashboard/train/:chatbotId"
            element={<TrainChatbot />}
          />
          <Route
            path="/dashboard/update/:chatbotId"
            element={<UpdateChatbot />}
          />
          <Route
            path="/dashboard/chatbot-test/:chatbotId"
            element={<TestChatbot />}
          />
          <Route
            path="/dashboard/conversations/:chatbotId"
            element={<Conversations />}
          />
          <Route
            path="/dashboard/select-template/:chatbotId"
            element={<TemplateSelection />}
          />
          <Route
            path="/dashboard/AdminAnalytics"
            element={<AdminAnalytics />}
          />
          <Route path="/dashboard/leads/:chatbotId" element={<LeadsTable />} />
          <Route path="/dashboard/stats/:chatbotId" element={<ChatStats />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
