import React, { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import ProductServices from "../../services/ProductServices";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import "bootstrap/dist/css/bootstrap.min.css";
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css";
import $ from "jquery";
import StockMovementService from "../../services/StockMovementService";
import { useAuth } from "../../contexts/AuthContext";

DataTable.use(DT);

const StockMovement = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [products, setProducts] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const dataTable = useRef("table");

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      id: null,
      product_id: "",
      quantity: 0,
      type: "",
      remark: "",
    },
  });

  const [newStock, setNewStock] = useState(null);
  const type = useWatch({ control, name: "type" });
  const quantity = useWatch({ control, name: "quantity" });
  const [insufficient, setInsufficient] = useState(false);

  const MySwal = withReactContent(Swal);

  const movementTypes = [
    {
      value: "inbound",
      label: "Stock In (+)",
      icon: "fas fa-plus-circle",
      color: "#10b981",
    },
    {
      value: "outbound",
      label: "Stock Out (-)",
      icon: "fas fa-minus-circle",
      color: "#ef4444",
    },
  ];

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await StockMovementService.update(data);
      } else {
        await StockMovementService.store(data);
      }
      MySwal.fire({
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500,
      });

      const table = $("#dataTable").DataTable();
      table.ajax.reload();
    } catch (err) {
      console.log(err.response.data.message);
    }

    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset({
      id: null,
      product_id: "",
      quantity: "",
      type: "",
      remark: "",
    });
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let response = await ProductServices.fetch();
        if (response) {
          setProducts((prev) => (prev = response.data));
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedProduct && quantity) {
      const currentStock = parseInt(selectedProduct.stock_on_hand);
      const qty = parseInt(quantity);

      if (type === "inbound") {
        setNewStock(currentStock + qty);
        setInsufficient(false);
      } else if (type === "outbound") {
        setNewStock(currentStock - qty);
        setInsufficient(currentStock < qty);
      } else {
        setNewStock(null);
        setInsufficient(false);
      }
    } else {
      setNewStock(null);
      setInsufficient(false);
    }
  }, [type, quantity, selectedProduct]);

  let ajax = {
    url: "http://127.0.0.1:8000/api/stock-movements/get-data",
    type: "GET",
    beforeSend: function (xhr) {
      const token = localStorage.getItem("token");
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      }
    },
  };

  const handleSelectedProduct = (e) => {
    const id = parseInt(e.target.value);
    const foundProduct = products.find((p) => p.id === id);
    setSelectedProduct(foundProduct);
  };

  let datatableColumns = [
    { title: "Product", data: 0 },
    { title: "Type", data: 1 },
    { title: "Quantity", data: 2 },
    {
      title: "Status",
      data: 3,
      render: function (data) {
        let badgeClass = "";
        switch (data.toLowerCase()) {
          case "approved":
            badgeClass = "badge bg-success";
            break;
          case "rejected":
            badgeClass = "badge bg-danger";
            break;
          case "waiting":
          default:
            badgeClass = "badge bg-warning";
            break;
        }
        return `<span class="${badgeClass}">${data}</span>`;
      },
    },
    { title: "Remarks", data: 4 },
    { title: "Created At", data: 5 },
    { title: "Created By", data: 6 },
    {
      title: "Actions",
      data: null,
      orderable: false,
      searchable: false,
      render: function (data, type, row, meta) {
        const id = row[7];
        const product = row[8];
        const typeStock = row[1];
        const quantity = row[2];
        const status = row[3];

        if (user.role_names == "admin" && status == "waiting") {
          return `
            <button class="btn btn-sm btn-success me-2" onclick="handleApprove('${id}')">Approve</button>
            <button class="btn btn-sm btn-danger me-2" onclick="handleReject('${id}')">Reject</button>
        `;
        }

        if (status.toLowerCase() === "approved" || user.role_names == "admin") {
          return `<span class="text-muted fst-italic">No actions available</span>`;
        }

        return `
            <button class="btn btn-sm btn-primary me-2" onclick="handleEdit('${id}', '${product}', '${typeStock}', '${quantity}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})">Delete</button>
        `;
      },
    },
  ];

  window.handleEdit = function (id, product, type, quantity) {
    setIsEditMode(true);
    reset({
      id: id,
      product_id: product,
      type: type,
      quantity: quantity,
    });
    const foundProduct = products.find((p) => p.id === parseInt(product));

    setSelectedProduct(foundProduct);
    setShowModal(true);
  };

  window.handleDelete = async (id) => {
    try {
      MySwal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await StockMovementService.destroy(id);
          MySwal.fire({
            icon: "success",
            title: "Your work has been saved",
            showConfirmButton: false,
            timer: 1500,
          });
          const table = $("#dataTable").DataTable();
          table.ajax.reload();
        }
      });
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  window.handleApprove = (id) => {
    try {
      MySwal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await StockMovementService.approve(id);
          MySwal.fire({
            icon: "success",
            title: "Your work has been saved",
            showConfirmButton: false,
            timer: 1500,
          });
          const table = $("#dataTable").DataTable();
          table.ajax.reload();
        }
      });
    } catch (err) {
      console.log(err.response.data.message);
    }
  };

  window.handleReject = (id) => {
    reset({
      id: id,
      product_id: null,
      type: null,
      quantity: null,
    });
    setRejectModal(true);
  };

  const submitReject = async (data) => {
    try {
      await StockMovementService.reject(data);
      MySwal.fire({
        icon: "success",
        title: "Your work has been saved",
        showConfirmButton: false,
        timer: 1500,
      });

      const table = $("#dataTable").DataTable();
      table.ajax.reload();
    } catch (err) {
      console.log(err.response.data.message);
    }

    setRejectModal(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <a
                  href="#"
                  className="text-decoration-none"
                  style={{ color: "#6b7280" }}
                >
                  Dashboard
                </a>
              </li>
              <li
                className="breadcrumb-item active"
                aria-current="page"
                style={{ color: "#4facfe" }}
              >
                Stock Movements
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="h3 fw-bold text-dark mb-1">Stock Movement</h1>
          <p className="text-muted mb-0">Track Your Stock Movement</p>
        </div>

        {/* Add Button */}
        <button
          className="btn text-white border-0 d-flex align-items-center"
          onClick={() => {
            setShowModal(true);
            setIsEditMode(false);
          }}
          style={{
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            borderRadius: "12px",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(79, 172, 254, 0.3)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 6px 20px rgba(79, 172, 254, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 15px rgba(79, 172, 254, 0.3)";
          }}
        >
          <i className="fas fa-plus me-2"></i>
          Add Stock Movement
        </button>
      </div>

      {/* Products Table */}

      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">Stock Histories</h5>
          </div>
        </div>
        <div className="card-body p-4">
          <div className="table-responsive">
            {user == null ? (
              <div className="text-center my-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <div className="mt-2">Loading data...</div>
              </div>
            ) : (
              <DataTable
                id="dataTable"
                ref={dataTable}
                ajax={ajax}
                options={{
                  serverSide: true,
                  processing: true,
                }}
                columns={datatableColumns}
                className="table table-striped"
              >
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Created At</th>
                    <th>Created By</th>
                  </tr>
                </thead>
              </DataTable>
            )}
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={handleCloseModal}
          ></div>
          <div
            className="modal fade show d-block"
            style={{ zIndex: 1050 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "20px" }}
              >
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark">
                    <i
                      className="fas fa-boxes me-2"
                      style={{ color: "#4facfe" }}
                    ></i>
                    {isEditMode ? "Edit" : "Add"} Stock Movement
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-4">
                    {/* Product Selection */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Select Product *
                      </label>
                      <select
                        className="form-select border-2"
                        {...register("product_id", {
                          required: "Please select a product",
                        })}
                        onChange={handleSelectedProduct}
                        style={{
                          borderColor: errors.product_id
                            ? "#ef4444"
                            : "#e2e8f0",
                          borderRadius: "10px",
                          height: "44px",
                        }}
                        disabled={isLoadingProducts}
                      >
                        <option value="">
                          {isLoadingProducts
                            ? "Loading products..."
                            : "Choose a product"}
                        </option>
                        {!isLoadingProducts &&
                          products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - {product.uom?.toUpperCase()}{" "}
                              (Stock: {product.stock_on_hand})
                            </option>
                          ))}
                      </select>
                      {errors.product_id && (
                        <div className="text-danger mt-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.product_id.message}
                        </div>
                      )}
                    </div>

                    {/* Movement Type */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Movement Type *
                      </label>
                      <select
                        className="form-select border-2"
                        {...register("type", {
                          required: "Movement type is required",
                        })}
                        style={{
                          borderColor: errors.type ? "#ef4444" : "#e2e8f0",
                          borderRadius: "10px",
                          height: "44px",
                        }}
                      >
                        <option value="">Select movement type</option>
                        {movementTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {errors.type && (
                        <div className="text-danger mt-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.type.message}
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="form-control border-2"
                        placeholder="Enter quantity"
                        {...register("quantity", {
                          required: "Quantity is required",
                          min: {
                            value: 1,
                            message: "Quantity must be at least 1",
                          },
                          max: {
                            value: 999999,
                            message: "Quantity cannot exceed 999,999",
                          },
                        })}
                        style={{
                          borderColor: errors.quantity ? "#ef4444" : "#e2e8f0",
                          borderRadius: "10px",
                          height: "44px",
                        }}
                      />
                      {errors.quantity && (
                        <div className="text-danger mt-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.quantity.message}
                        </div>
                      )}
                    </div>

                    {/* Movement Type Preview */}
                    {watch("type") && (
                      <div className="col-12">
                        {/* Product Info Card */}
                        {selectedProduct && (
                          <div
                            className="my-3 p-3 border rounded"
                            style={{
                              backgroundColor: "#f8fafc",
                              borderColor: "#e2e8f0",
                              borderRadius: "10px",
                            }}
                          >
                            <div className="row align-items-center">
                              <div className="col-md-8">
                                <h6 className="mb-1 fw-semibold text-dark">
                                  {selectedProduct.name}
                                </h6>
                                <small className="text-muted">
                                  Price: {selectedProduct.price} | UOM:{" "}
                                  {selectedProduct.uom?.toUpperCase()}
                                </small>
                              </div>
                              <div className="col-md-4 text-md-end">
                                <span
                                  className="badge bg-secondary px-3 py-2"
                                  style={{ borderRadius: "8px" }}
                                >
                                  Current Stock: {selectedProduct.stock_on_hand}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div
                          className="alert d-flex align-items-center"
                          style={{
                            backgroundColor:
                              movementTypes.find(
                                (t) => t.value === watch("type")
                              )?.color + "20",
                            borderColor: movementTypes.find(
                              (t) => t.value === watch("type")
                            )?.color,
                            borderWidth: "1px",
                            borderStyle: "solid",
                            borderRadius: "10px",
                          }}
                        >
                          <i
                            className={`${
                              movementTypes.find(
                                (t) => t.value === watch("type")
                              )?.icon
                            } me-3 fs-5`}
                            style={{
                              color: movementTypes.find(
                                (t) => t.value === watch("type")
                              )?.color,
                            }}
                          ></i>
                          <div>
                            <strong>Movement Type:</strong>{" "}
                            {
                              movementTypes.find(
                                (t) => t.value === watch("type")
                              )?.label
                            }
                            {selectedProduct && watch("quantity") && (
                              <div className="mt-1 small">
                                {watch("type") === "inbound" && (
                                  <span className="text-success">
                                    New stock will be: {newStock}
                                  </span>
                                )}
                                {watch("type") === "outbound" && (
                                  <span
                                    className={
                                      selectedProduct.stock_on_hand >=
                                      parseInt(watch("quantity") || 0)
                                        ? "text-warning"
                                        : "text-danger"
                                    }
                                  >
                                    New stock will be: {newStock || 0}
                                    {selectedProduct.stock_on_hand <
                                      parseInt(watch("quantity") || 0) && (
                                      <span className="text-danger ms-2">
                                        ⚠️ Insufficient stock!
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn text-white border-0"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting || !selectedProduct || insufficient}
                    style={{
                      background:
                        isSubmitting || !selectedProduct
                          ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)"
                          : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      borderRadius: "10px",
                      padding: "8px 24px",
                    }}
                  >
                    {isSubmitting ? (
                      <div className="d-flex align-items-center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Save Movement
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setRejectModal(false)}
          ></div>
          <div
            className="modal fade show d-block"
            style={{ zIndex: 1050 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div
                className="modal-content border-0 shadow-lg"
                style={{ borderRadius: "20px" }}
              >
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-dark">
                    <i
                      className="fas fa-boxes me-2"
                      style={{ color: "#4facfe" }}
                    ></i>
                    Reject Submission
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => {
                      setRejectModal(false);
                    }}
                  ></button>
                </div>

                <div className="modal-body p-4">
                  <div className="row g-4">
                    {/* Remark */}
                    <div className="col-md-12">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Reason
                      </label>
                      <input
                        type="text"
                        min="1"
                        className="form-control border-2"
                        placeholder="Enter reason"
                        {...register("remark")}
                        style={{
                          borderColor: errors.remark ? "#ef4444" : "#e2e8f0",
                          borderRadius: "10px",
                          height: "44px",
                        }}
                      />
                      {errors.remark && (
                        <div className="text-danger mt-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.remark.message}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pt-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setRejectModal(false)}
                    disabled={isSubmitting}
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn text-white bg-danger border-0"
                    onClick={handleSubmit(submitReject)}
                    disabled={isSubmitting}
                    style={{
                      borderRadius: "10px",
                      padding: "8px 24px",
                    }}
                  >
                    {isSubmitting ? (
                      <div className="d-flex align-items-center">
                        <div
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StockMovement;
