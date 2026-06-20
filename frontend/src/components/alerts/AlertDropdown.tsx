import { AlertTriangle } from "lucide-react";
import { useInventoryAlerts } from "../../hooks/useInventoryAlerts";
import { useInvoiceAlerts } from "../../hooks/useInvoiceAlerts";
import { useCustomerAlerts } from "../../hooks/useCustomerAlerts";

export default function AlertDropdown() {
  const { data, isLoading } = useInventoryAlerts();
  const { data: invoiceData } = useInvoiceAlerts();
  const { data: customerData } = useCustomerAlerts();

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-gray-500">
        Loading alerts...
      </div>
    );
  }

  const alerts = data?.alerts || [];
  const invoiceAlerts = invoiceData?.alerts || [];
  const customerAlerts = customerData?.alerts || [];
  

  return (
    <div className="w-96 max-h-150 overflow-y-auto bg-white rounded-xl border border-gray-200 shadow-xl">
      <div className="p-4 border-b">
        <h3 className="font-bold">
          Inventory Alerts
        </h3>
      </div>

      {alerts.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">
          No alerts
        </div>
      ) : (
        alerts.map((alert: any) => (
          <div
            key={alert.productId}
            className="p-4 border-b last:border-b-0"
          >
            <div className="flex gap-3">
              <AlertTriangle
                className={
                  alert.severity === "critical"
                    ? "text-red-500"
                    : "text-yellow-500"
                }
              />

              <div>
                <p className="font-medium text-sm font-sans">
                  {alert.message}
                </p>

                <p className="text-xs text-red-500 mt-1 font-mono">
                  Stock: {alert.stock}
                </p>
              </div>
            </div>
          </div>
        ))
      )}

      <div className="p-4 border-t">
        <h3 className="font-bold">
          Invoice Alerts
        </h3>
      </div>

      {invoiceAlerts.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">
          No invoice alerts
        </div>
      ) : (
        invoiceAlerts.map((alert: any) => (
          <div
            key={alert.invoiceId}
            className="p-4 border-b last:border-b-0"
          >
            <div className="flex gap-3">
              <AlertTriangle
                className={
                  alert.severity === "critical"
                    ? "text-red-500"
                    : "text-yellow-500"
                }
              />

              <div>
                <p className="font-medium text-sm">
                  {alert.message}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Total: ${alert.total}
                </p>

                <p className="text-xs text-gray-500">
                  Pending: {alert.daysPending} days
                </p>
              </div>
            </div>
          </div>
        ))
      )}

      <div className="p-4 border-t">
        <h3 className="font-bold">
          Customer Alerts
        </h3>
      </div>

      {customerAlerts.length === 0 ? (
        <div className="p-4 text-sm text-gray-500">
          No customer alerts
        </div>
      ) : (
        customerAlerts.map((alert: any) => (
          <div
            key={`${alert.type}-${alert.customerId}`}
            className="p-4 border-b last:border-b-0"
          >
            <div className="flex gap-3">
              <AlertTriangle
                className={
                  alert.severity === "warning"
                    ? "text-yellow-500"
                    : "text-blue-500"
                }
              />

              <div>
                <p className="font-medium text-sm">
                  {alert.message}
                </p>

                {alert.type === "TOP_CUSTOMER" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total Spent: ${alert.totalSpent?.toFixed(2)}
                  </p>
                )}

                {alert.type === "INACTIVE_CUSTOMER" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Inactive: {alert.daysInactive} days
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}