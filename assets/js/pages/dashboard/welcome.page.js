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
    let self = this;
    io.socket.on('message', function (data){
      if(data.type === 'electionresult'){
        self.getElectionResult();
        self.getResultSummary();
      }else if(data.type === 'incidencereport'){
        self.getResultSummary();
      }
      self.getSMSErrors();
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

    fillElectionResult: function(body){
      if(body && body.length){
        this.electionresults = body.map(function (currentValue, index, array) {
          return Object.assign({}, currentValue, {timeAgo: moment(currentValue.updatedAt).fromNow()});
        });
      }
    },

    probeElectionResult: function(){
      let endpoint = '/electionresult?limit=6000';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
      }
      io.socket.get(endpoint, this.fillElectionResult);
    },

    probeIncidence: function(){
      let endpoint = '/incidencereport?limit=6000';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
      }
      io.socket.get(endpoint, this.fillIncidenceResult);
    },

    getSMSErrors: async function(){
      if(!displayErrors) return;
      let endpoint = '/smserror?limit=6000';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
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
      let endpoint = '/electionresult?limit=6000';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
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
        endpoint += '?localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
      }
      // console.log({getResultSummary: endpoint});
      io.socket.get(endpoint, this.fillResultSummary);
    },

    getIncidenceResult: async function(){
      let endpoint = '/incidencereport?limit=6000';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '&localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
      }
      // console.log({getIncidenceResult: endpoint});
      io.socket.get(endpoint, this.fillIncidenceResult);
      setInterval(this.probeIncidence, 1200000000);
    },

  }
});
