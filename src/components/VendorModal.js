import { Modal, Form, Input, Button, message } from "antd";
import "./VendorModal.css";
import confetti from "canvas-confetti";
import SendIcon from "@mui/icons-material/Send";
const VendorModal = ({
  isVendorModalVisible,
  setIsVendorModalVisible,
  handleCreateVendor,
  newVendor,
  setNewVendor,
  theme,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      // Call the original handler
      await handleCreateVendor();

      // Show success message
      message.success("Vendor created successfully!");

      // Reset form fields
      form.resetFields();

      // Reset newVendor state
      setNewVendor({
        vendorname: "",
        address: "",
        gstin: "",
        panno: "",
        contactperson: "",
        contactno: "",
        emailid: "",
        createdBy: localStorage.getItem("userName") || "",
      });

      // Trigger confetti
      confetti();

      // Close modal after a short delay
      setTimeout(() => {
        setIsVendorModalVisible(false);
      }, 1000);
    } catch (error) {
      message.error("Failed to create vendor");
      console.error("Error creating vendor:", error);
    }
  };

  return (
    <Modal
      title={null}
      visible={isVendorModalVisible}
      onCancel={() => {
        form.resetFields();
        setIsVendorModalVisible(false);
      }}
      footer={null}
      width={400}
      closable={false}
      className="glass-card-modal"
      bodyStyle={{
        padding: 0,
        background: "transparent",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        marginTop: "-50px",
      }}
    >
      <div className="glass-card">
        <button
          className="close-popup"
          onClick={() => {
            form.resetFields();
            setIsVendorModalVisible(false);
          }}
        >
          &times;
        </button>

        <div className="card-header">
          <p>Vendor Creation</p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="form-content">
            <Form.Item
              name="vendorname"
              label="Vendor Name"
              className="glass-form-item"
              rules={[{ required: true, message: "Please input vendor name!" }]}
              
            >
              <Input className="glass-input" />
            </Form.Item>

            <Form.Item
              name="address"
              label="Address"
              className="glass-form-item"
              rules={[
                { required: true, message: "Please input vendor Address!" },
              ]}
              
            >
              <Input.TextArea className="glass-input" />
            </Form.Item>

            <div className="form-row">
              <Form.Item
                name="gstin"
                label="GSTIN"
                className="glass-form-item"
                rules={[
                  { required: true, message: "Please input vendor GSTIN!" },
                ]}
              >
                <Input className="glass-input" />
              </Form.Item>

              <Form.Item
                name="panno"
                label="PAN Number"
                className="glass-form-item"
              >
                <Input className="glass-input" />
              </Form.Item>
            </div>

            <div className="form-row">
              <Form.Item
                name="contactperson"
                label="Contact Person"
                className="glass-form-item"
              >
                <Input className="glass-input" />
              </Form.Item>

              <Form.Item
                name="contactno"
                label="Contact Number"
                className="glass-form-item"
              >
                <Input className="glass-input" />
              </Form.Item>
            </div>

            <Form.Item
              name="emailid"
              label="Email ID"
              className="glass-form-item"
            >
              <Input className="glass-input" />
            </Form.Item>
          </div>

          <div className="form-actions">
            <Button
              type="submit"
              htmlType="submit"
              // className="neon-button"
              endIcon={<SendIcon />}
              style={{
                backgroundColor: "transparent",
                color: "white",
                margin: "0",
                padding: "4px 8px",
                borderRadius: "0 8px",
                border: "1px solid white",
              }}
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default VendorModal;
