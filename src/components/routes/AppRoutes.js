import { Routes, Route } from "react-router-dom";
import React from "react";
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
import ChatbotWidget2 from "../Dashboard/ChatbotWidget2";
import LandingPage from "../LandingPage/LandingPage"; // Import the new LandingPage component

import TemplateSelection from "../Dashboard/TemplateSelection";
import AdminAnalytics from "../Dashboard/AdminAnalytics";
import ChatStats from "../Dashboard/ChatStats";
import ResetPassword from "../Auth/ResetPassword";
import NotFound from "../Dashboard/NotFound";
import Navbar from "../Dashboard/Navbar";
import ProtectedLayout from "../Auth/ProtectedLayout";
import CompanyForm from "../Dashboard/CompanyForm";
import Signup from "../Auth/Signup";
import CompaniesList from "../Dashboard/CompaniesList";
import ViewCompany from "../Dashboard/ViewCompany";
import EditCompany from "../Dashboard/EditCompany";
import ForgotPassword from "../Auth/ForgotPassword";
import UserList from "../Dashboard/UserList";
import { NewDash } from "../Dashboard/NewDash";
import ChatbotCard from "../Dashboard/ChatbotCard";
import LeadDetails from "../Dashboard/LeadDetails";
import ChatbotList from "../Dashboard/ChatbotList";
import ModernChatbotWidget from "../Dashboard/ModernChatbotWidget";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Add the landing page as the root route */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      <Route path="/chatbot-widget/:chatbotId" element={<ChatbotWidget />} />
      <Route path="/chatbot-widget2/:chatbotId" element={<ChatbotWidget2 />} />
      <Route
        path="/chatbot-new-widget/:chatbotId"
        element={<ModernChatbotWidget />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/newDash" element={<NewDash />} />
          <Route path="/dashboard/create-chatbot" element={<CreateChatbot />} />
          <Route
            path="/dashboard/chatbot/:chatbotId"
            element={<ChatbotCard />}
          />
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
          {/* Protected Route for ps-owner only */}
          <Route element={<ProtectedRoute allowedRoles={["ps-owner"]} />}>
            <Route path="/dashboard/addCompany" element={<CompanyForm />} />
            <Route path="/dashboard/companyList" element={<CompaniesList />} />
            <Route path="/dashboard/userList" element={<UserList />} />
            <Route path="/dashboard/chatbotList" element={<ChatbotList />} />
            <Route
              path="/dashboard/companyList/company/:id"
              element={<ViewCompany />}
            />
            <Route
              path="/dashboard/companyList/edit-company/:id"
              element={<EditCompany />}
            />
          </Route>
          <Route path="/dashboard/leads/:chatbotId" element={<LeadsTable />} />
          <Route
            path="/dashboard/leads/leadDetails/:leadId"
            element={<LeadDetails />}
          />
          <Route path="/dashboard/stats/:chatbotId" element={<ChatStats />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
