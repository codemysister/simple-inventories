import apiInterceptor from "./ApiInterceptor";

const fetch = async (id) => {
  const response = await apiInterceptor.get("/products/fetch");

  return response.data;
};

const store = async (productData) => {
  const formData = new FormData();

  formData.append("name", productData.name.trim());
  formData.append("price", parseFloat(productData.price));
  formData.append("uom", productData.uom.toLowerCase());
  formData.append("stock_on_hand", parseInt(productData.stockOnHand));

  if (productData.image && productData.image instanceof File) {
    formData.append("image", productData.image);
  }

  const response = await apiInterceptor.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

const update = async (productData) => {
  const formData = new FormData();

  formData.append("name", productData.name.trim());
  formData.append("price", parseFloat(productData.price));
  formData.append("uom", productData.uom.toLowerCase());
  formData.append("stock_on_hand", parseInt(productData.stockOnHand));
  formData.append("_method", "PUT");

  if (productData.image && productData.image instanceof File) {
    formData.append("image", productData.image);
  }

  const response = await apiInterceptor.post(
    "/products/" + productData.id,
    formData
  );

  return response.data;
};

const destroy = async (id) => {
  const response = await apiInterceptor.delete("/products/" + id);

  return response.data;
};

export default {
  fetch,
  store,
  update,
  destroy,
};
