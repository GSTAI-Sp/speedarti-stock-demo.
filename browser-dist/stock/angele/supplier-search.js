/**
 * Façade de lecture pour Ángel.
 *
 * Règle absolue :
 * Ángel ne lit aucune table fournisseur directement.
 * Il passe uniquement par SupplierStockService, qui applique les règles
 * de fraîcheur, de statut et de séparation stock artisan/fournisseur.
 */
export class AngelSupplierSearchService {
    suppliers;
    now;
    constructor(suppliers, now = () => new Date().toISOString()) {
        this.suppliers = suppliers;
        this.now = now;
    }
    async search(query) {
        const clean = query.trim();
        const rows = await this.suppliers.search(clean);
        return {
            intent: "supplier_stock_search",
            query: clean,
            generatedAt: this.now(),
            source: "SupplierStockService",
            noDirectTableAccess: true,
            artisanStockMerged: false,
            results: rows.map(row => this.toResult(row)),
            message: this.message(rows),
        };
    }
    toResult(row) {
        return {
            supplierName: row.supplierName,
            supplierReference: row.supplierReference,
            designation: row.designation,
            availableQuantity: row.availableQuantity,
            unit: row.unit,
            stockStatus: row.stockStatus,
            freshness: row.freshness,
            lastSyncAt: row.lastSyncAt,
            depotName: row.depotName,
        };
    }
    message(rows) {
        if (rows.length === 0) {
            return "Aucune disponibilité fournisseur trouvée. Je n'invente aucune référence ni quantité.";
        }
        if (rows.length === 1) {
            const row = rows[0];
            return this.rowMessage(row);
        }
        return [
            `${rows.length} disponibilités fournisseur trouvées.`,
            ...rows.map(row => this.rowMessage(row)),
            "Ces disponibilités appartiennent aux fournisseurs et ne sont pas du stock artisan.",
        ].join(" ");
    }
    rowMessage(row) {
        const quantity = row.availableQuantity === null
            ? "quantité non communiquée"
            : `${row.availableQuantity} ${row.unit}`;
        const freshness = row.freshness === "FRESH"
            ? "donnée fraîche"
            : row.freshness === "STALE"
                ? "donnée périmée"
                : "fraîcheur inconnue";
        return `${row.supplierName} — réf. ${row.supplierReference} — ${quantity} — ${row.stockStatus} — ${freshness}.`;
    }
}
