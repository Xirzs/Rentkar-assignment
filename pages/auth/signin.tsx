import { getCsrfToken, signIn } from "next-auth/react";
import { useState } from "react";
import { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";

export default function SignIn({ csrfToken }: { csrfToken: string | null }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const username = event.currentTarget.username.value;
    const password = event.currentTarget.password.value;

    const result = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError("Invalid username or password");
      setLoading(false);
    } else if (result?.ok) {
      router.push("/");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Sign In</h1>
      <form method="post" onSubmit={handleSubmit}>
        <input name="csrfToken" type="hidden" defaultValue={csrfToken || ""} />
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Username</label>
          <input 
            name="username" 
            type="text" 
            required 
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>Password</label>
          <input 
            name="password" 
            type="password" 
            required 
            style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "10px", 
            cursor: loading ? "not-allowed" : "pointer",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const csrfToken = await getCsrfToken(context);
  
  return {
    props: {
      csrfToken: csrfToken || null,
    },
  };
}