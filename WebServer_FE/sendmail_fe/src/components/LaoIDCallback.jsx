import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import API from "../api";

export default function LaoIDCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get("code");
  const { login } = useAuth();

  useEffect(() => {
    const exchangeCode = async () => {
      if (!code) return;

      try {
        const res = await API.post("/auth/laoid/callback", { code });
        const accessToken = res.data.data.accessToken;

        login(accessToken);
        navigate("/");
      } catch (error) {
        console.error(error)
        console.error("Lỗi khi lấy accessToken LaoID");
      }
    };

    exchangeCode();
  }, [code]);

  return <p>Đang xác thực LaoID...</p>;
}
