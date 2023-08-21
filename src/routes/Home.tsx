import { Button, Container } from "@mui/material";
import Box from "@mui/material/Box";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { Link } from "react-router-dom";

const columns: GridColDef[] = [
  {
    field: "applicationPath",
    headerName: "지원경로",
    width: 90,
    renderCell: (params) => <Button variant="contained">{params.value}</Button>,
  },
  {
    field: "name",
    headerName: "지원자 명",
    width: 150,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "applyTitle",
    headerName: "공고명",
    width: 300,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "applyDate",
    headerName: "지원 날짜",
    type: "number",
    width: 160,
    headerAlign: "center",
    align: "center",
  },
  {
    field: "status",
    headerName: "등록현황",
    sortable: false,
    width: 110,
    headerAlign: "center",
    align: "center",
    valueGetter: (params: GridValueGetterParams) =>
      `${params.row.firstName || ""} ${params.row.lastName || ""}`,
  },
];

const rows = [
  {
    id: 1,
    name: "김지원",
    applicationPath: "원티드",
    applyTitle: "[100억↑투자] 사업개발 담당자(채용 플랫폼)",
    applyDate: "2023-08-13T14:26:04",
    status: "pending",
  },
];

const Home = () => {
  return (
    <Container maxWidth="lg">
      <div>
        <Link to="/wanted-login">원티드 로그인</Link>
      </div>
      <Box sx={{ height: 400, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Container>
  );
};

export default Home;
