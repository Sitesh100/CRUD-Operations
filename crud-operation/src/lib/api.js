import axios from "axios";

const API_URL = "https://reqres.in/api/users";

// Fetch users 
export const fetchUsers = async (page, searchParams = {}) => {
  try {
    const response = await axios.get(`${API_URL}?page=${page}&per_page=5`);
    if (!response.data || !response.data.data) {
      throw new Error("No data found");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Create a new user
export const createUser = async (user) => {
  try {
    const response = await axios.post(API_URL, user);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// Update an existing user
export const updateUser = async (user) => {
  try {
    const response = await axios.put(`${API_URL}/${user.id}`, user);
    if (response.status !== 200) {
      throw new Error("Failed to update user");
    }
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Delete a user
export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    if (response.status !== 204 && response.status !== 200) {
      // ReqRes returns 204 on successful delete
      throw new Error("Failed to delete user");
    }
    return { message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};