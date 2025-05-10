import { useQuery } from "@tanstack/react-query";
import { GetDashboardQueryParamsType } from "@/schemaValidations/dashboard.schema";
import indicatorsApiRequest from "@/apiRequests/indicators";

export const useDashboardIndicator = (queryParams: GetDashboardQueryParamsType) => {
  return useQuery({
    queryKey: ['dashboard-indicator', queryParams],
    queryFn: () => indicatorsApiRequest.getIndicators(queryParams),
  })
}