import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import ProductServices from "../../services/ProductServices";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import DataTable from "datatables.net-react";
import DT from "datatables.net-bs5";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap 5
import "datatables.net-bs5/css/dataTables.bootstrap5.min.css"; // DataTables Bootstrap 5
import $ from "jquery";
import { useAuth } from "../../contexts/AuthContext";

DataTable.use(DT);

const Product = () => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const dataTable = useRef("table");
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "iPhone 15 Pro",
      price: 999.99,
      uom: "pcs",
      stockOnHand: 25,
      image: "https://via.placeholder.com/50x50/4facfe/ffffff?text=IP",
      createdAt: "2024-01-15",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      price: 899.99,
      uom: "pcs",
      stockOnHand: 30,
      image: "https://via.placeholder.com/50x50/00f2fe/ffffff?text=SG",
      createdAt: "2024-01-12",
    },
    {
      id: 3,
      name: "MacBook Pro M3",
      price: 1999.99,
      uom: "pcs",
      stockOnHand: 10,
      image: "https://via.placeholder.com/50x50/4facfe/ffffff?text=MB",
      createdAt: "2024-01-10",
    },
    {
      id: 4,
      name: "Nike Air Max",
      price: 129.99,
      uom: "pair",
      stockOnHand: 50,
      image: "https://via.placeholder.com/50x50/00f2fe/ffffff?text=NK",
      createdAt: "2024-01-08",
    },
    {
      id: 5,
      name: "Dell XPS 13",
      price: 1299.99,
      uom: "pcs",
      stockOnHand: 0,
      image: "https://via.placeholder.com/50x50/6b7280/ffffff?text=DL",
      createdAt: "2024-01-05",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const uomOptions = [
    "pcs",
    "pair",
    "kg",
    "liter",
    "meter",
    "box",
    "pack",
    "unit",
  ];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      id: null,
      name: "",
      price: "",
      uom: "",
      stockOnHand: 0,
      image: null,
    },
  });

  const MySwal = withReactContent(Swal);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await ProductServices.update(data);
      } else {
        await ProductServices.store(data);
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

    // setProducts((prev) => [newProduct, ...prev]);
    handleCloseModal();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert("Please select a valid image file (JPG, PNG, WEBP)");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        setValue("image", file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    reset({
      id: null,
      name: "",
      price: "",
      uom: "",
      stockOnHand: "",
    });
    setSelectedImage(null);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.uom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  let ajax = {
    url: "http://127.0.0.1:8000/api/products/get-data",
    type: "GET",
    beforeSend: function (xhr) {
      const token = localStorage.getItem("token");
      if (token) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
      }
    },
  };

  let datatableColumns = [
    { title: "Name", data: 0 },
    { title: "Price", data: 1 },
    { title: "OUM", data: 2 },
    {
      title: "Image",
      data: 3,
      render: function (data, type, row, meta) {
        const imageUrl =
          "http://127.0.0.1:8000" + data || "/images/no-image.png";
        return `<img 
                  src="${imageUrl}" 
                  alt="Product Image" 
                  style="width: 80px; height: 80px; object-fit: cover; border-radius: 6px;"
                />`;
      },
    },
    { title: "Stock", data: 4 },
    {
      title: "Actions",
      data: null,
      orderable: false,
      searchable: false,
      render: function (data, type, row, meta) {
        const id = row[5];
        const name = row[0];
        const price = row[1];
        const uom = row[2];
        const image = row[3];
        const stock = row[4];

        if (user.role_names == "user") {
          return `<span class="text-muted fst-italic">No actions available</span>`;
        }

        return `
            <button class="btn btn-sm btn-primary me-2" onclick="handleEdit('${id}', '${name}', '${price}', '${uom}', '${image}', '${stock}')">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="handleDelete(${id})">Delete</button>
        `;
      },
    },
  ];

  window.handleEdit = function (id, name, price, uom, image, stock) {
    setIsEditMode(true);
    reset({
      id: id,
      name: name,
      price: price,
      uom: uom,
      stockOnHand: stock,
    });
    setShowModal(true);

    setSelectedImage("http://127.0.0.1:8000" + image);
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
          await ProductServices.destroy(id);
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
                Products
              </li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="h3 fw-bold text-dark mb-1">Products Management</h1>
          <p className="text-muted mb-0">
            Manage your product inventory and catalog
          </p>
        </div>

        {/* Add Button */}
        {user && user?.role_names == "admin" && (
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
            Add Product
          </button>
        )}
      </div>

      {/* Products Table */}

      <div className="card border-0 shadow-sm" style={{ borderRadius: "16px" }}>
        <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="fw-bold text-dark mb-0">Products List</h5>
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
                  buttons: [
                    {
                      text: "Alert",
                      action: function (e, dt, node, config, cb) {
                        alert("Activated!");
                      },
                    },
                  ],
                }}
                columns={datatableColumns}
                className="table table-striped"
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>UOM</th>
                    <th>Image</th>
                    <th>Stock On Hand</th>
                  </tr>
                </thead>
              </DataTable>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-5">
                <div className="text-muted">
                  <i
                    className="fas fa-search fs-1 mb-3"
                    style={{ opacity: "0.3" }}
                  ></i>
                  <h5 className="text-muted">No products found</h5>
                  <p className="text-muted">
                    Try adjusting your search criteria
                  </p>
                </div>
              </div>
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
                    Add New Product
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4">
                    {/* Image Upload Field */}
                    <div className="col-12">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Product Image
                      </label>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="border-2 border-dashed rounded d-flex align-items-center justify-content-center"
                          style={{
                            width: "80px",
                            height: "80px",
                            borderColor: "#e2e8f0",
                            backgroundColor: "#939AA0",
                          }}
                        >
                          {selectedImage ? (
                            <img
                              src={selectedImage}
                              alt="Preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          ) : (
                            <i className="fas fa-image text-muted fs-4"></i>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleImageChange}
                            className="form-control border-2"
                            style={{
                              borderColor: "#e2e8f0",
                              borderRadius: "10px",
                              height: "44px",
                            }}
                          />
                          <small className="text-muted">
                            Upload product image (JPG, PNG, WEBP - Max 2MB)
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Product Name Field */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        className="form-control border-2"
                        placeholder="Enter product name"
                        {...register("name", {
                          required: "Product name is required",
                          minLength: {
                            value: 2,
                            message:
                              "Product name must be at least 2 characters",
                          },
                          maxLength: {
                            value: 100,
                            message:
                              "Product name cannot exceed 100 characters",
                          },
                          pattern: {
                            value: /^[a-zA-Z0-9\s\-_]+$/,
                            message:
                              "Product name can only contain letters, numbers, spaces, hyphens, and underscores",
                          },
                        })}
                        style={{
                          borderColor: errors.name ? "#ef4444" : "#e2e8f0",
                          borderRadius: "10px",
                          height: "44px",
                        }}
                      />
                      {errors.name && (
                        <div className="text-danger mt-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.name.message}
                        </div>
                      )}
                    </div>

                    {/* Price Field */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Price *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="form-control border-2"
                        placeholder="0.00"
                        {...register("price", {
                          required: "Price is required",
                          min: {
                            value: 0,
                            message: "Price must be greater than 0",
                          },
                          max: {
                            value: 999999.99,
                            message: "Price cannot exceed 999,999.99",
                          },
                        })}
                        style={{
                          borderColor: errors.price ? "#ef4444" : "#e2e8f0",
                          borderRadius: "10px",
                          height: "44px",
                        }}
                      />
                      {errors.price && (
                        <div className="text-danger mt-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.price.message}
                        </div>
                      )}
                    </div>

                    {/* UOM Field */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Unit of Measurement *
                      </label>
                      <select
                        className="form-select border-2"
                        {...register("uom", {
                          required: "UOM is required",
                        })}
                        style={{
                          borderColor: errors.uom ? "#ef4444" : "#e2e8f0",
                          borderRadius: "10px",
                          height: "44px",
                        }}
                      >
                        <option value="">Select UOM</option>
                        {uomOptions.map((uom) => (
                          <option key={uom} value={uom}>
                            {uom}
                          </option>
                        ))}
                      </select>
                      {errors.uom && (
                        <div className="text-danger mt-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.uom.message}
                        </div>
                      )}
                    </div>

                    {/* Stock on Hand Field */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold text-dark small mb-2">
                        Stock on Hand *
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="form-control border-2"
                        placeholder="0"
                        {...register("stockOnHand", {
                          required: "Stock on hand is required",
                          min: {
                            value: 0,
                            message: "Stock cannot be negative",
                          },
                          max: {
                            value: 999999,
                            message: "Stock cannot exceed 999,999",
                          },
                        })}
                        style={{
                          borderColor: errors.stockOnHand
                            ? "#ef4444"
                            : "#e2e8f0",
                          borderRadius: "10px",
                          height: "44px",
                        }}
                      />
                      {errors.stockOnHand && (
                        <div className="text-danger mt-1 small">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {errors.stockOnHand.message}
                        </div>
                      )}
                    </div>
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
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn text-white border-0"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    style={{
                      background: isSubmitting
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
                        Saving...
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Save Product
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

export default Product;
