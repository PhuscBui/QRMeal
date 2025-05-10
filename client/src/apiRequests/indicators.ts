import http from "@/lib/http";
import { GetDashboardQueryParamsType, GetDashboardResType } from "@/schemaValidations/dashboard.schema";
import queryString from "query-string";


const indicatorsApiRequest = {
  getIndicators: (queryParams: GetDashboardQueryParamsType) => http.get<GetDashboardResType>("/indicators/dashboard?" +  queryString.stringify({
          fromDate: queryParams.fromDate?.toISOString(),
          toDate: queryParams.toDate?.toISOString(),
        })),
}

export default indicatorsApiRequest
