import { StockDomainError } from "../core/errors.js";
export class StockConnectorRegistry {
    connectors = new Map();
    register(connector) {
        this.connectors.set(connector.module, connector);
    }
    status(module) {
        return this.connectors.get(module)?.getStatus() ?? {
            ready: false,
            mode: "contracts_only_no_live_connection",
            reason: "Connecteur non enregistré.",
        };
    }
    async send(module, envelope) {
        const connector = this.connectors.get(module);
        if (!connector || !connector.getStatus().ready) {
            throw new StockDomainError("CONNECTOR_UNAVAILABLE", `Connecteur ${module} indisponible.`, {
                module,
                status: connector?.getStatus() ?? null,
            });
        }
        return connector.send(envelope);
    }
    list() {
        return [...this.connectors.entries()].map(([module, connector]) => ({
            module,
            status: connector.getStatus(),
        }));
    }
}
