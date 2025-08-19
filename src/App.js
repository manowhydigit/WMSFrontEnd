import { React } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

import ConfirmationPage from "./components/ConfirmationPage";
import Dashboard from "./components/Dashboard";

import LoginPage from "./components/LoginPage";

import Overview from "./components/Overview";

import { Screen } from "./components/Screen";
import { UserCreation } from "./components/UserCreation";

import Reports from "./components/Reports";

import Transactions from "./components/Transactions";

import AccessDenied from "./components/AccessDenied";

import OrderAccept from "./components/OrderAccept";

import HDashboard from "./components/HDashboad";
import Dashboard1 from "./components/Dashboard1";

import { useState } from "react";

import PrivateRoute from "./components/PrivateRoute";

import EmployeeMaster from "./components/EmployeeMaster";

import DocumentMapping from "./components/DocumentMapping";
import DocType from "./components/DocType";
import EmployeeFileUpload from "./components/EmployeeFileUpload";
import EmailSender from "./components/EmailSender";
import GRN from "./components/GRN";
import GlobalSection from "./components/GlobalSection";
import Putaway from "./components/Putaway";
import BuyerOrder from "./components/BuyerOrder";
import PickRequest from "./components/PickRequest";
import InBound from "./components/InBound";
import OutBound from "./components/OutBound ";
import Customer from "./components/Customer";
import Buyer from "./components/Buyer";
import Carrier from "./components/Carrier";
import Masters from "./components/Masters";
import Supplier from "./components/Supplier";
import SetUp from "./components/SetUp";
import Item from "./components/Item";
import Unit from "./components/Unit";
import FinYear from "./components/FinYear";
import CellType from "./components/CellType";
import Employee from "./components/Employee";
import ExternalDataMismatch from "./components/ExternalDataMismatch";
import LocationType from "./components/LocationType";
import LocationMapping from "./components/LocationMapping";
import Warehouse from "./components/Warehouse";
import WarehouseLocation from "./components/WarehouseLocation";
import DeliveryChallan from "./components/DeliveryChallen";
import PendingBuyerOrder from "./components/PendingBuyerOrder";
import PendingPickRequest from "./components/PendingPickRequest";
import ReversePick from "./components/ReversePick";
import SalesReturn from "./components/SalesReturn";
import CodeConversion from "./components/CodeConversion";
import CycleCount from "./components/CycleCount";
import LocationMovement from "./components/LocationMovement";
import OpeningStock from "./components/OpeningStock";
import StockRestate from "./components/StockRestate";
import StockMovements from "./components/StockMovements";
import Kitting from "./components/Kitting";
import DeKitting from "./components/DeKitting";
import GatePassIn from "./components/GatePassIn";

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

              <Route path="authenticate" element={<ConfirmationPage />} />

              <Route path="reports" element={<Reports />} />
              <Route path="screen" element={<Screen />} />
              <Route path="userCreation" element={<UserCreation />} />

              <Route path="transactions" element={<Transactions />} />

              <Route path="DocumentMapping" element={<DocumentMapping />} />
              <Route path="DocType" element={<DocType />} />
              <Route path="EmailSender" element={<EmailSender />} />

              <Route path="Dashboard1" element={<Dashboard1 />} />
              <Route path="GlobalSection" element={<GlobalSection />} />

              <Route path="EmployeeMaster" element={<EmployeeMaster />} />
              <Route path="GatePassIn" element={<GatePassIn />} />
              <Route path="GRN" element={<GRN />} />
              <Route path="Putaway" element={<Putaway />} />
              <Route path="BuyerOrder" element={<BuyerOrder />} />
              <Route path="PickRequest" element={<PickRequest />} />
              <Route path="InBound" element={<InBound />} />
              <Route path="OutBound" element={<OutBound />} />
              <Route path="StockMovements" element={<StockMovements />} />

              <Route path="Customer" element={<Customer />} />
              <Route path="Buyer" element={<Buyer />} />
              <Route path="Carrier" element={<Carrier />} />
              <Route path="Masters" element={<Masters />} />
              <Route path="Supplier" element={<Supplier />} />
              <Route path="SetUp" element={<SetUp />} />
              <Route path="Item" element={<Item />} />
              <Route path="Unit" element={<Unit />} />
              <Route path="FinYear" element={<FinYear />} />
              <Route path="CellType" element={<CellType />} />
              <Route path="DocumentMapping" element={<DocumentMapping />} />
              <Route path="Employee" element={<Employee />} />
              <Route path="LocationType" element={<LocationType />} />
              <Route path="LocationMapping" element={<LocationMapping />} />
              <Route path="Warehouse" element={<Warehouse />} />
              <Route path="WarehouseLocation" element={<WarehouseLocation />} />
              <Route path="DeliveryChallan" element={<DeliveryChallan />} />
              <Route path="PendingBuyerOrder" element={<PendingBuyerOrder />} />
              <Route
                path="PendingPickRequest"
                element={<PendingPickRequest />}
              />

              <Route path="ReversePick" element={<ReversePick />} />
              <Route path="SalesReturn" element={<SalesReturn />} />
              <Route path="CodeConversion" element={<CodeConversion />} />
              <Route path="CycleCount" element={<CycleCount />} />
              <Route path="LocationMovement" element={<LocationMovement />} />
              <Route path="OpeningStock" element={<OpeningStock />} />
              <Route path="StockRestate" element={<StockRestate />} />
              <Route path="Kitting" element={<Kitting />} />
              <Route path="DeKitting" element={<DeKitting />} />

              {/* <Route
                path="ExternalDataMismatch"
                element={<ExternalDataMismatch />}
              /> */}
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
