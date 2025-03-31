"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser, updateUser } from "@/lib/api";
import { X, Save, User } from "lucide-react";
import { z } from "zod";

// Define a schema for your form validation
const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["User", "Admin"])
});

const UserForm = ({ user, onClose }) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "User",
  });
  const [errors, setErrors] = useState({});

  // Pre-fill form data if editing
  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role: user.role || "User",
      });
    }
  }, [user]);

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (response) => {
      // Get the current page
      const currentPage = queryClient.getQueryData(["users", 1]);
      
      if (currentPage && currentPage.data) {
        // Update the cache directly with the new user
        queryClient.setQueryData(["users", 1], {
          ...currentPage,
          data: [response, ...currentPage.data]
        });
      } else {
        // Invalidate to refetch if we can't update the cache directly
        queryClient.invalidateQueries({ queryKey: ["users"] });
      }
      
      onClose();
    },
    onError: (error) => {
      setErrors({ form: error.message || "Error creating user" });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: (userData) => updateUser(userData),
    onSuccess: (response, userData) => {
      // Find the page that has the updated user
      const pages = queryClient.getQueriesData({ queryKey: ["users"] });
      
      for (const [queryKey, pageData] of pages) {
        if (pageData && pageData.data) {
          // Find if this page has the user
          const userIndex = pageData.data.findIndex(u => u.id === userData.id);
          
          if (userIndex !== -1) {
            // Update the user in the cache
            const newData = [...pageData.data];
            newData[userIndex] = { ...newData[userIndex], ...userData };
            
            queryClient.setQueryData(queryKey, {
              ...pageData,
              data: newData
            });
            break;
          }
        }
      }
      
      onClose();
    },
    onError: (error) => {
      setErrors({ form: error.message || "Error updating user" });
    },
  });

  // Zod validation function
  const validateForm = () => {
    try {
      userSchema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach(err => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    if (user?.id) {
      // Update existing user
      updateMutation.mutate({ ...user, ...formData });
    } else {
      // Create new user
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  // Determine if we're currently in a loading state
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {user?.id ? "Edit User" : "Add New User"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange("first_name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.first_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange("last_name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.last_name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {errors.form && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {user?.id ? "Update User" : "Create User"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;