# PageFlow Library Management System

A full-stack web application that replicates the functionality of a local library, allowing users to browse books, check them out and leave reviews. Librarians can manage the inventory through an admin interface.

## Technologies Used

### Backend
- ASP.NET Core 8 Web API
- Entity Framework Core with SQL Server
- ASP.NET Identity for authentication
- JWT for secure API access
- SignalR for real-time chat functionality
- Swagger UI for API documentation
- Serilog for structured logging

### Frontend
- React with TypeScript
- Material UI component library
- React Router for navigation
- Formik and Yup for form validation
- Axios for API communication

## Features

- **User Authentication**
 - Registration and login
 - Role-based authorization (Librarian/Customer)
 - JWT token-based API security

- **Book Management**
 - View all books with filtering and pagination
 - Search by title, author, and category
 - Book details with cover images
 - Featured books and new arrivals sections

- **Checkout System**
 - Customers can check out available books
 - Librarians can process returns
 - Automatic due date calculation (5 days from checkout)
 - Visual indicators for due status

- **Reviews**
 - Customers can rate books (1-5 stars)
 - Leave optional written reviews
 - View others' reviews

- **Admin Features**
 - Add, edit, and remove books
 - View all active checkouts
 - Process returns

- **Live Chat Assistant**
 - Book recommendations
 - Library information
 - SignalR-powered real-time communication

## Setup Instructions

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [SQL Server 2022](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (Developer Edition is fine)
- [Node.js](https://nodejs.org/) (v16 or later)
- [SQL Server Management Studio](https://learn.microsoft.com/en-us/sql/ssms/download-sql-server-management-studio-ssms) (optional, for DB management)

### Backend Setup

1. **Clone the Repository**
git clone https://github.com/br5692/PageFlow.git
cd PageFlow/backend

2. **Restore NuGet Packages**
  dotnet restore

3. **Configure the Database Connection and JWT Key**

  dotnet user-secrets set "ConnectionStrings:LibraryDB" "Server=localhost;Database=LibraryDB;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=true"
  
  dotnet user-secrets set "Jwt:Key" "YourSuperSecretKeyWithAtLeast32Characters"

4. **Apply Database Migrations**
  dotnet ef database update

5. **Run the Backend**
  dotnet run
  The API will be available at:
  - **HTTP:** `http://localhost:5000`
  - **HTTPS:** `https://localhost:5001`

  You can access the **Swagger UI** at:
  - `https://localhost:5001/swagger`


### Frontend Setup

1. **Navigate to the Frontend Directory**
  cd ../frontend

2. **Install Dependencies**
  npm install

3. **Create Environment File**
  Create a .env file with:
  REACT_APP_API_URL=https://localhost:5001/api

4. **Start the Development Server**
  npm start
  The app will be available at http://localhost:3000

## Testing Instructions

### Backend Testing
1. **Running Tests**
  - Open the solution in Visual Studio
  - Open Test Explorer (Test > Test Explorer)
  - If tests do not automatically appear:
    * Right-click on the solution
    * Select "Restore NuGet Packages"
    * Go to Test > Test Explorer
    * Click "Run All Tests" or right-click on specific test projects

2. **Troubleshooting Test Discovery**
  - Ensure all test projects reference the correct test SDK packages
  - Verify xUnit or NUnit packages are correctly installed
  - Rebuild the solution before running tests

3. **Test Projects**
  - Backend tests are located in dedicated test projects within the solution
  - Includes unit tests for:
    * Controllers
    * Services
    * Data Access

### Frontend Testing
1. **Running Tests**

  cd frontend

  npm test

## Database Schema
- **Books:** Stores book information
- **Users:** ASP.NET Identity user accounts
- **Checkouts:** Records of book borrowing
- **Reviews:** User book ratings and comments
- View the detailed Entity Relationship Diagram (ERD) at: https://dbdiagram.io/d/LMS-Schema-67c93002263d6cf9a0658ade

## Default Accounts
After setup, the system is seeded with two default accounts:

### Librarian
- **Email:** admin@library.com
- **Password:** Admin@123

### Customer
- **Email:** customer@library.com
- **Password:** Customer@123

## Architecture

### Backend
- `Controllers/`: API endpoints
- `Models/`: Entity models mapped to database tables
- `DTOs/`: Data Transfer Objects for API requests/responses
- `Services/`: Business logic layer
- `Data/`: Database context and migrations
- `Hubs/`: SignalR real-time communication

### Frontend
- `src/components/`: Reusable UI components
- `src/pages/`: Page-level components
- `src/services/`: API communication
- `src/context/`: React context for global state
- `src/utils/`: Helper functions
- `src/types/`: TypeScript interfaces

## API Documentation
API documentation is available through Swagger UI at https://localhost:7067/swagger when the backend is running.

## Development Notes
- Code-first migrations are used for database schema updates
- The application uses Bogus for seeding realistic test data
- JWT tokens expire after 3 hours
- Books are checked out for 5 days by default