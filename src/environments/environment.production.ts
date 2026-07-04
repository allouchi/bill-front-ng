// Production: same-origin behind the APISIX ingress at fact.iacsas.org, which routes each
// gateway prefix (/authent, /company, /client, /consultant, /prestation, /facture, /chatbot)
// to the Spring Cloud Gateway. Paths mirror the dev gateway routing (not the old broken /api/*).
const BASE = 'https://fact.iacsas.org';

export const environment = {
    production: true,
    development: false,
    apiURL: `${BASE}/api`,
    botURL: `${BASE}/chatbot/api`,
    authURL: `${BASE}/authent/api`,
    userURL: `${BASE}/authent/api/users`,
    roleURL: `${BASE}/authent/api/roles`,
    tvaURL: `${BASE}/facture/api/tvas`,
    exerciseURL: `${BASE}/facture/api/exercises`,
    companyURL: `${BASE}/company/api/companies`,
    consultantURL: `${BASE}/consultant/api/consultants`,
    clientURL: `${BASE}/client/api/clients`,
    factureURL: `${BASE}/facture/api/factures`,
    operationURL: `${BASE}/facture/api/operations`,
    compteURL: `${BASE}/facture/api/comptes`,
    prestationURL: `${BASE}/prestation/api/prestations`,
    editionURL: `${BASE}/facture/api/editions`,
};
