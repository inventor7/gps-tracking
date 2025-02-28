import { useApi } from "@/composables/api/useApi";

export interface loginParams {
  username: string;
  password: string;
  dbName: string;
}
export function useLogin() {
  const query = useApi<any>("web/login");

  const execute = async (loginForm: loginParams) => {
    return query.execute({
      method: "POST",
      data: {
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "authenticate",
          //   args: [loginForm.dbName, loginForm.username, loginForm.password, {}],
          args: ["odoo", "admin", "admin", {}],
        },
        id: Math.floor(Math.random() * 1000000),
      },
    });
  };

  return {
    ...query,
    execute,
  };
}
