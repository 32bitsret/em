parasails.registerPage('senate', {

  template: '#election-result-senate-table-template',

  //  ╦╔╗╔╦╔╦╗╦╔═╗╦    ╔═╗╔╦╗╔═╗╔╦╗╔═╗
  //  ║║║║║ ║ ║╠═╣║    ╚═╗ ║ ╠═╣ ║ ║╣
  //  ╩╝╚╝╩ ╩ ╩╩ ╩╩═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝
  data: {
    modal: '',
    pageLoadedAt: Date.now(),
    electionresults: [], 
    incidencereports: [],
    resultSummary: [],
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
    let self = this;
    io.socket.on('message', function (data){
      if(data.type === 'electionsenateresult'){
        self.getElectionResult();
        self.getResultSummary();
      }else if(data.type === 'incidencereport'){
        self.getResultSummary();
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

    fillElectionResult: function(body){
      if(body && body.length){
        this.electionresults = body.map(function (currentValue, index, array) {
          return Object.assign({}, currentValue, {timeAgo: moment(currentValue.updatedAt).fromNow()});
        });
      }
    },

    probeElectionResult: function(){
      let endpoint = '/electionsenateresult';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '?localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
        io.socket.get(endpoint, this.fillElectionResult);
      }
    },

    probeIncidence: function(){
      let endpoint = '/incidencereport';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '?localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
        io.socket.get(endpoint, this.fillIncidenceResult);
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
      let endpoint = '/electionsenateresult';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '?localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
        io.socket.get(endpoint, this.fillElectionResult);
        setInterval(this.probeElectionResult, 1200000000);
      }       
    },

    getResultSummary: async function(){
      let endpoint = '/api/query2';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '?localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
        io.socket.get(endpoint, this.fillResultSummary);
      }
    },

    getIncidenceResult: async function(){
      let endpoint = '/incidencereport';
      if(selectedLocalGovernment !== 'default'){
        endpoint += '?localGovernment=' + selectedLocalGovernment;
        if(selectedWard !== 'default'){
          endpoint += '&ward=' + selectedWard;
          if(selectedPu !== 'default'){
            endpoint += '&pollingUnit=' + selectedPu;
          }
        }
        io.socket.get(endpoint, this.fillIncidenceResult);
        setInterval(this.probeIncidence, 1200000000);
      }
    },

  }
});
