import DownloadIcon from '@mui/icons-material/Download';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from 'react';

const GeneratePdfDeliveryChallanpdf = ({ row, callBackFunction }) => {
  const [open, setOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Function to open the dialog
  const handleOpen = () => {
    setOpen(true);
  };

  // Function to close the dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Function to generate and download the PDF
  const handleDownloadPdf = async () => {
    const input = document.getElementById('pdf-content');
    if (input) {
      const canvas = await html2canvas(input);
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 0, 0);
      pdf.save(`PICK_${row.docId}.pdf`);

      handleClose();
    } else {
      console.error("Element not found: 'pdf-content'");
    }
  };

  // Automatically open the dialog when the component is rendered
  useEffect(() => {
    if (row) {
      handleOpen();
    }
    console.log('RowData =>', row);

    // Call the callback function to pass handleDownloadPdf if needed
    if (callBackFunction) {
      callBackFunction(handleDownloadPdf);
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-GB'); // Format date as DD/MM/YYYY
    const formattedTime = now.toLocaleTimeString('en-GB'); // Format time as HH:MM:SS
    setCurrentDateTime(`${formattedDate} ${formattedTime}`);
  }, [row, callBackFunction]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      onEntered={handleDownloadPdf} // Ensure content is fully rendered before generating PDF
    >
      <DialogTitle>PDF Preview</DialogTitle>
      <DialogContent>
        <div
          id="pdf-content"
          style={{
            padding: '20px',
            backgroundColor: '#f9f9f9',
            width: '210mm',
            height: 'auto',
            margin: 'auto',
            fontFamily: 'Roboto, Arial, sans-serif',
            position: 'relative'
          }}
        >
          {/* <!-- Header Section --> */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '16px',
              marginBottom: '20px',
              borderBottom: '2px solid #000000',
              paddingBottom: '10px',
              color: '#333'
            }}
          >
            <div>EFit WMS</div>
            <div>Delivery Challan</div>
            <div>{localStorage.getItem('branch')}</div>
          </div>

          {/* <!-- Details Section --> */}
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#555'
            }}
          >
            <div>
              <div>
                <strong>{row.customer}</strong>
                <p>GH</p>
                {/* {row.customer} */}
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div>
                <strong>DOCID : </strong>
                <span>{row.docId}</span>
                {/* {row.buyerRefNo} */}
              </div>
              <div>
                <strong>DOCDATE : </strong>
                <span>{row.docDate}</span>
                {/* {row.buyerOrderNo} */}
              </div>
              <div>
                <strong>BUYERORDERNO:</strong>
                <span>{row.buyerOrderNo}</span>
              </div>
              <div>
                <strong>REFNO :</strong> <span>{row.deliveryChallanDetailsVO[0].pickRequestNo}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#555'
            }}
          >
            <div>
              <div>
                <strong>{row.buyer} </strong>
                {/* {row.docDate} */}
                <p>VEGNESH ENTERPRISES</p>
              </div>
            </div>
            <div style={{ textAlign: 'left' }}>
              <div>
                <strong>TRANSPORTER : </strong>
                <span>RIVIGO SERVICES PVT.LTD.</span>
                {/* {row.buyerOrderNo} */}
              </div>
              <div>
                <strong>DOCKET NO:</strong>
                <span>1004806538</span>
              </div>
              <div>
                <strong>PACKING SLIP NO :</strong> <span>4548</span>
              </div>
            </div>
          </div>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '20px',
              fontSize: '12px',
              border: '1px solid #000000'
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#673ab7', color: '#fff' }}>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Sl.</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>PartNO</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>PARTDESC</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>QTY</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>RATE</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>AMOUNT</th>
                {/* <th style={{ border: '1px solid #000000', padding: '10px' }}>Location</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Tick</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>Avl Qty</th>
                <th style={{ border: '1px solid #000000', padding: '10px' }}>PC</th> */}
              </tr>
            </thead>
            <tbody>
              {row.deliveryChallanDetailsVO?.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #000000' }}>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{index + 1}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.partNo}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.partDescription}</td>
                  {/* <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.batch || ''}</td> */}
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.shippedQty}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.unitRate}</td>
                  <td style={{ border: '1px solid #000000', padding: '10px' }}>{item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* <!-- Total Section --> */}
          <div
            style={{
              textAlign: 'right',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333'
            }}
          >
            Total: {row.deliveryChallanDetailsVO?.reduce((sum, item) => sum + item.amount, 0)}
          </div>

          <div
            style={{
              textAlign: 'Left',
              fontWeight: 'bold',
              fontSize: '14px',
              color: '#333',
              marginTop: '10%'
            }}
          >
            Authorised Signatory
          </div>

          {/* <!-- Footer Section --> */}
          <div
            style={{
              borderTop: '2px solid #000000',
              paddingTop: '10px',
              fontSize: '12px',
              color: '#777',
              textAlign: 'center',
              // position: 'absolute',
              bottom: '0',
              width: '100%',
              marginTop: '5%'
            }}
          >
            <div>Footer </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownloadPdf} color="primary" variant="contained" startIcon={<DownloadIcon />}>
          PDF
        </Button>
        <Button onClick={handleClose} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GeneratePdfDeliveryChallanpdf;
