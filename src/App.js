import { React } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Approved2List from "./components/Approved2List";
import ApprovedList from "./components/ApprovedList";
import ConfirmationPage from "./components/ConfirmationPage";
import Dashboard from "./components/Dashboard";
import ListingPage from "./components/ListingPage";
import LoginPage from "./components/LoginPage";
import MIS from "./components/MIS";
import Overview from "./components/Overview";

import { Screen } from "./components/Screen";
import { UserCreation } from "./components/UserCreation";
import PartyMasterUpdate from "./components/PartyMasterUpdate";
import APAgeing from "./components/APAgeing";
import Reports from "./components/Reports";
import AddExpense from "./components/AddExpense";
import CNPreApproval from "./components/CNPreApproval";
import CRListingPage from "./components/CRListingPage";
import CRApprovedList from "./components/CRApprovedList";
import CRApprovedList2 from "./components/CRApprovedList2";
import ExpenseList from "./components/ExpenseList";
import ViewExpense from "./components/ViewExpense";
import Transactions from "./components/Transactions";
import Test from "./components/Test";
import AccessDenied from "./components/AccessDenied";
import DayBookBranchWise from "./components/DayBookBranchWise";
import ARAgeing from "./components/ARAgeing";
import ARAgeingOS from "./components/ARAgeingOS";
import APAgeingOS from "./components/APAgeingOS";
import PartyLedger from "./components/PartyLedger";
import LedgerReport from "./components/LedgerReport";
import GSTR1Filling from "./components/GSTR1Filling";
import ProfitAndLoss from "./components/ProfitAndLoss";
import JobCard from "./components/JobCard";
import JobCostSheetDetails from "./components/JobCostSheetDetails";
import JobCostSheetSummary from "./components/JobCostSheetSummary";
import ExpandingCards from "./components/ExpandingCards";
import TaxInvoicePdf from "./components/TaxInvoicePdf";
import TaxInvoiceList from "./components/TaxInvoiceList";
import TaxInvoiceCommonTable from "./components/TaxInvoiceCommonTable";
import TTListingPage from "./components/TTListingPage";
import TTApprovedList from "./components/TTApprovedList";
import HeaderDetail from "./components/HeaderDetail";
import OrderAccept from "./components/OrderAccept";
import CRPendingList from "./components/CRPendingList";
import HDashboard from "./components/HDashboad";
import Dashboard1 from "./components/Dashboard1";
import WHListingPage from "./components/WHListingPage";
import WHApprovedList from "./components/WHApprovedList";
import Ticket from "./components/Ticket";
import { useState } from "react";
import CRStatus from "./components/CRStatus";
import PrivateRoute from "./components/PrivateRoute";
import PreGoals from "./components/PreGoals";
import SelfReview from "./components/SelfReview";
import AppraiserReview from "./components/AppraiserReview";
import PerformanceGoals from "./components/PerformanceGoals";
import PerformanceGoalsGD from "./components/PerformanceGoalsGD";
import EmployeeMaster from "./components/EmployeeMaster";
import AppraiserReviewGD from "./components/AppraiserReviewGD";
import PS from "./components/PS";
import PurchaseOrder from "./components/PurchaseOrder";
import PurchaseOrderPDF from "./components/PurchaseOrderPDF";
import ARCurrentOS from "./components/ARCurrentOS";
import DocumentMapping from "./components/DocumentMapping";
import DocType from "./components/DocType";
import EmployeeFileUpload from "./components/EmployeeFileUpload";
import EmailSender from "./components/EmailSender";

