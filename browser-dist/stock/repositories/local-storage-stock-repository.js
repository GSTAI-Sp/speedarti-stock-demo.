const EMPTY = {
    version: 4,
    items: [],
    locations: [],
    movements: [],
    reservations: [],
    purchaseRequirements: [],
    inventorySessions: [],
    sourceEvents: [],
    offcuts: [],
};
export class LocalStorageStockRepository {
    storage;
    storageKey;
    constructor(storage, storageKey = "speedarti.stock.demo.v1") {
        this.storage = storage;
        this.storageKey = storageKey;
    }
    load() {
        try {
            const raw = this.storage.getItem(this.storageKey);
            if (!raw)
                return structuredClone(EMPTY);
            const parsed = JSON.parse(raw);
            if (parsed.version !== 1 && parsed.version !== 2 && parsed.version !== 3 && parsed.version !== 4) {
                return structuredClone(EMPTY);
            }
            const items = Array.isArray(parsed.items)
                ? parsed.items.map(item => ({ ...item, secondary: item.secondary ?? null }))
                : [];
            return {
                version: 4,
                items,
                locations: Array.isArray(parsed.locations) ? parsed.locations : [],
                movements: Array.isArray(parsed.movements) ? parsed.movements : [],
                reservations: Array.isArray(parsed.reservations) ? parsed.reservations : [],
                purchaseRequirements: Array.isArray(parsed.purchaseRequirements) ? parsed.purchaseRequirements : [],
                inventorySessions: Array.isArray(parsed.inventorySessions) ? parsed.inventorySessions : [],
                sourceEvents: Array.isArray(parsed.sourceEvents) ? parsed.sourceEvents : [],
                offcuts: Array.isArray(parsed.offcuts) ? parsed.offcuts : [],
            };
        }
        catch {
            return structuredClone(EMPTY);
        }
    }
    save(state) {
        this.storage.setItem(this.storageKey, JSON.stringify(state));
    }
    async getItem(companyId, productId) {
        return structuredClone(this.load().items.find(x => x.companyId === companyId && x.id === productId) ?? null);
    }
    async listItems(companyId) {
        return structuredClone(this.load().items.filter(x => x.companyId === companyId));
    }
    async saveItem(item) {
        const state = this.load();
        const index = state.items.findIndex(x => x.companyId === item.companyId && x.id === item.id);
        if (index >= 0)
            state.items[index] = structuredClone(item);
        else
            state.items.push(structuredClone(item));
        this.save(state);
    }
    async getLocation(companyId, locationId) {
        return structuredClone(this.load().locations.find(x => x.companyId === companyId && x.id === locationId) ?? null);
    }
    async listLocations(companyId) {
        return structuredClone(this.load().locations.filter(x => x.companyId === companyId));
    }
    async saveLocation(location) {
        const state = this.load();
        const index = state.locations.findIndex(x => x.companyId === location.companyId && x.id === location.id);
        if (index >= 0)
            state.locations[index] = structuredClone(location);
        else
            state.locations.push(structuredClone(location));
        this.save(state);
    }
    async listMovements(companyId, productId) {
        return structuredClone(this.load().movements.filter(x => x.companyId === companyId && x.productId === productId));
    }
    async listAllMovements(companyId) {
        return structuredClone(this.load().movements.filter(x => x.companyId === companyId));
    }
    async appendMovement(movement) {
        const state = this.load();
        state.movements.push(structuredClone(movement));
        this.save(state);
    }
    async listReservations(companyId, productId) {
        return structuredClone(this.load().reservations.filter(x => x.companyId === companyId && x.productId === productId));
    }
    async listAllReservations(companyId) {
        return structuredClone(this.load().reservations.filter(x => x.companyId === companyId));
    }
    async getReservation(companyId, reservationId) {
        return structuredClone(this.load().reservations.find(x => x.companyId === companyId && x.id === reservationId) ?? null);
    }
    async saveReservation(reservation) {
        const state = this.load();
        const index = state.reservations.findIndex(x => x.companyId === reservation.companyId && x.id === reservation.id);
        if (index >= 0)
            state.reservations[index] = structuredClone(reservation);
        else
            state.reservations.push(structuredClone(reservation));
        this.save(state);
    }
    async listPurchaseRequirements(companyId) {
        return structuredClone(this.load().purchaseRequirements.filter(x => x.companyId === companyId));
    }
    async savePurchaseRequirement(requirement) {
        const state = this.load();
        const index = state.purchaseRequirements.findIndex(x => x.companyId === requirement.companyId && x.id === requirement.id);
        if (index >= 0)
            state.purchaseRequirements[index] = structuredClone(requirement);
        else
            state.purchaseRequirements.push(structuredClone(requirement));
        this.save(state);
    }
    async getInventorySession(companyId, sessionId) {
        return structuredClone(this.load().inventorySessions.find(x => x.companyId === companyId && x.id === sessionId) ?? null);
    }
    async listInventorySessions(companyId) {
        return structuredClone(this.load().inventorySessions.filter(x => x.companyId === companyId));
    }
    async saveInventorySession(session) {
        const state = this.load();
        const index = state.inventorySessions.findIndex(x => x.companyId === session.companyId && x.id === session.id);
        if (index >= 0)
            state.inventorySessions[index] = structuredClone(session);
        else
            state.inventorySessions.push(structuredClone(session));
        this.save(state);
    }
    async hasProcessedSourceEvent(companyId, sourceEventId) {
        return this.load().sourceEvents.includes(`${companyId}:${sourceEventId}`);
    }
    async markSourceEventProcessed(companyId, sourceEventId) {
        const state = this.load();
        const key = `${companyId}:${sourceEventId}`;
        if (!state.sourceEvents.includes(key))
            state.sourceEvents.push(key);
        this.save(state);
    }
    async listOffcuts(companyId, productId) {
        return structuredClone(this.load().offcuts.filter(x => x.companyId === companyId && (!productId || x.productId === productId)));
    }
    async saveOffcut(offcut) {
        const state = this.load();
        const index = state.offcuts.findIndex(x => x.companyId === offcut.companyId && x.id === offcut.id);
        if (index >= 0)
            state.offcuts[index] = structuredClone(offcut);
        else
            state.offcuts.push(structuredClone(offcut));
        this.save(state);
    }
}
