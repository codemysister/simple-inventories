import apiInterceptor from "./ApiInterceptor";

const fetch = async (id) => {
  const response = await apiInterceptor.get("/products/fetch");

  return response.data;
};

const store = async (data) => {
  const formData = new FormData();

  formData.append("product_id", data.product_id.trim());
  formData.append("type", data.type);
  formData.append("quantity", data.quantity);

  const response = await apiInterceptor.post("/stock-movements", formData);

  return response.data;
};

const update = async (data) => {
  const payload = {
    product_id: data.product_id.trim(),
    type: data.type,
    quantity: data.quantity,
  };
  const response = await apiInterceptor.put(
    "/stock-movements/" + data.id,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

const destroy = async (id) => {
  const response = await apiInterceptor.delete("/stock-movements/" + id);
  return response.data;
};

const approve = async (id) => {
  const response = await apiInterceptor.put("/stock-movements/approve/" + id);
  return response.data;
};

const reject = async (data) => {
  const payload = {
    remark: data.remark,
  };
  const response = await apiInterceptor.put(
    "/stock-movements/reject/" + data.id,
    payload
  );
  return response.data;
};

export default {
  fetch,
  store,
  update,
  destroy,
  approve,
  reject,
};
