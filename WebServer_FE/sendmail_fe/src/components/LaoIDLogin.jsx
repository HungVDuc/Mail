import { useEffect } from "react";
import useLoadScript from "../hooks/useLoadScript";

const LaoIDLogin = () => {
  useLoadScript(import.meta.env.VITE_LAOID_AUTH_SCRIPT_URL);

  useEffect(() => {
    const callBackUrl = `${window.location.protocol}//${window.location.hostname}/laoid/auth/callback`;

    const initInterval = setInterval(() => {
      if (window.LaoIdSSO) {
        window.LaoIdSSO.init(
          import.meta.env.VITE_LAOID_SIGNIN_CLIENT_ID,
          callBackUrl,
          callBackUrl
        );
        clearInterval(initInterval);
      }
    }, 500);

    const onMessage = (event) => {
      if (event.origin !== import.meta.env.VITE_LAOID_AUTH_ORIGIN) return;

      const { message, data } = event.data;

      if (message === "login_success") {
        const redirectUrl = `/laoid/auth/callback?code=${data}`;
        window.location.href = redirectUrl;
      }
    };

    window.addEventListener("message", onMessage);

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return <button id="laoid-signin">Đăng nhập bằng LaoID</button>;
};

export default LaoIDLogin;
