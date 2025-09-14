
// Simple test component to check if React is working
function SimpleApp() {
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1 style={{ color: "blue" }}>🎉 Frontend is Working!</h1>
      <p>HRM System Frontend</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      <div style={{ marginTop: "20px" }}>
        <button style={{ padding: "10px 20px", fontSize: "16px" }}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default SimpleApp;
