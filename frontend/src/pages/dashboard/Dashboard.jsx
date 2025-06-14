const Dashboard = () => {
  return (
    <div
      className="card border-0 shadow-sm"
      style={{
        borderRadius: "16px",
        minHeight: "500px",
      }}
    >
      <div className="card-body p-5 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div
            className="mx-auto mb-4 d-flex align-items-center justify-content-center"
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              borderRadius: "20px",
              opacity: "0.1",
            }}
          >
            <i className="fas fa-layer-group text-white fs-2"></i>
          </div>
          <h4 className="text-muted fw-normal">Content Area</h4>
          <p className="text-muted mb-0">
            This is where your main content will be displayed
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
