const LoginPage = () => {
  // Create handle login
  const handleSpotifyLogin = () => {
    window.location.href = 'http://127.0.0.1:8080/api/auth/spotify';
  };

  return (
    <div>
      <h1>Login Page</h1>
      <button onClick={handleSpotifyLogin}> Login</button>
    </div>
  );
};

export default LoginPage;
