import { Box, Button, Container, CssBaseline } from "@mui/material";
import Input from "../components/Input";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
const { ipcRenderer } = window.require("electron/renderer");
interface FormValue {
  id?: string;
  password?: string;
}

const WantedLogin = () => {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm<FormValue>({
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const onSubmit = (data: FormValue) => {
    console.log("click");
    ipcRenderer.send("login", data);
    ipcRenderer.on("success", (event, arg) => {
      console.log("success");
      console.log(arg);
    });
  };

  return (
    <>
      <CssBaseline />
      <Container
        maxWidth="sm"
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <Button onClick={() => navigate(-1)}>뒤로가기</Button>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Input
              control={control}
              name="id"
              textFieldProps={{
                label: "아이디",
                variant: "outlined",
                margin: "normal",
                fullWidth: true,
              }}
            />
            <Input
              control={control}
              name="password"
              textFieldProps={{
                label: "비밀번호",
                variant: "outlined",
                margin: "normal",
                fullWidth: true,
                type: "password",
              }}
            />
            <Button variant="contained" type="submit" fullWidth>
              로그인
            </Button>
          </form>
        </Box>
      </Container>
    </>
  );
};

export default WantedLogin;
