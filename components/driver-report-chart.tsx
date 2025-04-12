"use client"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

type Driver = {
  name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  license_number: string
  license_expiry: string
  status: string
  vehicle?: string
  vehicle_name?: string
}

type DriverReportChartProps = {
  drivers: Driver[]
  type?: "status" | "license"
}

export function DriverReportChart({ drivers, type = "status" }: DriverReportChartProps) {
  if (type === "status") {
    // Count drivers by status
    const driversByStatus = drivers.reduce(
      (acc, driver) => {
        const status = driver.status || "Unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const data = Object.entries(driversByStatus).map(([name, value]) => ({ name, value }))

    // Colors for pie chart
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} drivers`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "license") {
    const currentDate = new Date()

    // Group drivers by license expiry
    const expiryRanges = {
      Expired: 0,
      "< 30 days": 0,
      "1-3 months": 0,
      "3-6 months": 0,
      "6-12 months": 0,
      "> 12 months": 0,
    }

    drivers.forEach((driver) => {
      if (!driver.license_expiry) return

      const expiryDate = new Date(driver.license_expiry)
      const diffTime = expiryDate.getTime() - currentDate.getTime()
      const diffDays = diffTime / (1000 * 3600 * 24)

      if (diffDays < 0) expiryRanges["Expired"]++
      else if (diffDays < 30) expiryRanges["< 30 days"]++
      else if (diffDays < 90) expiryRanges["1-3 months"]++
      else if (diffDays < 180) expiryRanges["3-6 months"]++
      else if (diffDays < 365) expiryRanges["6-12 months"]++
      else expiryRanges["> 12 months"]++
    })

    const data = Object.entries(expiryRanges).map(([name, value]) => ({ name, value }))

    return (
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Drivers" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}
