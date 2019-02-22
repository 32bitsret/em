module.exports = {
    strictParty: true,
    parties: ['PDP','APC','SDP','APGA','ADP','ANN','AD'],
    controlLevel: process.env.CONTROL_LEVEL || "WARD",
    state: process.env.STATE || "Plateau State",
    electionYear: process.env.ELECTION_YEAR || "2019",
    admins: process.env.ADMINS ? process.env.ADMINS.split(',') : ['2348161730129']
}