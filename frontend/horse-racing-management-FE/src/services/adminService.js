import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/admin",
});

export const getUsers = async (
  page = 0,
  size = 10,
  keyword = "",
  role = "",
  status = ""
) => {
  const response = await api.get("/users", {
    params: {
      page,
      size,
      keyword,
      role,
      status,
    },
  });

  return response.data;
};

export const updateUserRole = async (
  id,
  roleName
) => {
  return api.put(
    `/users/${id}/role`,
    {
      roleName,
    }
  );
};

export const updateUserStatus = async (
  id,
  status
) => {
  return api.put(
    `/users/${id}/status`,
    {
      status,
    }
  );
};