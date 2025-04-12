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

type Vehicle = {
  license_plate: string
  make: string
  model: string
  year: string | number | null
  vehicle_type: string
  driver?: string
  fuel_type: string
  color: string
  doors: number
  wheels: number
  status?: string
}

type VehicleReportChartProps = {
  vehicles: Vehicle[]
  type?: "type" | "fuel" | "age"
}

export function VehicleReportChart({ vehicles, type = "type" }: VehicleReportChartProps) {
  if (type === "type") {
    // Count vehicles by type
    const vehiclesByType = vehicles.reduce(
      (acc, vehicle) => {
        const type = vehicle.vehicle_type || "Unknown"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const data = Object.entries(vehiclesByType).map(([name, value]) => ({ name, value }))

    // Colors for pie chart
    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

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
            <Tooltip formatter={(value) => [`${value} vehicles`, "Count"]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "fuel") {
    // Count vehicles by fuel type
    const vehiclesByFuel = vehicles.reduce(
      (acc, vehicle) => {
        const fuel = vehicle.fuel_type || "Unknown"
        acc[fuel] = (acc[fuel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const data = Object.entries(vehiclesByFuel).map(([name, value]) => ({ name, value }))

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
            <Bar dataKey="value" name="Vehicles" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (type === "age") {
    const currentYear = new Date().getFullYear()

    // Group vehicles by age range
    const ageRanges = {
      "< 1 year": 0,
      "1-3 years": 0,
      "3-5 years": 0,
      "5-10 years": 0,
      "> 10 years": 0,
      Unknown: 0,
    }

    vehicles.forEach((vehicle) => {
      const year = Number(vehicle.year)
      if (!year || isNaN(year)) {
        ageRanges["Unknown"]++
        return
      }

      const age = currentYear - year

      if (age < 1) ageRanges["< 1 year"]++
      else if (age < 3) ageRanges["1-3 years"]++
      else if (age < 5) ageRanges["3-5 years"]++
      else if (age < 10) ageRanges["5-10 years"]++
      else ageRanges["> 10 years"]++
    })

    const data = Object.entries(ageRanges).map(([name, value]) => ({ name, value }))

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
            <Bar dataKey="value" name="Vehicles" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return null
}