function App() {
  const [isSelected, setIsSelected] = useState(false);

  const handleCheckboxChange = () => {
    setIsSelected((prev) => !prev);
  };

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/access-denied" element={<AccessDenied />} />
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Dashboard />}>
              <Route path="overview" element={<Overview />} />
              <Route path="approvedlist" element={<ApprovedList />} />
              <Route path="TTapprovedlist" element={<TTApprovedList />} />
              <Route path="authenticate" element={<ConfirmationPage />} />
              <Route path="listing" element={<ListingPage />} />
              <Route path="TTlisting" element={<TTListingPage />} />
              <Route path="reports" element={<Reports />} />
              <Route path="screen" element={<Screen />} />
              <Route path="userCreation" element={<UserCreation />} />
              <Route path="approved2list" element={<Approved2List />} />
              <Route path="MIS" element={<MIS />} />
              <Route path="HeaderDetail" element={<HeaderDetail />} />
              <Route path="partyMasterUpdate" element={<PartyMasterUpdate />} />
              <Route path="APAgeing" element={<APAgeing />} />
              <Route path="AddExpense" element={<AddExpense />} />
              <Route path="HDashboard" element={<HDashboard />} />
              <Route path="WHListing" element={<WHListingPage />} />
              <Route path="WHApprovedList" element={<WHApprovedList />} />
              <Route path="CNPreApproval" element={<CNPreApproval />} />
              <Route path="CRlisting" element={<CRListingPage />} />
              <Route path="CRPendingList" element={<CRPendingList />} />
              <Route path="CRApprovedList" element={<CRApprovedList />} />
              <Route path="CRApprovedList2" element={<CRApprovedList2 />} />
              <Route path="ExpenseList" element={<ExpenseList />} />
              <Route path="ViewExpense" element={<ViewExpense />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="test" element={<Test />} />
              <Route path="DayBookBranchWise" element={<DayBookBranchWise />} />
              <Route path="ARAgeing" element={<ARAgeing />} />
              <Route path="ARAgeingOS" element={<ARAgeingOS />} />
              <Route path="APAgeingOS" element={<APAgeingOS />} />
              <Route path="PartyLedger" element={<PartyLedger />} />
              <Route path="LedgerReport" element={<LedgerReport />} />
              <Route path="GSTR1Filling" element={<GSTR1Filling />} />
              <Route path="ProfitAndLoss" element={<ProfitAndLoss />} />
              <Route path="ticket" element={<Ticket />} />
              <Route path="JobCard" element={<JobCard />} />
              <Route path="CRStatus" element={<CRStatus />} />
              <Route path="PS" element={<PS />} />
              <Route path="PurchaseOrder" element={<PurchaseOrder />} />
              <Route path="PurchaseOrderPDF" element={<PurchaseOrderPDF />} />
              <Route path="ARCurrentOS" element={<ARCurrentOS />} />
              <Route path="DocumentMapping" element={<DocumentMapping />} />
              <Route path="DocType" element={<DocType />} />
              <Route path="EmailSender" element={<EmailSender />} />

              <Route
                path="EmployeeFileUpload"
                element={<EmployeeFileUpload />}
              />

              <Route
                path="JobCostSheetDetails"
                element={<JobCostSheetDetails />}
              />
              <Route
                path="JobCostSheetSummary"
                element={<JobCostSheetSummary />}
              />
              <Route path="ExpandingCards" element={<ExpandingCards />} />
              <Route path="TaxInvoicePdf" element={<TaxInvoicePdf />} />
              <Route path="OrderAccept" element={<OrderAccept />} />
              <Route path="Dashboard1" element={<Dashboard1 />} />
              <Route path="TaxInvoiceList" element={<TaxInvoiceList />} />
              <Route path="PreGoals" element={<PreGoals />} />
              <Route path="SelfReview" element={<SelfReview />} />
              <Route path="AppraiserReview" element={<AppraiserReview />} />
              <Route path="PerformanceGoals" element={<PerformanceGoals />} />
              <Route path="EmployeeMaster" element={<EmployeeMaster />} />

              <Route path="AppraiserReviewGD" element={<AppraiserReviewGD />} />
              <Route
                path="PerformanceGoalsGD"
                element={<PerformanceGoalsGD />}
              />

              <Route
                path="/TaxInvoiceCommonTable"
                element={<TaxInvoiceCommonTable />}
              />
              <Route
                path="/TaxInvoicePdf/:documentNumber"
                element={<TaxInvoicePdf />}
              />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
