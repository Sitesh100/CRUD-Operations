# Next.js CRUD Application

## 🚀 Project Overview
This is a **CRUD (Create, Read, Update, Delete) application** built using **Next.js**. It integrates **TanStack React Query** for data fetching and state management, **Axios** for API communication, and **Zod** for data validation.

## 🛠️ Technologies Used
- **Next.js** - React framework for SSR and static generation
- **TanStack React Query** - Efficient data fetching and caching
- **Axios** - Simplified API requests
- **Zod** - Schema validation for form inputs
- **TailwindCSS** - Styling

## 📂 Folder Structure
```
📦 project-root
 ┣ 📂 components    # Userform and UserTabe
 ┣ 📂 pages         # Next.js pages
 ┣ 📂 Query         # QueryProvider.js
 ┣ 📂 lib           # api.js
 ┣ 📜 README.md     # Project documentation
 ┣ 📜 package.json  # Dependencies
```

## 🔧 Installation & Setup
### 1️⃣ Clone the Repository
```sh
https://github.com/Sitesh100/CRUD-Operations.git
cd CRUD-Operations
```

### 2️⃣ Install Dependencies
```sh
npm install
```

### 3️⃣ Run the Development Server
```sh
npm run dev
```
Application will be running at: `http://localhost:3000`

## 🔗 API Endpoints
Using [ReqRes](https://reqres.in/) as a mock API.
```
GET    /api/users?page=1  # Fetch users (pagination)
POST   /api/users         # Create a new user
PUT    /api/users/:id     # Update a user
DELETE /api/users/:id     # Delete a user
```

## 📝 Features
- Fetch and display user data with **pagination**
- Add new users with **form validation (Zod)**
- Update user details
- Delete users
- Optimistic UI updates with **React Query**

## 📌 Implementation Details
### Fetch Users (React Query + Axios)
```tsx
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchUsers = async (page) => {
  const { data } = await axios.get(`https://reqres.in/api/users?page=${page}`);
  return data;
};

export const useUsers = (page) => {
  return useQuery(['users', page], () => fetchUsers(page));
};
```

### Form Validation with Zod
```tsx
import { z } from 'zod';

const userSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["User", "Admin"])
});
```







