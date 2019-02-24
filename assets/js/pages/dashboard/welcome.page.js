parasails.registerPage('welcome', {

  template: '#election-result-table-template',

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    modal: '',
    pageLoadedAt: Date.now(),
    electionresults: [], 
    incidencereports: [],
    resultSummary: [],
    smserrors: [],
    puswithoutresult: [],
  },
  //  ╦  ╦╔═╗╔═╗╔═╗╦ ╦╔═╗╦  ╔═╗
  //  ║  ║╠╣ ║╣ ║  ╚╦╝║  ║  ║╣
  //  ╩═╝╩╚  ╚═╝╚═╝ ╩ ╚═╝╩═╝╚═╝
  beforeMount: function() {
    // Attach any initial data from the server.
    _.extend(this, SAILS_LOCALS);
  },
  mounted: async function() {
    await this.getElectionResult();
    await this.getIncidenceResult();
    await this.getResultSummary();
    await this.getSMSErrors();
    await this.getPusWithoutResult();
    let self = this;
    io.socket.on('message', function (data){
      if(data.type === 'electionresult'){
        self.getElectionResult();
        self.getResultSummary();
      }else if(data.type === 'incidencereport'){
        self.getResultSummary();
      }else{
        self.getSMSErrors();
      }
    });
  },

  //  ╦  ╦╦╦═╗╔╦╗╦ ╦╔═╗╦    ╔═╗╔═╗╔═╗╔═╗╔═╗
  //  ╚╗╔╝║╠╦╝ ║ ║ ║╠═╣║    ╠═╝╠═╣║ ╦║╣ ╚═╗
  //   ╚╝ ╩╩╚═ ╩ ╚═╝╩ ╩╩═╝  ╩  ╩ ╩╚═╝╚═╝╚═╝
  // Configure deep-linking (aka client-side routing)
  virtualPagesRegExp: /^\/welcome\/?([^\/]+)?\/?/,
  afterNavigate: async function(virtualPageSlug){
    // `virtualPageSlug` is determined by the regular expression above, which
    // corresponds with `:unused?` in the server-side route for this page.
    switch (virtualPageSlug) {
      case 'hello':
        this.modal = 'example';
        break;
      default:
        this.modal = '';
    }
  },

  //  ╦╔╗╔╔╦╗╔═╗╦═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║║║║ ║ ║╣ ╠╦╝╠═╣║   ║ ║║ ║║║║╚═╗
  //  ╩╝╚╝ ╩ ╚═╝╩╚═╩ ╩╚═╝ ╩ ╩╚═╝╝╚╝╚═╝
  methods: {

    getClass(electionresult) {
      if(electionresult.changeVote === electionresult.vote){
        return "normal";
      }
      if (electionresult.adminPhone && electionresult.adminPhone.length) {
        console.log({electionresult});
        return "updatedVote";
      }
      if (electionresult.changeVote > 0) {
        // console.log({electionresult});
        return "changeVote";
      }
      return "normal";
    },

    getIncidenceClass(incidence) {
      if(incidence.priorityLevel == 0){
        return "normal";
      }
      if(incidence.priorityLevel == 5){
        return "midLevelIncidence";
      }
      if(incidence.priorityLevel == 5){
        return "highLevelIncidence";
      }
      return "normal";
    },

    fillElectionResult: function(body){
      if(body && body.length){
        this.electionresults = body.map(function (currentValue, index, array) {
          return Object.assign({}, currentValue, {timeAgo: moment(currentValue.updatedAt).fromNow()});
        });
      }
    },

    probeElectionResult: function(){
      let endpoint = '/electionresult?limit=400&sort=createdAt desc';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + encodeURIComponent(selectedLocalGovernment);
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + encodeURIComponent(selectedWard);
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + encodeURIComponent(selectedPu);
          }
        }
      }
      io.socket.get(endpoint, this.fillElectionResult);
    },

    probeIncidence: function(){
      let endpoint = '/incidencereport?limit=400&sort=createdAt desc';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + encodeURIComponent(selectedLocalGovernment);
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + encodeURIComponent(selectedWard);
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + encodeURIComponent(selectedPu);
          }
        }
      }
      io.socket.get(endpoint, this.fillIncidenceResult);
    },

    getSMSErrors: async function(){
      if(!displayErrors) return;
      let endpoint = '/smserror?limit=400&sort=createdAt desc';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + encodeURIComponent(selectedLocalGovernment);
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + encodeURIComponent(selectedWard);
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + encodeURIComponent(selectedPu);
          }
        }
      }
      console.log(endpoint);
      io.socket.get(endpoint, this.fillSMSErrors);
    },



    fillSMSErrors: function(body){
      if(body && body.length){
        this.smserrors = body.map(function (currentValue, index, array) {
          return Object.assign({}, currentValue, {timeAgo: moment(currentValue.updatedAt).fromNow()});
        });
      }
    },

    getPusWithoutResult: async function(){
      if(!displayPUsWithoutResult) return;
      let endpoint = '/api/puswithoutresult';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + encodeURIComponent(selectedLocalGovernment);
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + encodeURIComponent(selectedWard);
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + encodeURIComponent(selectedPu);
          }
        }
      }
      console.log(endpoint);
      io.socket.get(endpoint, this.fillPusWithoutResult);
    },

    fillPusWithoutResult: function(body){
      if(body && body.data && body.data.length){
        this.puswithoutresult = body.data;
      }
    },


    fillIncidenceResult: function(body){
      if(body && body.length){
        this.incidencereports = body.map(function (currentValue, index, array) {
          return Object.assign({}, currentValue, {timeAgo: moment(currentValue.updatedAt).fromNow()});
        });
      }
    },

    fillIncidenceResult: function(body){
      if(body && body.length){
        this.incidencereports = body.map(function (currentValue, index, array) {
          return Object.assign({}, currentValue, {timeAgo: moment(currentValue.updatedAt).fromNow()});
        });
      }
    },

    fillResultSummary: function(body){
      if(body && body.length){
        this.resultSummary = body;
      }
    },

    getElectionResult: async function(){
      let endpoint = '/electionresult?limit=400&sort=createdAt desc';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + encodeURIComponent(selectedLocalGovernment);
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + encodeURIComponent(selectedWard);
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + encodeURIComponent(selectedPu);
          }
        }
      } 
      // console.log({getElectionResult: endpoint});
      io.socket.get(endpoint, this.fillElectionResult);
      setInterval(this.probeElectionResult, 1200000000);
    },

    getResultSummary: async function(){
      let endpoint = '/api/query1';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '?localGovernment=' + encodeURIComponent(selectedLocalGovernment);
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + encodeURIComponent(selectedWard);
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + encodeURIComponent(selectedPu);
          }
        }
      }
      // console.log({getResultSummary: endpoint});
      io.socket.get(endpoint, this.fillResultSummary);
    },

    getIncidenceResult: async function(){
      let endpoint = '/incidencereport?limit=400&sort=createdAt desc';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + encodeURIComponent(selectedLocalGovernment);
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + encodeURIComponent(selectedWard);
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + encodeURIComponent(selectedPu);
          }
        }
      }
      // console.log({getIncidenceResult: endpoint});
      io.socket.get(endpoint, this.fillIncidenceResult);
      setInterval(this.probeIncidence, 1200000000);
    },

  }
});
