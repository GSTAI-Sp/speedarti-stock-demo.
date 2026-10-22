export class InMemoryStockRepository {
    items = new Map();
    locations = new Map();
    movements = [];
    reservations = new Map();
    purchaseRequirements = new Map();
    inventorySessions = new Map();
    sourceEvents = new Set();
    offcuts = new Map();
    key(companyId, id) {
        return `${companyId}:${id}`;
    }
    async getItem(companyId, productId) {
        return structuredClone(this.items.get(this.key(companyId, productId)) ?? null);
    }
    async listItems(companyId) {
        return structuredClone([...this.items.values()].filter(x => x.companyId === companyId));
    }
    async saveItem(item) {
        this.items.set(this.key(item.companyId, item.id), structuredClone(item));
    }
    async getLocation(companyId, locationId) {
        return structuredClone(this.locations.get(this.key(companyId, locationId)) ?? null);
    }
    async listLocations(companyId) {
        return structuredClone([...this.locations.values()].filter(x => x.companyId === companyId));
    }
    async saveLocation(location) {
        this.locations.set(this.key(location.companyId, location.id), structuredClone(location));
    }
    async listMovements(companyId, productId) {
        return structuredClone(this.movements.filter(x => x.companyId === companyId && x.productId === productId));
    }
    async listAllMovements(companyId) {
        return structuredClone(this.movements.filter(x => x.companyId === companyId));
    }
    async appendMovement(movement) {
        this.movements.push(structuredClone(movement));
    }
    async listReservations(companyId, productId) {
        return structuredClone([...this.reservations.values()].filter(x => x.companyId === companyId && x.productId === productId));
    }
    async listAllReservations(companyId) {
        return structuredClone([...this.reservations.values()].filter(x => x.companyId === companyId));
    }
    async getReservation(companyId, reservationId) {
        return structuredClone(this.reservations.get(this.key(companyId, reservationId)) ?? null);
    }
    async saveReservation(reservation) {
        this.reservations.set(this.key(reservation.companyId, reservation.id), structuredClone(reservation));
    }
    async listPurchaseRequirements(companyId) {
        return structuredClone([...this.purchaseRequirements.values()].filter(x => x.companyId === companyId));
    }
    async savePurchaseRequirement(requirement) {
        this.purchaseRequirements.set(this.key(requirement.companyId, requirement.id), structuredClone(requirement));
    }
    async getInventorySession(companyId, sessionId) {
        return structuredClone(this.inventorySessions.get(this.key(companyId, sessionId)) ?? null);
    }
    async listInventorySessions(companyId) {
        return structuredClone([...this.inventorySessions.values()].filter(x => x.companyId === companyId));
    }
    async saveInventorySession(session) {
        this.inventorySessions.set(this.key(session.companyId, session.id), structuredClone(session));
    }
    async hasProcessedSourceEvent(companyId, sourceEventId) {
        return this.sourceEvents.has(this.key(companyId, sourceEventId));
    }
    async markSourceEventProcessed(companyId, sourceEventId) {
        this.sourceEvents.add(this.key(companyId, sourceEventId));
    }
    async listOffcuts(companyId, productId) {
        return structuredClone([...this.offcuts.values()].filter(x => x.companyId === companyId && (!productId || x.productId === productId)));
    }
    async saveOffcut(offcut) {
        this.offcuts.set(this.key(offcut.companyId, offcut.id), structuredClone(offcut));
    }
}
