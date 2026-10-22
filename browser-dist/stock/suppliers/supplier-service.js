import { StockDomainError } from "../core/errors.js";
function normalize(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr-FR")
        .trim();
}
export class SupplierStockService {
    now;
    id;
    staleAfterMinutes;
    adapters = new Map();
    constructor(now = () => new Date().toISOString(), id = () => crypto.randomUUID(), staleAfterMinutes = 180) {
        this.now = now;
        this.id = id;
        this.staleAfterMinutes = staleAfterMinutes;
    }
    register(adapter) {
        this.adapters.set(adapter.supplierId, adapter);
    }
    listAdapters() {
        return [...this.adapters.values()].map(adapter => ({
            supplierId: adapter.supplierId,
            supplierName: adapter.supplierName,
            status: adapter.getStatus(),
        }));
    }
    async search(query = "") {
        const needle = normalize(query);
        const availableAdapters = [...this.adapters.values()].filter(adapter => adapter.getStatus().ready);
        const batches = await Promise.all(availableAdapters.map(async (adapter) => {
            const rows = await adapter.search(query);
            return rows.filter(row => {
                if (!needle)
                    return true;
                return normalize([
                    row.designation,
                    row.supplierReference,
                    row.supplierName,
                    row.depotName ?? "",
                ].join(" ")).includes(needle);
            });
        }));
        return batches
            .flat()
            .map(row => ({ ...row, ...this.freshness(row) }))
            .sort((a, b) => {
            const stockOrder = this.stockRank(a.stockStatus) - this.stockRank(b.stockStatus);
            if (stockOrder !== 0)
                return stockOrder;
            const freshnessOrder = this.freshnessRank(a.freshness) - this.freshnessRank(b.freshness);
            if (freshnessOrder !== 0)
                return freshnessOrder;
            return a.supplierName.localeCompare(b.supplierName, "fr");
        });
    }
    prepareQuoteDraft(availability, quantity) {
        return this.prepareAction("QUOTE_REQUEST", availability, quantity);
    }
    prepareOrderDraft(availability, quantity) {
        return this.prepareAction("ORDER_REQUEST", availability, quantity);
    }
    prepareAction(type, availability, quantity) {
        if (!Number.isFinite(quantity) || quantity <= 0) {
            throw new StockDomainError("INVALID_QUANTITY", "La quantité demandée doit être strictement positive.", { quantity });
        }
        if (availability.freshness === "STALE") {
            throw new StockDomainError("VALIDATION_REQUIRED", "La disponibilité fournisseur est périmée. Actualisez les données avant de préparer une action.", { lastSyncAt: availability.lastSyncAt });
        }
        if (availability.stockStatus === "OUT_OF_STOCK") {
            throw new StockDomainError("VALIDATION_REQUIRED", "Le fournisseur indique une rupture. Une action automatique n'est pas préparée.", { supplierReference: availability.supplierReference });
        }
        return {
            id: this.id(),
            type,
            supplierId: availability.supplierId,
            supplierName: availability.supplierName,
            supplierReference: availability.supplierReference,
            productId: availability.productId,
            designation: availability.designation,
            quantity,
            unit: availability.unit,
            targetModule: type === "ORDER_REQUEST" ? "commandes" : "supplier_quote",
            validationRequired: true,
            createdAt: this.now(),
            sourceAvailability: {
                availableQuantity: availability.availableQuantity,
                stockStatus: availability.stockStatus,
                lastSyncAt: availability.lastSyncAt,
                freshness: availability.freshness,
            },
        };
    }
    freshness(row) {
        if (!row.lastSyncAt)
            return { freshness: "UNKNOWN", ageMinutes: null };
        const nowMs = new Date(this.now()).getTime();
        const syncMs = new Date(row.lastSyncAt).getTime();
        if (!Number.isFinite(nowMs) || !Number.isFinite(syncMs)) {
            return { freshness: "UNKNOWN", ageMinutes: null };
        }
        const ageMinutes = Math.max(0, Math.round((nowMs - syncMs) / 60_000));
        return {
            freshness: ageMinutes > this.staleAfterMinutes ? "STALE" : "FRESH",
            ageMinutes,
        };
    }
    stockRank(status) {
        return ({
            AVAILABLE: 0,
            LOW_STOCK: 1,
            ON_ORDER: 2,
            UNKNOWN: 3,
            OUT_OF_STOCK: 4,
        })[status];
    }
    freshnessRank(freshness) {
        return ({ FRESH: 0, UNKNOWN: 1, STALE: 2 })[freshness];
    }
}
