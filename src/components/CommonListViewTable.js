import { EditOutlined, FilePdfOutlined } from "@ant-design/icons";
import { Button, Tag, ConfigProvider } from "antd";
import { useState, useEffect } from "react";

const CommonListViewTable = ({
  data,
  columns,
  blockEdit,
  toEdit,
  disableEditIcon,
  viewIcon,
  isPdf,
  GeneratePdf,
  theme, // Receive theme as prop
}) => {
  const [tableData, setTableData] = useState(data || []);
  const [orgId, setOrgId] = useState(localStorage.getItem("orgId"));

  const handleButtonClick = (row) => {
    toEdit(row);
  };

  useEffect(() => {
    console.log("BlockEdit", blockEdit);
  }, []);

  const renderCellContent = (column, value) => {
    if (column.dataIndex === "active") {
      return (
        <Tag color={value === "Active" ? "green" : "orange"}>
          {value === "Active" ? "Active" : "Inactive"}
        </Tag>
      );
    }

    if (column.dataIndex === "currentFinYear") {
      return (
        <Tag color={value === true ? "green" : "orange"}>
          {value === true ? "true" : "false"}
        </Tag>
      );
    }

    return value;
  };

  const actionColumn = {
    title: "Action",
    key: "action",
    width: 120,
    render: (_, record) => (
      <div style={{ display: "flex", gap: "8px" }}>
        {isPdf && (
          <Button
            icon={<FilePdfOutlined />}
            size="small"
            onClick={() => GeneratePdf(record)}
            style={{
              background:
                theme === "dark" ? "rgba(255,255,255,0.1)" : "#f0f0f0",
              border: "none",
              color: theme === "dark" ? "white" : "inherit",
            }}
          />
        )}
        {!disableEditIcon && (
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleButtonClick(record)}
            style={{
              background:
                theme === "dark" ? "rgba(255,255,255,0.1)" : "#f0f0f0",
              border: "none",
              color: theme === "dark" ? "white" : "inherit",
            }}
          />
        )}
      </div>
    ),
  };

  const tableColumns = [...columns, actionColumn];

  return (
    <ConfigProvider
      theme={{
        token: {
          colorBgContainer:
            theme === "dark" ? "rgba(255,255,255,0.05)" : "#fff",
          colorText:
            theme === "dark" ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.85)",
          colorBorderSecondary:
            theme === "dark" ? "rgba(255,255,255,0.2)" : "#f0f0f0",
        },
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: theme === "dark" ? "rgba(255,255,255,0.05)" : "#fff",
            color: theme === "dark" ? "white" : "inherit",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${
                  theme === "dark" ? "rgba(255,255,255,0.2)" : "#f0f0f0"
                }`,
              }}
            >
              {tableColumns.map((column) => (
                <th
                  key={column.key || column.dataIndex}
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "bold",
                  }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr
                key={index}
                style={{
                  borderBottom: `1px solid ${
                    theme === "dark" ? "rgba(255,255,255,0.1)" : "#f0f0f0"
                  }`,
                }}
              >
                {tableColumns.map((column) => (
                  <td
                    key={column.key || column.dataIndex}
                    style={{ padding: "12px" }}
                  >
                    {column.render
                      ? column.render(row[column.dataIndex], row, index)
                      : renderCellContent(column, row[column.dataIndex])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ConfigProvider>
  );
};

export default CommonListViewTable;
