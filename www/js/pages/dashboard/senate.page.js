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
    await this.getPusWithoutResult();
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

    getClass(electionresult) {
      if(electionresult.changeVote === electionresult.vote){
        return "normal";
      }
      if (electionresult.adminPhone && electionresult.adminPhone.length) {
        return "updatedVote";
      }
      if (electionresult.changeVote > 0) {
        return "changeVote";
      }
      return "normal";
    },

    getPusWithoutResult: async function(){
      if(!displayPUsWithoutResult) return;
      let endpoint = '/api/puswithoutresult?collection=senate&limit=6000';
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
        let endpoint = '/electionsenateresult?limit=6000';
        if(selectedSenatorialZone !== 'default'){
          endpoint += '&senatorialZone=' + encodeURIComponent(selectedSenatorialZone);
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
              io.socket.get(endpoint, this.fillElectionResult);
          }
    },

    probeIncidence: function(){
      let endpoint = '/incidencereport?limit=6000';
      if(selectedSenatorialZone !== 'default'){
          endpoint += '&senatorialZone=' + encodeURIComponent(selectedSenatorialZone);
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
            io.socket.get(endpoint, this.fillIncidenceResult);
        }
    },


    fillIncidenceResult: function(body){
    console.log({fillIncidenceResult: body});
      if(body && body.length){
        this.incidencereports = body.map(function (currentValue, index, array) {
          return Object.assign({}, currentValue, {timeAgo: moment(currentValue.updatedAt).fromNow()});
        });
      }
    },

    fillResultSummary: function(body){
      console.log({fillResultSummary: body});
      if(body && body.length){
        this.resultSummary = body;
      }
    },

    getElectionResult: async function(){
      let endpoint = '/electionsenateresult?limit=6000';
      if(selectedSenatorialZone !== 'default'){
        endpoint += '&senatorialZone=' + encodeURIComponent(selectedSenatorialZone);
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
            io.socket.get(endpoint, this.fillElectionResult);
            setInterval(this.probeElectionResult, 1200000000);       
        }
    },

    getResultSummary: async function(){
      let endpoint = '/api/query2';
      if(selectedSenatorialZone !== 'default'){
        endpoint += '?senatorialZone=' + encodeURIComponent(selectedSenatorialZone);
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
            io.socket.get(endpoint, this.fillResultSummary);
        }
    },

    getIncidenceResult: async function(){
      let endpoint = '/incidencereport?limit=6000';
      if(selectedSenatorialZone !== 'default'){ 
          endpoint += '&senatorialZone=' + encodeURIComponent(selectedSenatorialZone);
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
            io.socket.get(endpoint, this.fillIncidenceResult);
            setInterval(this.probeIncidence, 1200000000);
        }
    },

  }
});
