import { MicNone } from "@mui/icons-material";
import { experimentalStyled } from "@mui/material";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8091";

const branchName = null;
const fromDate = null;
const toDate = null;
const status = null;
const userId = null;

const div = null;
const branchname = null;
const ptype = null;
const sbcode = null;
const slab1 = null;
const slab2 = null;
const slab3 = null;
const slab4 = null;
const slab5 = null;
const slab6 = null;
const slab7 = null;
const asondt = null;

export const getadminListingData = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getadminPendingDetails?userName=${localStorage.getItem(
        "userName"
      )}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.getadminPendingDetails
    ) {
      return response.data.paramObjectsMap.getadminPendingDetails.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.gstInvoiceHdrId,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getListingData = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getPendingDetails?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.pendingApprovalDetails
    ) {
      return response.data.paramObjectsMap.pendingApprovalDetails.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.gstInvoiceHdrId,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getARCurrentOS = async (UtPer) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getCurrentOS?UtPer=${UtPer}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.getcurrentos) {
      return response.data.paramObjectsMap.getcurrentos.map((item) => ({
        subledgername: item.subledgername,
        subledgercode: item.subledgercode,
        creditdays: item.creditdays,
        creditlimit: item.creditlimit
          ? new Intl.NumberFormat("en-IN").format(item.creditlimit)
          : "0",
        outStanding: item.outStanding,
        ctrloffice: item.ctrloffice,
        totdue: item.totdue
          ? new Intl.NumberFormat("en-IN").format(item.totdue)
          : "0",
        creditutipct: item.creditutipct,
        category: item.category,
        salesperson: item.salesperson,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getTTListingData = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/TTInvoiceApproval/getPendingDetails?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.pendingApprovalDetails
    ) {
      return response.data.paramObjectsMap.pendingApprovalDetails.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.TTInvoiceHdrId,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getAdminTTListingData = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/TTInvoiceApproval/getAdminPendingDetails?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.getAdminPendingDetails
    ) {
      return response.data.paramObjectsMap.getAdminPendingDetails.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.TTInvoiceHdrId,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getWHListingData = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/WHInvoiceApproval/getPendingDetails?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.pendingApprovalDetails
    ) {
      return response.data.paramObjectsMap.pendingApprovalDetails.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.WHInvoiceHdrId,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getWHAdminListingData = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/WHInvoiceApproval/getAdminPendingDetails?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.getAdminPendingDetails
    ) {
      return response.data.paramObjectsMap.getAdminPendingDetails.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.WHInvoiceHdrId,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getCRListingData = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/crpreapp/getCRPendingDetails?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.pendingApprovalDetails
    ) {
      return response.data.paramObjectsMap.pendingApprovalDetails.map(
        (item) => ({
          profoma: item.profoma,
          vchNo: item.vchNo,
          reason: item.reason,
          invAmt: item.invAmt,
          vchDt: item.vchDt
            ? new Date(item.vchDt).toLocaleDateString("en-GB")
            : "",
          crRemarks: item.crRemarks,
          partyCode: item.partyCode,
          partyName: item.partyName,
          pType: item.pType,
          branchName: item.branchName,
          id: item.gst_precreditId,
          crAmt: item.crAmt,
          dDays: item.dDays,
          osbcd: item.osbcd,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit
            ? new Intl.NumberFormat("en-IN").format(item.creditLimit)
            : "0",
          controllingOffice: item.controllingOffice,
          salesPersonName: item.salesPersonName,
          category: item.category,
          totDue: item.totDue
            ? new Intl.NumberFormat("en-IN").format(item.totDue)
            : "0",
          description: item.description,
          plImpact: item.plImpact,
          documentsRequired: item.documentsRequired,
          totchargeamtlc: item.totchargeamtlc,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getCRListing2Data = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/crpreapp/getCRPending2Details?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.pendingApprovalDetails
    ) {
      return response.data.paramObjectsMap.pendingApprovalDetails.map(
        (item) => ({
          profoma: item.profoma,
          vchNo: item.vchNo,
          reason: item.reason,
          invAmt: item.invAmt,
          vchDt: item.vchDt
            ? new Date(item.vchDt).toLocaleDateString("en-GB")
            : "",
          crRemarks: item.crRemarks,
          partyCode: item.partyCode,
          partyName: item.partyName,
          pType: item.pType,
          branchName: item.branchName,
          id: item.gst_precreditId,
          crAmt: item.crAmt,
          dDays: item.dDays,
          osbcd: item.osbcd,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit
            ? new Intl.NumberFormat("en-IN").format(item.creditLimit)
            : "0",
          controllingOffice: item.controllingOffice,
          salesPersonName: item.salesPersonName,
          category: item.category,
          description: item.description,
          plImpact: item.plImpact,
          documentsRequired: item.documentsRequired,
          totchargeamtlc: item.totchargeamtlc,
          // ? new Intl.NumberFormat("en-IN").format(item.totchargeamtlc)
          // : "0",
          totDue: item.totDue
            ? new Intl.NumberFormat("en-IN").format(item.totDue)
            : "0",
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getCRDetailsApprove1 = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/crpreapp/getCRDetailsApprove1?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.approvedApprovalDetails1
    ) {
      return response.data.paramObjectsMap.approvedApprovalDetails1.map(
        (item) => ({
          profoma: item.profoma,
          vchNo: item.vchNo,
          reason: item.reason,
          invAmt: item.invAmt,
          vchDt: item.vchDt
            ? new Date(item.vchDt).toLocaleDateString("en-GB")
            : "",
          crRemarks: item.crRemarks,
          partyCode: item.partyCode,
          partyName: item.partyName,
          pType: item.pType,
          branchName: item.branchName,
          gst_precreditId: item.gst_precreditId,
          crAmt: item.crAmt,
          dDays: item.dDays,
          osbcd: item.osbcd,
          creditDays: item.creditDays,
          approve1: item.approve1,
          approve2: item.approve2,
          rejectremarks: item.rejectremarks,
          approve1name: item.approve1name,
          approve1on: item.approve1on
            ? new Date(item.approve1on).toLocaleDateString("en-GB")
            : "",
          approve2name: item.approve2name,
          approve2on: item.approve2on
            ? new Date(item.approve2on).toLocaleDateString("en-GB")
            : "",
          creditLimit: item.creditLimit
            ? new Intl.NumberFormat("en-IN").format(item.creditLimit)
            : "0",
          controllingOffice: item.controllingOffice,
          salesPersonName: item.salesPersonName,
          category: item.category,
          totDue: item.totDue
            ? new Intl.NumberFormat("en-IN").format(item.totDue)
            : "0",
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getCRDetailsApprove2 = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/crpreapp/getCRDetailsApprove2?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.approvedApprovalDetails2
    ) {
      return response.data.paramObjectsMap.approvedApprovalDetails2.map(
        (item) => ({
          profoma: item.profoma,
          vchNo: item.vchNo,
          reason: item.reason,
          invAmt: item.invAmt,
          vchDt: item.vchDt
            ? new Date(item.vchDt).toLocaleDateString("en-GB")
            : "",
          crRemarks: item.crRemarks,
          partyCode: item.partyCode,
          partyName: item.partyName,
          pType: item.pType,
          branchName: item.branchName,
          gst_precreditId: item.gst_precreditId,
          crAmt: item.crAmt,
          dDays: item.dDays,
          osbcd: item.osbcd,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit
            ? new Intl.NumberFormat("en-IN").format(item.creditLimit)
            : "0",
          controllingOffice: item.controllingOffice,
          salesPersonName: item.salesPersonName,
          category: item.category,
          totDue: item.totDue
            ? new Intl.NumberFormat("en-IN").format(item.totDue)
            : "0",
          approve1: item.approve1,
          approve1name: item.approve1name,
          approve1on: item.approve1on
            ? new Date(item.approve1on).toLocaleDateString("en-GB")
            : "",
          approve2: item.approve2,
          approve2name: item.approve2name,
          approve2on: item.approve2on
            ? new Date(item.approve2on).toLocaleDateString("en-GB")
            : "",
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getTTInvDetailsApprove1 = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/TTInvoiceApproval/getTTInvDetailsApprove1?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.approvedApprovalDetails1
    ) {
      return response.data.paramObjectsMap.approvedApprovalDetails1.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.gstInvoiceHdrId,
          approved1on: item.approve1on,
          approved2on: item.approve2on,
          approved3on: item.approve3on,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getWHInvDetailsApprove1 = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/WHInvoiceApproval/getWHInvDetailsApprove1?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.approvedApprovalDetails1
    ) {
      return response.data.paramObjectsMap.approvedApprovalDetails1.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.WHInvoiceHdrId,
          approved1on: item.approve1on,
          approved2on: item.approve2on,
          approved3on: item.approve3on,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getInvDetailsApprove1 = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getInvDetailsApprove1?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.approvedApprovalDetails1
    ) {
      return response.data.paramObjectsMap.approvedApprovalDetails1.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.gstInvoiceHdrId,
          approved1on: item.approve1on,
          approved2on: item.approve2on,
          approved3on: item.approve3on,
          eligiSlab: item.eligiSlab,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getInvDetailsApprove2 = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getInvDetailsApprove2?userType=${localStorage.getItem(
        "userType"
      )}&userName=${localStorage.getItem("userName")}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.approvedApprovalDetails2
    ) {
      return response.data.paramObjectsMap.approvedApprovalDetails2.map(
        (item) => ({
          expenceId: item.docId,
          name: item.partyName,
          amount: item.totalInvAmtLc,
          currency: "INR", // Assuming it's always INR; adjust if needed.
          docId: item.docId,
          docDate: item.docDate,
          creditDays: item.creditDays,
          creditLimit: item.creditLimit,
          outStanding: item.outStanding,
          id: item.gstInvoiceHdrId,
          approved1on: item.approve1on,
          approved2on: item.approve2on,
          approved3on: item.approve3on,
          eligiSlab: item.eligiSlab,
          totalInvAmtLc: item.totalInvAmtLc,
          slabRemarks: item.slabRemarks,
          exceedDays: item.exceedDays,
          unApproveAmt: item.unApproveAmt,
          category: item.category,
          controllingOffice: item.controllingOffice,
          osBeyond: item.osBeyond,
          excessCredit: item.excessCredit,
          salespersonName: item.salespersonName,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error;
  }
};

export const getCRReasons = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(`${API_URL}/api/crpreapp/getCRReasons`);

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.crReasons) {
      return response.data.paramObjectsMap.crReasons.map((item) => ({
        id: item.gst_cnreasonId,
        crReason: item.crReason,
        description: item.description,
        documentsRequired: item.documentsRequired,
        plImpact: item.plImpact,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getApprove1Db = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getApprove1Db?userName=${localStorage.getItem(
        "userName"
      )}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.getApprove1Db) {
      return response.data.paramObjectsMap.getApprove1Db.map((item) => ({
        cnUnApprove: item.cnUnApprove,
        invApprove: item.invApprove,
        cnApprove: item.cnApprove,
        invUnApprove: item.invUnApprove,
      }));
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getGoalsByUserName = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/pregoals/getPreGoals?userName=${localStorage.getItem(
        "userName"
      )}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.getPreGoals) {
      return response.data.paramObjectsMap.getPreGoals.map((item) => ({
        empname: item.empname,
        gst_pregoalsid: item.gst_pregoalsid,
        appraisalYear: item.appraisalYear,
        empcode: item.empcode,
      }));
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getGoalsById = async (id) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/pregoals/getPreGoalsDetails?id=${id})}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.getPreGoalsDetails) {
      return response.data.paramObjectsMap.getPreGoalsDetails.map((item) => ({
        area: item.area,
        gst_pregoalsid: item.gst_pregoalsid,
        goal: item.goal,
        selfinput: item.selfinput,
      }));
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const fetchEmployees = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/employeemaster/getAllEmployees`
    );

    if (response.data && response.data.paramObjectsMap?.empMasVO) {
      return response.data.paramObjectsMap.empMasVO.map((emp) => ({
        id: emp.mg_employeemasterid || emp.id || "",
        employee: emp.employee || "", // Fallback for null
        code: emp.code || "",
        dob: emp.dob || "",
        doj: emp.doj || "",
        department: emp.department || "Unknown",
        designation: emp.designation || "Unknown",
        lvl: emp.lvl || "",
        reportingto: emp.reportingto || "",
        reportingtocode: emp.reportingtocode || "",
        active: emp.active === "true",
        attachment: emp.attachment || null,
        branch: emp.branch,
        mailid: emp.mailid,
        mobile: emp.mobile,
      }));
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getPeformanceGoalsByUserName = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/performancegoals/getPerformanceGoals?userName=${localStorage.getItem(
        "userName"
      )}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.getPerformanceGoals) {
      return response.data.paramObjectsMap.getPerformanceGoals.map((item) => ({
        empname: item.empname,
        gst_performancegoalsid: item.gst_performancegoalsid,
        appraisalYear: item.appraisalYear,
        empcode: item.empcode,
      }));
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getPerfomanceGoalsById = async (id) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/performancegoals/getPerformanceGoalsDetails?id=${id})}`
    );

    // Ensure that the response contains the expected structure
    if (
      response.data &&
      response.data.paramObjectsMap?.getPerformanceGoalsDetails
    ) {
      return response.data.paramObjectsMap.getPerformanceGoalsDetails.map(
        (item) => ({
          perspective: item.perspective,
          objectivedesc: item.objectivedesc,
          perassigned: item.perassigned,
          measurement: item.measurement,
          qtrtarget: item.qtrtarget,
          performance: item.performance,
          comments: item.comments,
          selfrating: item.selfrating,
          appraiserrating: item.appraiserrating,
          gst_performancegoalsid: item.gst_performancegoalsid,
        })
      );
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getApprove1TblDb = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getApprove1TblDb?userName=${localStorage.getItem(
        "userName"
      )}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.getApprove1TblDb) {
      return response.data.paramObjectsMap.getApprove1TblDb.map((item) => ({
        branchCode: item.branchCode,
        cnUnApprove: item.cnUnApprove,
        invApprove: item.invApprove,
        cnApprove: item.cnApprove,
        invUnApprove: item.invUnApprove,
      }));
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getApprove1ChartDb = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getApprove1ChartDb?userName=${localStorage.getItem(
        "userName"
      )}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.getApprove1ChartDb) {
      return response.data.paramObjectsMap.getApprove1ChartDb.map((item) => ({
        partyName: item.partyName,
        cnApprove: item.cnApprove,
        cnUnApprove: item.cnUnApprove,
      }));
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getHaiCustomerRankDetails = async (pName, pType) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getHaiCustomerRankDetails?pName=${pName}&pType=${pType}
      `
    );

    // Ensure that the response contains the expected structure
    if (
      response.data &&
      response.data.paramObjectsMap?.gethaiCustomerRankDetails
    ) {
      return response.data.paramObjectsMap.gethaiCustomerRankDetails.map(
        (item) => ({
          customer: item.customer,
          mon: item.mon,
          totJob: item.totJob,
          income: item.income,
          profit: item.profit,
          r: item.r,
        })
      );
    } else {
      throw new Error("DB not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DB data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

// export const getAllUsers = async (userId) => {
//   try {
//     // Corrected the endpoint URL and closing braces issue
//     const response = await axios.get(
//       `${API_URL}/api/auth/allUsers?userId=${userId}`
//     );

//     // Ensure that the response contains the expected structure
//     if (response.data && response.data.paramObjectsMap?.userVO) {
//       return response.data.paramObjectsMap.userVO.map((item) => ({
//         id: item.id,
//         userName: item.userName,
//         nickName: item.nickName,
//         email: item.email,
//       }));
//     } else {
//       throw new Error("Data not found or API error");
//     }
//   } catch (error) {
//     console.error("Error fetching listing data:", error);
//     throw error; // Re-throw error to propagate it to the caller
//   }
// };

export const getAllHeaderDetails = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/HeaderDetail/getAll`);

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.headerVO) {
      // Map the filtered and transformed data and return it
      return response.data.paramObjectsMap.headerVO.map((item) => ({
        id: item.id,
        docdt: item.docDt,
        docid: item.docId,
        total: item.total,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getAllHeaderDetailsById = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/HeaderDetail/getById?id=${id}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    // Ensure the response has the expected structure
    if (response.data.status && response.data.paramObjectsMap?.headerVO) {
      const headerVO = response.data.paramObjectsMap.headerVO;

      // If you want to map the 'headerDetail' array
      const headerDetails = headerVO.headerDetail.map((item) => ({
        id: item.id,
        category: item.category,
        description: item.description,
        rate: item.rate,
        qty: item.qty,
        amount: item.amount,
      }));

      return {
        headerId: headerVO.id,
        docId: headerVO.docId,
        docDt: headerVO.docDt,
        cancel: headerVO.cancel,
        createdBy: headerVO.createdBy,
        modifiedBy: headerVO.modifiedBy,
        headerDetails, // The list of details
      };
    } else {
      throw new Error("HeaderVO not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Header details:", error);
    throw error;
  }
};

export const getAllActiveUsers = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/auth/getUserById?userId=${userId}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.userVO) {
      // Filter the users by active status
      const activeUsers = response.data.paramObjectsMap.userVO.filter(
        (item) => item.active === "Active"
      );

      // Map the filtered users to the required format
      return activeUsers.map((item) => ({
        id: item.id,
        userName: item.userName,
        nickName: item.nickName,
        email: item.email,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching listing data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getAllScreens = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(`${API_URL}/api/auth/getAllScreenNames`);

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.screenNamesVO) {
      return response.data.paramObjectsMap.screenNamesVO.map((item) => ({
        id: item.id,
        screenName: item.screenName,
        screenCode: item.screenCode,
        active: item.active,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Screen List:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getAllRoles = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(`${API_URL}/api/auth/allActiveRoles`);

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.rolesVO) {
      return response.data.paramObjectsMap.rolesVO.map((item) => ({
        id: item.id,
        role: item.role,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Roles List:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getAllResponsiblities = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(`${API_URL}/api/auth/allResponsibility`);

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.responsibilityVO) {
      return response.data.paramObjectsMap.responsibilityVO.map((item) => ({
        id: item.id,
        responsibility: item.responsibility,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Responsibilities List:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getUserBranch = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/user/getBranchCodeByUser?userName=${localStorage.getItem(
        "userName"
      )}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.userVO) {
      return response.data.paramObjectsMap.userVO.map((item) => ({
        branchCode: item.branchCode,
        branchName: item.branchName,
        userName: item.userName,
      }));
    } else {
      throw new Error("User Branch not found or API error");
    }
  } catch (error) {
    console.error("Error fetching User Branch data:", error);
    throw error;
  }
};

export const getGSTR1Parties = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getGSTR1Parties`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.GSTR1PartiesDetails) {
      return response.data.paramObjectsMap.GSTR1PartiesDetails.map((item) => ({
        party_name: item.party_name,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching AP Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getAllAPParties = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getAllAPParties`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.partyDetails) {
      return response.data.paramObjectsMap.partyDetails.map((item) => ({
        subledgerName: item.subledgerName,
        subledgerCode: item.subledgerCode,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching AP Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getAllARParties = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getAllARParties`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.partyDetails) {
      return response.data.paramObjectsMap.partyDetails.map((item) => ({
        subledgerName: item.subledgerName,
        subledgerCode: item.subledgerCode,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching AP Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getPartyLedgerPartyName = async (pType) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getPartyLedgerPartyName?pType=${pType}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.plParties) {
      return response.data.paramObjectsMap.plParties.map((item) => ({
        subledgerName: item.subledgerName,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getHaiBranchCustomerDetails = async (pName, pType) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getHaiBranchCustomerDetails?pName=${pName}&pType=${pType}`
    );

    // Ensure that the response contains the expected structure
    if (
      response.data &&
      response.data.paramObjectsMap?.gethaiBranchCustomerDetails
    ) {
      return response.data.paramObjectsMap.gethaiBranchCustomerDetails.map(
        (item) => ({
          partyName: item.partyName,
          partyCode: item.partyCode,
          onYear: item.onYear,
          category: item.category,
          creditLimit: item.creditLimit,
          creditDays: item.creditDays,
          salesPersonName: item.salesPersonName,
          ctrlOffice: item.ctrlOffice,
          totDue: item.totDue,
          branchCode: item.branchCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getHaiCustomerDetails = async (pName, pType) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getHaiCustomerDetails?pName=${pName}&pType=${pType}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.gethaiCustomerDetails) {
      return response.data.paramObjectsMap.gethaiCustomerDetails.map(
        (item) => ({
          partyName: item.partyName,
          partyCode: item.partyCode,
          onYear: item.onYear,
          category: item.category,
          creditLimit: item.creditLimit,
          creditDays: item.creditDays,
          salesPersonName: item.salesPersonName,
          ctrlOffice: item.ctrlOffice,
          totDue: item.totDue,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getHaiProductSummary = async (product) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getHaiProductSummary?product=${product}`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.gethaiProductSummary) {
      return response.data.paramObjectsMap.gethaiProductSummary.map((item) => ({
        jobs: item.jobs,
        openJobs: item.openJobs,
        closedJobs: item.closedJobs,
        partyName: item.partyName,
        salesPersonName: item.salesPersonName || null,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getHaiInvCustomerDetails = async (pName, pType) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getHaiInvCustomerDetails?pName=${pName}&pType=${pType}`
    );

    // Ensure that the response contains the expected structure
    if (
      response.data &&
      response.data.paramObjectsMap?.gethaiInvCustomerDetails
    ) {
      return response.data.paramObjectsMap.gethaiInvCustomerDetails.map(
        (item) => ({
          screen: item.screen,
          crdOn: item.crdOn,
          amt: item.amt,
          partyCode: item.partyCode,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getHaiCustomerYearProfit = async (pName, pType) => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getHaiCustomerYearProfit?pName=${pName}&pType=${pType}`
    );

    // Ensure that the response contains the expected structure
    if (
      response.data &&
      response.data.paramObjectsMap?.gethaiCustomerYearProfit
    ) {
      return response.data.paramObjectsMap.gethaiCustomerYearProfit.map(
        (item) => ({
          customer: item.customer,
          apr: item.apr,
          may: item.may,
          jun: item.jun,
          jul: item.jul,
          aug: item.aug,
          sep: item.sep,
          oct: item.oct,
          nov: item.nov,
          dec: item.dec,
          jan: item.jan,
          feb: item.feb,
          mar: item.mar,
        })
      );
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getPartyLedger = async (
  branchName,
  sbcode,
  fromdate,
  todate,
  ptype,
  div
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getPartyLedger?branchName=${branchName}&sbcode=${sbcode}&fromdate=${fromdate}&todate=${todate}&subledgerType=${ptype}&WithDet=${div}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.pldetails) {
      return response.data.paramObjectsMap.pldetails.map((item) => ({
        docid: item.docid,
        docDate: item.docDate
          ? new Date(item.docDate).toLocaleDateString("en-GB")
          : " ",
        refNo: item.refNo,
        refDate: item.refDate
          ? new Date(item.refDate).toLocaleDateString("en-GB")
          : " ",
        suppRefNo: item.suppRefNo,
        suppRefDate: item.suppRefDate
          ? new Date(item.suppRefDate).toLocaleDateString("en-GB")
          : " ",
        subledgerCode: item.subledgerCode,
        subledgerName: item.subledgerName,
        subledger: item.subledger,
        currency: item.currency,
        opbal:
          item.opbal === "0.00" || item.opbal === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.opbal),
        dbAmount:
          item.dbAmount === "0.00" || item.dbAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.dbAmount),
        crAmount:
          item.crAmount === "0.00" || item.crAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.crAmount),
        billDbAmount:
          item.billDbAmount === "0.00" || item.billDbAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.billDbAmount),
        billCrAmount:
          item.billCrAmount === "0.00" || item.billCrAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.billCrAmount),
        particulars: item.particulars,
        sno: item.sno,
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getTrailBalance = async (
  branchName,
  finyr,
  fromdate,
  todate,
  div
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getTrailBalance?branchName=${branchName}&finyr=${finyr}&fromdate=${fromdate}&todate=${todate}&WithDet=${div}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.tbdetails) {
      return response.data.paramObjectsMap.tbdetails.map((item) => ({
        groupName: item.groupName,
        accountCode: item.accountCode,
        accountName: item.accountName,
        subledgerCode: item.subledgerCode,
        subledgerName: item.subledgerName,
        odBalAmount:
          item.odBalAmount === "0.00" || item.odBalAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.odBalAmount),
        ocrAmount:
          item.ocrAmount === "0.00" || item.ocrAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.ocrAmount),
        tdBalAmount:
          item.tdBalAmount === "0.00" || item.tdBalAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.tdBalAmount),
        tcrAmount:
          item.tcrAmount === "0.00" || item.tcrAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.tcrAmount),
        cdBalAmount:
          item.cdBalAmount === "0.00" || item.cdBalAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.cdBalAmount),
        ccrAmount:
          item.ccrAmount === "0.00" || item.ccrAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.ccrAmount),
      }));
    } else {
      throw new Error("TB Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching TB data:", error);
    throw error;
  }
};

export const getProfitAndLoss = async (branchName, fromdate, todate) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getProfitAndLoss?branchName=${branchName}&fromdate=${fromdate}&todate=${todate}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.pldetails) {
      return response.data.paramObjectsMap.pldetails.map((item) => ({
        type: item.type,
        pTitle: item.pTitle,
        sTitle: item.sTitle,
        groupName: item.groupName,
        amt: item.amt,
        accountName: item.accountName,
        amount: item.amt
          ? new Intl.NumberFormat("en-IN").format(item.amt)
          : "0",
      }));
    } else {
      throw new Error("TB Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching TB data:", error);
    throw error;
  }
};

export const getLedgerAccountName = async () => {
  try {
    // Corrected the endpoint URL and closing braces issue
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getLedgerAccountName`
    );

    // Ensure that the response contains the expected structure
    if (response.data && response.data.paramObjectsMap?.accDetail) {
      return response.data.paramObjectsMap.accDetail.map((item) => ({
        accountName: item.accountName,
      }));
    } else {
      throw new Error("Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Party data:", error);
    throw error; // Re-throw error to propagate it to the caller
  }
};

export const getLedgerReport = async (
  branchName,
  accountName,
  fromdate,
  todate,
  div
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getLedgerReport?branchName=${branchName}&accountName=${accountName}&fromdate=${fromdate}&todate=${todate}&WithDet=${div}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.lrdetails) {
      return response.data.paramObjectsMap.lrdetails.map((item) => ({
        voucherNumber: item.voucherNumber,
        voucherDate: item.voucherDate
          ? new Date(item.voucherDate).toLocaleDateString("en-GB")
          : " ",
        Manme: item.Manme,
        subledgerName: item.subledgerName,
        particulars: item.particulars,
        currency: item.currency,
        opbal:
          item.opbal === "0.00" || item.opbal === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.opbal),
        dbAmount:
          item.dbAmount === "0.00" || item.dbAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.dbAmount),
        crAmount:
          item.crAmount === "0.00" || item.crAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.crAmount),
        nDbAmount:
          item.nDbAmount === "0.00" || item.nDbAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.nDbAmount),
        nCrAmount:
          item.nCrAmount === "0.00" || item.nCrAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.nCrAmount),
        particulars: item.particulars,
        sno: item.ids,
        narration: item.narration,
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getGSTR1Filling = async (branchName, sbcode, fromdate, todate) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getGSTR1Filling?branchName=${branchName}&sbcode=${sbcode}&fromdate=${fromdate}&todate=${todate}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.GSTR1details) {
      return response.data.paramObjectsMap.GSTR1details.map((item) => ({
        gstin: item.gstin,
        branchCode: item.branchCode,
        caption: item.caption,
        bizType: item.bizType,
        irnServiceType: item.irnServiceType,
        vchNo: item.vchNo,
        vchDt: item.vchDt
          ? new Date(item.vchDt).toLocaleDateString("en-GB")
          : " ",
        docId: item.docId,
        docDt: item.docDt
          ? new Date(item.docDt).toLocaleDateString("en-GB")
          : " ",
        partyCode: item.partyCode,
        partyType: item.partyType,
        partyName: item.partyName,
        pgstin: item.pgstin,
        pSupply: item.psupply, // Or you may rename it based on your requirement
        chargeCode: item.chargeCode, // Corresponds to 'chargeCode' in your SQL query
        gchargeCode: item.gchargeCode, // Corresponds to 'gchargeCode' in your SQL query
        chargeName: item.chargeName, // Corresponds to 'chargeName' in your SQL query
        lCamT:
          item.lcAmt === "0.00" || item.lcAmt === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.lcAmt),
        totInvAmtLC:
          item.totInvAmtLC === "0.00" || item.totInvAmtLC === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.totInvAmtLC),
        gstP: item.gstp,
        gstType: item.gstType,
        gst:
          item.gst === "0.00" || item.gst === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.gst),
        igst:
          item.igst === "0.00" || item.igst === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.igst),
        cgst:
          item.cgst === "0.00" || item.cgst === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.cgst),
        sgst:
          item.sgst === "0.00" || item.sgst === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.sgst),
        maker: item.maker,
        approver: item.approver,
        ackDt: item.ackDt
          ? new Date(item.ackDt).toLocaleDateString("en-GB")
          : " ",
        ackNo: item.ackNo,
        irnId: item.irnId,
        type: item.type,
        fType: item.ftype,
        product: item.product,
        territory: item.territory, // Corresponds to 'territory' in your SQL query
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getAllOpenJobs = async (branchName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getAllOpenJobs?branchName=${branchName}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.jobdetails) {
      return response.data.paramObjectsMap.jobdetails.map((item) => ({
        finyr: item.finyr,
        branchname: item.branchname,
        recordId: item.recordId,
        product: item.product,
        jobNo: item.jobNo,
        jobDt: item.jobDt
          ? new Date(item.jobDt).toLocaleDateString("en-GB")
          : " ",
        mno: item.mno,
        mdt: item.mdt,
        hno: item.hno,
        freight: item.freight,
        customer: item.customer,
        category: item.category,
        salesperson: item.salesperson,
        party: item.party,
        cBranch: item.cBranch,
        partner: item.partner,
        carrier: item.carrier,
        itemDesc: item.itemDesc,
        mpol: item.mpol,
        hpod: item.hpod,
        mpolCountry: item.mpolCountry,
        hpodCountry: item.hpodCountry,
        opsClosed: item.opsClosed,
        closed: item.closed,
        closedDt: item.closedDt,
        nclosedDt: item.nclosedDt
          ? new Date(item.nclosedDt).toLocaleDateString("en-GB")
          : " ",
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getJobFullDetails = async (jobNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getJobFullDetails?jobNo=${jobNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.getJobFullDetails
    ) {
      return response.data.paramObjectsMap.getJobFullDetails.map((item) => ({
        product: item.product,
        jobno: item.jobno,
        jobdt: item.jobdt
          ? new Date(item.jobdt).toLocaleDateString("en-GB")
          : " ",
        "Master No": item.mno,
        "Master Dt": item.mdt
          ? new Date(item.mdt).toLocaleDateString("en-GB")
          : " ",
        freight: item.freight,
        "House No": item.hno,
        "House Dt": item.hdt
          ? new Date(item.hdt).toLocaleDateString("en-GB")
          : " ",

        "Direct Shipment": item.direct === "T" ? "Yes" : "No",
        Customer: item.customer,
        category: item.category,
        Salesperson: item.salesperson,
        "Control Branch": item.cbranch,
        Partner: item.partner,
        Carrier: item.carrier,
        "Master chwt": item.mchwt,
        "House pkgs": item.hpkgs,
        "House grwt": item.hgrwt,
        "House chwt": item.hchwt,
        Teus: item.teus,
        CBM: item.cbm,
        "Master Pol": item.mpol,
        "House Pod": item.hpod,
        "Master PolCountry": item.mpolcountry,
        "House PodCountry": item.hpodcountry,
        "Operation Closedon": item.opsclosedon
          ? new Date(item.opsclosedon).toLocaleDateString("en-GB")
          : " ",
        Closeddt: item.closeddt
          ? new Date(item.closeddt).toLocaleDateString("en-GB")
          : " ",
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getJobCostDetails = async (branchName, jobNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getJobCostDetails?branchName=${branchName}&jobNo=${jobNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.jobdetails) {
      return response.data.paramObjectsMap.jobdetails.map((item) => ({
        title: item.title,
        jobNo: item.jobNo,
        docId: item.docId,
        docDt: item.docDt
          ? new Date(item.docDt).toLocaleDateString("en-GB")
          : " ",
        vchNo: item.vchNo,
        vchDt: item.vchDt
          ? new Date(item.vchDt).toLocaleDateString("en-GB")
          : " ",
        partyCode: item.partyCode,
        partyName: item.partyName,
        chargeType: item.chargeType,
        chargeCode: item.chargeCode,
        chargeDescription: item.chargeDescription,
        curr: item.curr,
        exRate: item.exRate,

        fcAppAmount:
          item.fcAppAmount === "0.00" || item.fcAppAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.fcAppAmount),
        income:
          item.income === "0.00" || item.income === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.income),
        expense:
          item.expense === "0.00" || item.expense === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.expense),
        profit:
          item.profit === "0.00" || item.profit === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.profit),
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getIRNQRbyDocNo = async (docNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getIRNQRbyDocNo?docNo=${docNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.irnVo) {
      return response.data.paramObjectsMap.irnVo;
      // sinv: item.sinv || " ",
      // sqr: item.sqr || " ",
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

// export const findByGSTPreCreditrId = async (id) => {
//   try {
//     const response = await axios.get(
//       `${API_URL}/api/crpreapp/getfindByGSTPreCreditrId?id=${id}`
//     ); // Replace `/your-api-endpoint` with the actual endpoint path
//     if (
//       response.data.status &&
//       response.data.paramObjectsMap?.crPreAppVO.attachment
//     ) {
//       return response;
//       // sinv: item.sinv || " ",
//       // sqr: item.sqr || " ",
//     } else {
//       throw new Error("PL Data not found or API error");
//     }
//   } catch (error) {
//     console.error("Error fetching PL data:", error);
//     throw error;
//   }
// };

export const findByGSTPreCreditrId = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/crpreapp/getfindByGSTPreCreditrId?id=${id}`
    );

    // Ensure response structure exists before accessing properties
    if (
      response.data?.status &&
      response.data?.paramObjectsMap?.crPreAppVO?.crPreAppAttachmentVO
    ) {
      // Extract multiple attachments safely
      const attachments =
        response.data.paramObjectsMap.crPreAppVO.crPreAppAttachmentVO.map(
          (att, index) => ({
            fileData: att?.attachment || "", // Avoid issues if `attachment` is missing
            fileName: `attachment_${att?.id || index}`, // Assign a meaningful name
          })
        );

      return { ...response, attachments };
    } else {
      console.warn("No attachments found for the given ID:", id);
      return { ...response, attachments: [] }; // Return empty array if no attachments exist
    }
  } catch (error) {
    console.error(`Failed to fetch files for id ${id}:`, error);
    throw error;
  }
};

export const findByTicketById = async (id) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/Ticket/findByTicketById?id=${id}`
    );

    // Ensure response structure exists before accessing properties
    if (
      response.data?.status &&
      response.data?.paramObjectsMap?.ticketVO?.ticketAttachmentVO
    ) {
      // Extract multiple attachments safely
      const attachments =
        response.data.paramObjectsMap.ticketVO.ticketAttachmentVO.map(
          (att, index) => ({
            fileData: att?.attachment || "", // Avoid issues if `attachment` is missing
            fileName: `attachment_${att?.id || index}`, // Assign a meaningful name
          })
        );

      return { ...response, attachments };
    } else {
      console.warn("No attachments found for the given ID:", id);
      return { ...response, attachments: [] }; // Return empty array if no attachments exist
    }
  } catch (error) {
    console.error(`Failed to fetch files for id ${id}:`, error);
    throw error;
  }
};

export const getIRNJobInfo = async (jobNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getIRNJobInfo?jobNo=${jobNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.irnjobinfodtls) {
      return response.data.paramObjectsMap.irnjobinfodtls;
      // sinv: item.sinv || " ",
      // sqr: item.sqr || " ",
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getIRNJobDetails = async (docNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getIRNJobDetails?docNo=${docNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.irnjobdtls) {
      return response.data.paramObjectsMap.irnjobdtls.map((item) => ({
        documentNumber: item.status || " ",
        partyName: item.partyName || " ",
        pgstin: item.pgstin || " ",
        pssid: item.pssid || " ",
        panNo: item.panNo || " ",
        baddress: item.baddress || " ",
        shipperInvNo: item.shipperInvNo || " ",
        shipmentRefNo: item.shipmentRefNo || " ",
        docId: item.docId || " ",
        docDate: item.docDate
          ? new Date(item.docDate).toLocaleDateString("en-GB")
          : " ",
        jobNo: item.jobNo || " ",
        jobDt: item.jobDt
          ? new Date(item.jobDt).toLocaleDateString("en-GB")
          : " ",
        mNo: item.mNo || " ",
        mDt: item.mDt ? new Date(item.mDt).toLocaleDateString("en-GB") : " ",
        hNo: item.hNo || " ",
        hDt: item.hDt ? new Date(item.hDt).toLocaleDateString("en-GB") : " ",
        pkgs: item.pkgs || " ",
        chwt: item.chwt || " ",
        grwt: item.grwt || " ",
        nCurr: item.nCurr || " ",
        exRate: item.exRate || " ",
        service: item.service || " ",
        gstType: item.gstType || " ",
        dueDate: item.dueDate
          ? new Date(item.dueDate).toLocaleDateString("en-GB")
          : " ",
        territory: item.territory || " ",
        territory1: item.territory1 || " ",
        word: item.word || " ",
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getIRNJobContDetails = async (docNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getIRNJobContDetails?docNo=${docNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.irnjobcontdtls) {
      return response.data.paramObjectsMap.irnjobcontdtls.map((item) => ({
        et: item.et,
        mPol: item.mPol,
        mPod: item.mPod,
        carrierNo: item.carrierNo,
        hItemDesc: item.hItemDesc,
        igmNo: item.igmNo,
        igmDt: item.igmDt,
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getIRNDetails = async (docNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getIRNDetails?docNo=${docNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.irndetails) {
      return response.data.paramObjectsMap.irndetails.map((item) => ({
        documentNumber: item.documentNumber || " ",
        documentDate: item.documentDate
          ? new Date(item.documentDate).toLocaleDateString("en-GB")
          : " ",
        documentTypeCode: item.documentTypeCode || " ",
        supplyTypeCode: item.supplyTypeCode || " ",
        recipientLegalName: item.recipientLegalName || " ",
        recipientTradeName: item.recipientTradeName || " ",
        recipientGstin: item.recipientGstin || " ",
        placeOfSupply: item.placeOfSupply || " ",
        recipientAddress: item.recipientAddress || " ",
        recipientPlace: item.recipientPlace || " ",
        recipientStateCode: item.recipientStateCode || " ",
        recipientPincode: item.recipientPincode || " ",
        slNo: item.slNo || " ",
        itemDescription: item.itemDescription || " ",
        goodService: item.goodService || " ",
        hsnSac: item.hsnSac || " ",
        quantity: item.quantity || " ",
        unitOfMeasurement: item.unitOfMeasurement || " ",
        itemPrice: item.itemPrice || " ",
        grossAmount: item.grossAmount || " ",
        itemDiscountAmount: item.itemDiscountAmount || " ",
        itemTaxableValue: item.itemTaxableValue || " ",
        gstRate: item.gstRate || " ",
        gstType: item.gstType || " ",
        igstAmount: item.igstAmount || " ",
        cgstAmount: item.cgstAmount || " ",
        sgstAmount: item.sgstAmount || " ",
        gst: item.gst || " ",
        itemTotalAmount: item.itemTotalAmount || " ",
        totalTaxableValue: item.totalTaxableValue || " ",
        igstAmountTotal: item.igstAmountTotal || " ",
        cgstAmountTotal: item.cgstAmountTotal || " ",
        totalInvoiceValue: item.totalInvoiceValue || " ",
        supplierLegalName: item.supplierLegalName || " ",
        gstinOfSupplier: item.gstinOfSupplier || " ",
        supplierAddress: item.supplierAddress || " ",
        supplierPlace: item.supplierPlace || " ",
        supplierStateCode: item.supplierStateCode || " ",
        supplierPincode: item.supplierPincode || " ",
        irnServiceType: item.irnServiceType || " ",
        branchCode: item.branchCode || " ",
        gstin: item.gstin || " ",
        totItemVal: item.totItemVal || " ",
        lcAmt: item.lcAmt || " ",
        cgst: item.cgst || " ",
        sgst: item.sgst || " ",
        axValue: item.axValue || " ",
        chargeCode: item.chargeCode || " ",
        ttransId: item.ttransId || " ",
        territory: item.territory || " ",
        irnId: item.irnId || " ",
        ackNo: item.ackNo || " ",
        ackDt: item.ackDt
          ? new Date(item.ackDt).toLocaleDateString("en-GB")
          : " ",
        sinv: item.sinv || " ",
        sqr: item.sqr || " ",
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getIRNGridDetails = async (docNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getIRNGridDetails?docNo=${docNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.irngridlistdetails
    ) {
      return response.data.paramObjectsMap.irngridlistdetails.map((item) => ({
        docNo: item.docNo || " ",
        docDt: item.docDt || " ",
        sno: item.sno || " ",
        qty: item.qty || " ",
        pkgs: item.pkgs || " ",
        wt: item.wt || " ",
        headCaption: item.headCaption || " ",
        chargeName: item.chargeName || " ",
        curr: item.curr || " ",
        staxApp: item.staxApp || " ",
        exRate: item.exRate || " ",
        billAmount: item.billAmount || " ",
        applyOn: item.applyOn || " ",
        lcAmt: item.lcAmt || " ",
        fcAmt: item.fcAmt || " ",
        rate: item.rate || " ",
        amount: item.amount || " ",
        cont: item.cont || " ",
        gstType: item.gstType || " ",
        gst: item.gst || " ",
        ssno: item.ssno || " ",
        gChargeCode: item.gChargeCode || " ",
        gstTaxPostingRow: item.gstTaxPostingRow || " ",
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getIRNDetailsList = async (branchCode) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getIRNDetailsList?branchCode=${branchCode}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.irnlistdetails) {
      return response.data.paramObjectsMap.irnlistdetails.map((item) => ({
        documentNumber: item.documentNumber || " ",
        documentDate: item.documentDate
          ? new Date(item.documentDate).toLocaleDateString("en-GB")
          : " ",
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getTicketReport = async (userName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/Ticket/getTicketReport?userName=${userName}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.pendingApprovalDetails
    ) {
      return response.data.paramObjectsMap.pendingApprovalDetails.map(
        (item) => ({
          gst_ticketId: item.gst_ticketId,
          title: item.title,
          description: item.description,
          assignTo: item.assignTo,
          status: item.status,
          solvedOn: item.solvedOn,
          sovledBy: item.sovledBy,
          createdOn: item.createdOn,
        })
      );
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getUserNote = async (userName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/Ticket/getUserNote?userName=${userName}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.pendingApprovalDetails
    ) {
      return response.data.paramObjectsMap.pendingApprovalDetails.map(
        (item) => ({
          gst_ticketId: item.gst_ticketId,
          title: item.title,
          description: item.description,
          assignTo: item.assignTo,
          status: item.status,
          solvedOn: item.solvedOn,
          sovledBy: item.sovledBy,
          createdOn: item.createdOn,
        })
      );
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getAdminNote = async (userName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/Ticket/getAdminNote?userName=${userName}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.pendingApprovalDetails
    ) {
      return response.data.paramObjectsMap.pendingApprovalDetails.map(
        (item) => ({
          gst_ticketId: item.gst_ticketId,
          title: item.title,
          description: item.description,
          assignTo: item.assignTo,
          status: item.status,
          solvedOn: item.solvedOn,
          sovledBy: item.sovledBy,
          createdOn: item.createdOn,
          createdBy: item.createdBy,
        })
      );
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getJobCostSummary = async (branchName, jobNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getJobCostSummary?branchName=${branchName}&jobNo=${jobNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.jobsumamarydetails
    ) {
      return response.data.paramObjectsMap.jobsumamarydetails.map((item) => ({
        title: item.title,
        jobNo: item.jobNo,
        chargeType: item.chargeType,
        chargeCode: item.chargeCode,
        chargeDescription: item.chargeDescription,
        curr: item.curr,
        exRate: item.exRate,
        fcAmount:
          item.fcAmount === "0.00" || item.fcAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.fcAmount),
        fcAppAmount:
          item.fcAppAmount === "0.00" || item.fcAppAmount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.fcAppAmount),
        income:
          item.income === "0.00" || item.income === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.income),
        expense:
          item.expense === "0.00" || item.expense === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.expense),
        profit:
          item.profit === "0.00" || item.profit === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.profit),
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getJobUnApproveDetails = async (jobNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getJobUnApproveDetails?jobNo=${jobNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.jobdetails) {
      return response.data.paramObjectsMap.jobdetails.map((item) => ({
        unapprove: item.unapprove,
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getJobIncome = async (jobNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getJobIncome?jobNo=${jobNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.jobincomedetails
    ) {
      return response.data.paramObjectsMap.jobincomedetails.map((item) => ({
        income:
          item.income === "0.00" || item.income === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.income),
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getJobCloseddt = async (jobNo, closed) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getJobCloseddt?jobNo=${jobNo}&closed=${closed}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.jobcloseddtdetails
    ) {
      return response.data.paramObjectsMap.jobcloseddtdetails.map((item) => ({
        closeddt: item.closeddt,
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getJobExpense = async (jobNo) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getJobExpense?jobNo=${jobNo}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.jobexpensedetails
    ) {
      return response.data.paramObjectsMap.jobexpensedetails.map((item) => ({
        expense:
          item.expense === "0.00" || item.expense === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.expense),
      }));
    } else {
      throw new Error("PL Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching PL data:", error);
    throw error;
  }
};

export const getMIS = async (branchName, status, fromDate, toDate) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getMIS?branchName=${branchName}&status=${status}&fromDate=${fromDate}&toDate=${toDate}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.misDetails) {
      return response.data.paramObjectsMap.misDetails.map((item) => ({
        jobBranch: item.jobBranch,
        income:
          item.income === "0.00" || item.income === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.income),
        expense:
          item.expense === "0.00" || item.expense === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.expense),
        gp:
          item.gp === "0.00" || item.gp === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.gp),
        issuedGP:
          item.issuedGP === "0.00" || item.issuedGP === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.issuedGP),
        receivedGP:
          item.receivedGP === "0.00" || item.receivedGP === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.receivedGP),
        branchGP:
          item.branchGP === "0.00" || item.branchGP === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.branchGP),
        retainGP:
          item.retainGP === "0.00" || item.retainGP === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.retainGP),
      }));
    } else {
      throw new Error("MIS Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching MIS data:", error);
    throw error;
  }
};

export const getDayBookBranchWise = async (branchName, fromDate, toDate) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getDayBookBranchWise?branchName=${branchName}&fromDate=${fromDate}&toDate=${toDate}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.dayBookBranchWiseDetails
    ) {
      return response.data.paramObjectsMap.dayBookBranchWiseDetails.map(
        (item) => ({
          branchCode: item.branchCode,
          vchNo: item.vchNo,
          vchDate: item.vchDate
            ? new Date(item.vchDate).toLocaleDateString("en-GB")
            : " ",
          docId: item.docId,
          docDt: item.docDt
            ? new Date(item.docDt).toLocaleDateString("en-GB")
            : " ",
          accountCode: item.accountCode,
          ledger: item.ledger,
          subledgerCode: item.subledgerCode,
          subledgerName: item.subledgerName,
          curr: item.curr,
          exRate: item.exRate,
          bdbAmount:
            item.bdbAmount === "0.00" || item.bdbAmount === 0
              ? ""
              : new Intl.NumberFormat("en-IN").format(item.bdbAmount),
          bcrAmount:
            item.bcrAmount === "0.00" || item.bcrAmount === 0
              ? ""
              : new Intl.NumberFormat("en-IN").format(item.bcrAmount),
          remarks: item.remarks,
        })
      );
    } else {
      throw new Error("DayBook Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching DayBook data:", error);
    throw error;
  }
};

export const getAPAgeing = async (
  asondt,
  div,
  pbranchname,
  ptype,
  subledgerName,
  slab1,
  slab2,
  slab3,
  slab4,
  slab5,
  slab6,
  slab7
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getAPAgeingInternal?asondt=${asondt}&div=${div}&pbranchname=${pbranchname}&ptype=${ptype}&sbcode=${subledgerName}&slab1=${slab1}&slab2=${slab2}&slab3=${slab3}&slab4=${slab4}&slab5=${slab5}&slab6=${slab6}&slab7=${slab7}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.apAgeingDetails
    ) {
      return response.data.paramObjectsMap.apAgeingDetails.map((item) => ({
        refNo: item.refNo,
        suppRefNo: item.suppRefNo,
        dueDate: item.dueDate
          ? new Date(item.dueDate).toLocaleDateString("en-GB")
          : "",
        totalDue:
          item.totalDue === "0.00" || item.totalDue === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.totalDue),
        suppRefDate: item.suppRefDate
          ? new Date(item.suppRefDate).toLocaleDateString("en-GB")
          : "",
        whRefNo: item.whRefNo,
        salesPersonName: item.salesPersonName,
        currency: item.currency,
        subledgerCode: item.subledgerCode,
        docdt: item.docdt
          ? new Date(item.docdt).toLocaleDateString("en-GB")
          : "",
        amount:
          item.amount === "0.00" || item.amount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.amount),
        subledgerName: item.subledgerName,
        docid: item.docid,
        hno: item.hno,
        mno: item.mno,
        branchName: item.branchName,
        outStanding:
          item.outStanding === "0.00" || item.outStanding === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.outStanding),
        unAdjusted:
          item.unAdjusted === "0.00" || item.unAdjusted === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.unAdjusted),
        refDate: item.refDate
          ? new Date(item.refDate).toLocaleDateString("en-GB")
          : "",
        cbranch: item.cbranch,
        mslab1:
          item.mslab1 === "0.00" || item.mslab1 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab1),
        mslab2:
          item.mslab2 === "0.00" || item.mslab2 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab2),
        mslab3:
          item.mslab3 === "0.00" || item.mslab3 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab3),
        mslab4:
          item.mslab4 === "0.00" || item.mslab4 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab4),
        mslab5:
          item.mslab5 === "0.00" || item.mslab5 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab5),
        mslab6:
          item.mslab6 === "0.00" || item.mslab6 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab6),
        mslab7:
          item.mslab7 === "0.00" || item.mslab7 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab7),
      }));
    } else {
      throw new Error("MIS Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching MIS data:", error);
    throw error;
  }
};

export const getARAgeing = async (
  asondt,
  div,
  pbranchname,
  ptype,
  subledgerName,
  slab1,
  slab2,
  slab3,
  slab4,
  slab5,
  slab6,
  slab7
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getARAgeingInternal?asondt=${asondt}&div=${div}&pbranchname=${pbranchname}&ptype=${ptype}&sbcode=${subledgerName}&slab1=${slab1}&slab2=${slab2}&slab3=${slab3}&slab4=${slab4}&slab5=${slab5}&slab6=${slab6}&slab7=${slab7}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.arAgeingDetails
    ) {
      return response.data.paramObjectsMap.arAgeingDetails.map((item) => ({
        refNo: item.refNo,
        suppRefNo: item.suppRefNo,
        dueDate: item.dueDate
          ? new Date(item.dueDate).toLocaleDateString("en-GB")
          : "",
        totalDue:
          item.totalDue === "0.00" || item.totalDue === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.totalDue),
        suppRefDate: item.suppRefDate
          ? new Date(item.suppRefDate).toLocaleDateString("en-GB")
          : "",
        whRefNo: item.whRefNo,
        salesPersonName: item.salesPersonName,
        currency: item.currency,
        subledgerCode: item.subledgerCode,
        docdt: item.docdt
          ? new Date(item.docdt).toLocaleDateString("en-GB")
          : "",
        amount:
          item.amount === "0.00" || item.amount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.amount),
        subledgerName: item.subledgerName,
        docid: item.docid,
        hno: item.hno,
        mno: item.mno,
        branchName: item.branchName,
        outStanding:
          item.outStanding === "0.00" || item.outStanding === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.outStanding),
        unAdjusted:
          item.unAdjusted === "0.00" || item.unAdjusted === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.unAdjusted),
        refDate: item.refDate
          ? new Date(item.refDate).toLocaleDateString("en-GB")
          : "",
        cbranch: item.cbranch,
        mslab1:
          item.mslab1 === "0.00" || item.mslab1 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab1),
        mslab2:
          item.mslab2 === "0.00" || item.mslab2 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab2),
        mslab3:
          item.mslab3 === "0.00" || item.mslab3 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab3),
        mslab4:
          item.mslab4 === "0.00" || item.mslab4 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab4),
        mslab5:
          item.mslab5 === "0.00" || item.mslab5 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab5),
        mslab6:
          item.mslab6 === "0.00" || item.mslab6 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab6),
        mslab7:
          item.mslab7 === "0.00" || item.mslab7 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab7),
      }));
    } else {
      throw new Error("MIS Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching MIS data:", error);
    throw error;
  }
};

export const getAROS = async (
  asondt,
  div,
  pbranchname,
  ptype,
  subledgerName,
  slab1,
  slab2,
  slab3,
  slab4,
  slab5,
  slab6,
  slab7
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getAROS?asondt=${asondt}&div=${div}&pbranchname=${pbranchname}&ptype=${ptype}&sbcode=${subledgerName}&slab1=${slab1}&slab2=${slab2}&slab3=${slab3}&slab4=${slab4}&slab5=${slab5}&slab6=${slab6}&slab7=${slab7}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.arOSDetails) {
      return response.data.paramObjectsMap.arOSDetails.map((item) => ({
        totalDue:
          item.totalDue === "0.00" || item.totalDue === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.totalDue),
        creditDays: item.creditDays,
        creditLimit: item.creditLimit,
        salesPersonName: item.salesPersonName,
        currency: item.currency,
        subledgerCode: item.subledgerCode,
        docdt: item.docdt
          ? new Date(item.docdt).toLocaleDateString("en-GB")
          : "",
        amount:
          item.amount === "0.00" || item.amount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.amount),
        subledgerName: item.subledgerName,
        jobBranch: item.jobBranch,
        currency: item.currency,
        outStanding:
          item.outStanding === "0.00" || item.outStanding === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.outStanding),
        unAdjusted:
          item.unAdjusted === "0.00" || item.unAdjusted === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.unAdjusted),
        cbranch: item.cbranch,
        mslab1:
          item.mslab1 === "0.00" || item.mslab1 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab1),
        mslab2:
          item.mslab2 === "0.00" || item.mslab2 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab2),
        mslab3:
          item.mslab3 === "0.00" || item.mslab3 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab3),
        mslab4:
          item.mslab4 === "0.00" || item.mslab4 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab4),
        mslab5:
          item.mslab5 === "0.00" || item.mslab5 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab5),
      }));
    } else {
      throw new Error("MIS Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching MIS data:", error);
    throw error;
  }
};

export const getAPOS = async (
  asondt,
  div,
  pbranchname,
  ptype,
  subledgerName,
  slab1,
  slab2,
  slab3,
  slab4,
  slab5,
  slab6,
  slab7
) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getAPOS?asondt=${asondt}&div=${div}&pbranchname=${pbranchname}&ptype=${ptype}&sbcode=${subledgerName}&slab1=${slab1}&slab2=${slab2}&slab3=${slab3}&slab4=${slab4}&slab5=${slab5}&slab6=${slab6}&slab7=${slab7}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.apOSDetails) {
      return response.data.paramObjectsMap.apOSDetails.map((item) => ({
        totalDue:
          item.totalDue === "0.00" || item.totalDue === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.totalDue),
        creditDays: item.creditDays,
        creditLimit: item.creditLimit,
        salesPersonName: item.salesPersonName,
        currency: item.currency,
        subledgerCode: item.subledgerCode,
        docdt: item.docdt
          ? new Date(item.docdt).toLocaleDateString("en-GB")
          : "",
        amount:
          item.amount === "0.00" || item.amount === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.amount),
        subledgerName: item.subledgerName,
        jobBranch: item.jobBranch,
        currency: item.currency,
        outStanding:
          item.outStanding === "0.00" || item.outStanding === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.outStanding),
        unAdjusted:
          item.unAdjusted === "0.00" || item.unAdjusted === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.unAdjusted),
        cbranch: item.cbranch,
        mslab1:
          item.mslab1 === "0.00" || item.mslab1 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab1),
        mslab2:
          item.mslab2 === "0.00" || item.mslab2 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab2),
        mslab3:
          item.mslab3 === "0.00" || item.mslab3 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab3),
        mslab4:
          item.mslab4 === "0.00" || item.mslab4 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab4),
        mslab5:
          item.mslab5 === "0.00" || item.mslab5 === 0
            ? ""
            : new Intl.NumberFormat("en-IN").format(item.mslab5),
      }));
    } else {
      throw new Error("MIS Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching MIS data:", error);
    throw error;
  }
};

export const getAllCreditParties = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getAllCreditParties`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.partyDetails) {
      return response.data.paramObjectsMap.partyDetails.map((item) => ({
        partyName: item.partyName,
        partyCode: item.partyCode,
        creditLimit: item.creditLimit,
        creditDays: item.creditDays,
        category: item.category,
        salesPersonName: item.salesPersonName,
        controllingOffice: item.controllingOffice,
      }));
    } else {
      throw new Error("Party Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Party data:", error);
    throw error;
  }
};

export const getInvoices = async (userName, branchName) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/InvoiceApproval/getInvoices?userName=${userName}&branchName=${branchName}`
    ); // Replace `/your-api-endpoint` with the actual endpoint path
    if (response.data.status && response.data.paramObjectsMap?.invDetails) {
      return response.data.paramObjectsMap.invDetails.map((item) => ({
        profoma: item.docid,
        partyName: item.partyName,
        partyCode: item.partyCode,
        vchNo: item.vchno,
        vchDt: item.vchdt
          ? new Date(item.vchdt).toLocaleDateString("en-GB")
          : "",
        invAmt: item.totinvamtLc,
        totChargeAmtLc: item.totChargeAmtLc,
        totTaxAmtLc: item.totTaxAmtLc,
      }));
    } else {
      throw new Error("MIS Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching MIS data:", error);
    throw error;
  }
};

export const getAllExpense = async () => {
  try {
    const response = await axios.get(`${API_URL}/api/expense/getAllExpense`); // Replace `/your-api-endpoint` with the actual endpoint path
    if (
      response.data.status &&
      response.data.paramObjectsMap?.employeeExpensesVO
    ) {
      return response.data.paramObjectsMap.employeeExpensesVO.map((item) => ({
        createdBy: item.createdBy,
        empCode: item.empCode,
        partyCode: item.partyCode,
        empName: item.empName,
        totamt: item.totamt,
        id: item.id,
        createdUpdatedDate: item.createdUpdatedDate,
      }));
    } else {
      throw new Error("Expense Data not found or API error");
    }
  } catch (error) {
    console.error("Error fetching Expense data:", error);
    throw error;
  }
};
