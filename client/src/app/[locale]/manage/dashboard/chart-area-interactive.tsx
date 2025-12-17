"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TimeStatsType } from "@/schemaValidations/dashboard.schema"
import { useTranslations } from "next-intl"

interface ChartData {
  date: string
  orders: number
  revenue: number
  visitors: number
}

export function ChartAreaInteractive({ chartData }: { chartData: TimeStatsType[] }) {
  const t = useTranslations("dashboard")
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [activeKeys, setActiveKeys] = React.useState<string[]>(["orders", "revenue", "visitors"])

  const chartConfig = {
    Chart: {
      label: t("reportChart"),
    },
    orders: {
      label: t("orders"),
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: t("revenue"),
      color: "hsl(var(--chart-2))",
    },
    visitors: {
      label: t("visitors"),
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  const handleToggleDataSeries = (value: string[]) => {
    setActiveKeys(value)
  }

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>{t("reportChart")}</CardTitle>
            <CardDescription>
              <span className="@[540px]/card:block hidden">{t("viewPerformanceMetrics")}</span>
              <span className="@[540px]/card:hidden">
                {timeRange === "7d" ? t("last7Days") : timeRange === "30d" ? t("last30Days") : t("last3Months")}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="multiple"
              value={activeKeys}
              onValueChange={handleToggleDataSeries}
              variant="outline"
              className="hidden sm:flex"
            >
              <ToggleGroupItem value="orders" aria-label={t("toggleOrders")} className="px-3 text-xs">
                {t("orders")}
              </ToggleGroupItem>
              <ToggleGroupItem value="revenue" aria-label={t("toggleRevenue")} className="px-3 text-xs">
                {t("revenue")}
              </ToggleGroupItem>
              <ToggleGroupItem value="visitors" aria-label={t("toggleVisitors")} className="px-3 text-xs">
                {t("visitors")}
              </ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="h-8 w-[80px]">
                <SelectValue placeholder={t("selectRange")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7d</SelectItem>
                <SelectItem value="30d">30d</SelectItem>
                <SelectItem value="90d">90d</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                </linearGradient>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.toLocaleString()}
                width={40}
              />
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "5 5" }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    indicator="line"
                  />
                }
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value, entry) => {
                  return <span className="text-xs font-medium">{value.charAt(0).toUpperCase() + value.slice(1)}</span>
                }}
              />
              {activeKeys.includes("orders") && (
                <Area
                  dataKey="orders"
                  type="monotone"
                  fill="url(#fillOrders)"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              )}
              {activeKeys.includes("revenue") && (
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              )}
              {activeKeys.includes("visitors") && (
                <Area
                  dataKey="visitors"
                  type="monotone"
                  fill="url(#fillVisitors)"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
