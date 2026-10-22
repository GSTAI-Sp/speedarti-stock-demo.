import { StockDomainError } from "../core/errors.js";
export class StockReferenceDirectory {
    crews = new Map();
    chantiers = new Map();
    applyCrewSnapshot(payload) {
        if (!payload.crewId?.trim() || !payload.name?.trim()) {
            throw new StockDomainError("VALIDATION_REQUIRED", "crewId et nom d'équipe sont obligatoires.");
        }
        this.crews.set(payload.crewId, structuredClone(payload));
    }
    applyChantierSnapshot(payload) {
        if (!payload.chantierId?.trim() || !payload.name?.trim()) {
            throw new StockDomainError("VALIDATION_REQUIRED", "chantierId et nom de chantier sont obligatoires.");
        }
        this.chantiers.set(payload.chantierId, structuredClone(payload));
    }
    listCrews() {
        return [...this.crews.values()].filter(item => item.active).map(item => structuredClone(item));
    }
    listChantiers() {
        return [...this.chantiers.values()].filter(item => item.active).map(item => structuredClone(item));
    }
    requireCrew(crewId) {
        const item = this.crews.get(crewId);
        if (!item || !item.active) {
            throw new StockDomainError("VALIDATION_REQUIRED", "Équipe introuvable dans Équipe & Planning.", { crewId });
        }
        return structuredClone(item);
    }
    requireChantier(chantierId) {
        const item = this.chantiers.get(chantierId);
        if (!item || !item.active) {
            throw new StockDomainError("VALIDATION_REQUIRED", "Chantier introuvable dans Agenda / Chantier.", { chantierId });
        }
        return structuredClone(item);
    }
}
