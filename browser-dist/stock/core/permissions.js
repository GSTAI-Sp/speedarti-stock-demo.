import { StockDomainError } from "./errors.js";
export const STOCK_PERMISSIONS = [
    "stock.read",
    "stock.create",
    "stock.entry",
    "stock.exit",
    "stock.adjust",
    "stock.inventory",
    "stock.manage_locations",
    "stock.view_purchase_prices",
];
export function assertStockPermission(context, permission) {
    if (!context.permissions.includes(permission)) {
        throw new StockDomainError("PERMISSION_DENIED", `Permission requise : ${permission}.`, {
            userId: context.userId,
            permission,
        });
    }
}
