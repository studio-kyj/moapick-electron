import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

const { ipcRenderer } = window.require("electron/renderer");

const formSchema = z.object({
  id: z.string().nonempty("아이디를 입력해주세요."),
  password: z.string().nonempty("비밀번호를 입력해주세요."),
});

const WantedLogin = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      password: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    console.log("click");
    ipcRenderer.send("login", data);
    ipcRenderer.on("success", (event, arg) => {
      console.log("success");
      console.log(arg);
    });
  };

  return (
    <div className="w-full h-full flex justify-center items-center flex-col mx-auto">
      <img
        src="/Users/bangminseog/Documents/project/moapick-electron/public/wanted_logo.png"
        alt="wanted_logo"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-96  "
        >
          <FormField
            control={form.control}
            name="id"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>아이디</FormLabel>
                <FormControl>
                  <Input placeholder="아이디를 입력하세요" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormLabel>비밀번호</FormLabel>
                <FormControl>
                  <Input
                    placeholder="비밀번호를 입력하세요"
                    type="password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-64">
            연동하기
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default WantedLogin;
