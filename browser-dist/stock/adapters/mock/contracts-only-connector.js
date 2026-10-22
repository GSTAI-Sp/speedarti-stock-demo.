/**
 * Adaptateur de démo : conserve le contrat mais ne contacte aucun service réel.
 */
export class ContractsOnlyConnector {
    module;
    constructor(module) {
        this.module = module;
    }
    getStatus() {
        return {
            ready: false,
            mode: "contracts_only_no_live_connection",
            reason: "Sprint A : aucun raccordement production autorisé.",
        };
    }
    async send(_envelope) {
        throw new Error("Connexion production désactivée dans la démo Sprint A.");
    }
}
