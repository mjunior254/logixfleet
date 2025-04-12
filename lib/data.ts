export async function fetchUsers() {
  // In a real application, you would fetch users from a database
  // This is a mock implementation
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUsers = [
        {
          id: 1,
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phoneNumber: "+1234567890",
          role: "Driver",
          department: "Operations",
          status: "Active",
        },
        {
          id: 2,
          firstName: "Jane",
          lastName: "Smith",
          email: "jane.smith@example.com",
          phoneNumber: "+1987654321",
          role: "FleetManager",
          department: "Logistics",
          status: "Active",
        },
        {
          id: 3,
          firstName: "Robert",
          lastName: "Johnson",
          email: "robert.j@example.com",
          phoneNumber: "+1122334455",
          role: "Accountant",
          department: "Finance",
          status: "Inactive",
        },
        {
          id: 4,
          firstName: "Sarah",
          lastName: "Williams",
          email: "sarah.w@example.com",
          phoneNumber: "+1555666777",
          role: "Supervisor",
          department: "Operations",
          status: "Active",
        },
        {
          id: 5,
          firstName: "Michael",
          lastName: "Brown",
          email: "michael.b@example.com",
          phoneNumber: "+1999888777",
          role: "Admin",
          department: "Administration",
          status: "Active",
        },
      ]
      resolve(mockUsers)
    }, 500)
  })
}
