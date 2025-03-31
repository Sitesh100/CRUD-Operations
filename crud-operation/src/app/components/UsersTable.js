"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUsers, deleteUser } from "@/lib/api";
import UserForm from "./UserForm";
import { Search, UserPlus, Trash2, Edit2, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";

const UsersTable = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchBy, setSearchBy] = useState("name"); // name, email, or role

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", page],
    queryFn: () => fetchUsers(page),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(["users", page], (oldData) => {
        if (!oldData || !oldData.data) return oldData;
        const updatedData = oldData.data.filter((user) => user.id !== id);
        return { ...oldData, data: updatedData };
      });
    },
    onError: (error) => {
      alert(`Error deleting user: ${error.message}`);
    },
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
  };

  const handleAddUser = () => {
    setSelectedUser({});
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter users based on search term
  const filteredUsers = data?.data?.filter((user) => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    
    if (searchBy === "name") {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      return fullName.includes(term);
    } else if (searchBy === "email") {
      return user.email.toLowerCase().includes(term);
    } else if (searchBy === "role") {
      return (user.role || "User").toLowerCase().includes(term);
    }
    
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-radial-[at_50%_75%] from-sky-200 via-blue-300 to-indigo-100 to-90% rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
        <button
          onClick={handleAddUser}
          className="flex items-center text-black gap-2 bg-linear-to-r from-sky-300 to-indigo-300 hover:bg-gray-700 cursor-pointer px-4 py-2 rounded-md transition-colors"
        >
          <UserPlus size={18} />
          <span>Add User</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex mb-6 gap-2">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
          />
        </div>
    
      </div>

      {isLoading ? (
        <div className="text-center py-4">Loading users...</div>
      ) : isError ? (
        <div className="text-center py-4 text-red-500 flex items-center justify-center gap-2">
          <AlertCircle size={18} />
          <span>Error loading users. Please try again.</span>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers && filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{`${user.first_name} ${user.last_name}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "Admin" ? "bg-purple-100 text-purple-800" : "bg-green-100 text-green-800"
                        }`}>
                          {user.role || "User"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{data?.total_pages || 1}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </button>
              <button
                disabled={page >= (data?.total_pages || 1)}
                onClick={() => setPage((prev) => prev + 1)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* User Form Modal */}
      {selectedUser !== null && (
        <UserForm user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
};

export default UsersTable;