App = {
  load: async () => {
    await App.loadWeb3();
    await App.loadAccount();
    await App.loadContract();
    await App.render();
    await App.listenForEvents();
  },
  loading: false,
  hasVoted: false,
  contracts: {},
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      window.alert("Please connect to Metamask.");
    }

    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        await ethereum.enable();
      } catch (error) {
        console.error("User denied account access...");
      }
    } else if (window.web3) {
      App.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
    } else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  },
  loadAccount: async () => {
    App.account = web3.eth.accounts[0]
  },
  loadContract: async () => {
    const election = await $.getJSON('Election.json');
    App.contracts.Election = TruffleContract(election);
    App.contracts.Election.setProvider(App.web3Provider);
    App.election = await App.contracts.Election.deployed();
  },




  listenForEvents: function() {
    App.contracts.Election.deployed().then(function(instance) {
      instance.VoteConducted({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
      });
    });
  },




  render: async () => {
     if(App.loading){return}
    App.setLoading(true)
    $('#accounts').html(App.account)
    await App.renderCandidates()
    App.setLoading(false);
    const validVoter = await App.election.voters(App.account);
    console.log(App.hasVoted);
    console.log(validVoter);
    const loader = $('#loader');
    const content = $('#content');
    if (validVoter != App.hasVoted) {
      $('#votingForm').hide();
    }
    loader.hide();
    content.show();
  },
  renderCandidates: async () => {
    const candidateCount = await App.election.candidateApplied();
    const $candidateTemplate = $('.candidateTemplate');
    const candidatesSelect = $('#candidatesSelect');
    candidatesSelect.empty();

    for (let i = 1; i <= candidateCount; i++) {
      const candidate = await App.election.candidateDetails(i);
      const candidateId = candidate[0].toNumber();
      const candidateName = candidate[1];
      const candidateVotes = candidate[2].toNumber();

      const $newCandidateTemplate = $candidateTemplate.clone()
      $newCandidateTemplate.find('.id').html(candidateId),
      $newCandidateTemplate.find('.name').html(candidateName),
      $newCandidateTemplate.find('.votes').html(candidateVotes)

      var candidateOption = "<option value='" + candidateId + "' >" + candidateName + "</ option>"
      candidatesSelect.append(candidateOption);

      $('#candidateList').append($newCandidateTemplate.html());
    }
  },
  
  addCandidate: async () => {
    const name = $('#newCandidate').val();
    const intVote = 0;
    await App.election.addCandidate(name, intVote, { from: App.account });
    window.location.reload();
  },
  castVote: async () => {
    const candidateVoteId = $('#candidatesSelect').val();
    await App.election.vote(candidateVoteId, { from: App.account });
    window.location.reload();
    
  },
  setLoading: (boolean) => {
    App.loading = boolean;
    const loader = $('#loader');
    const content = $('#content');
    if (boolean) {
      loader.show();
      content.hide();
    } else {
      loader.hide();
      content.show();
    }
  }
};

$(() => {
  $(window).load(() => {
    App.load();
  });
});
