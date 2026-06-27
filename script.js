const STORAGE_KEY = 'votingSystemData';
const PASSWORD = '6344';

function getDefaultData() {
  return {
    votes: {
      BJP: 0,
      CONGRESS: 0,
      AAP: 0
    },
    totalVotes: 0,
    stopped: false
  };
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return getDefaultData();
  try {
    return JSON.parse(raw);
  } catch {
    return getDefaultData();
  }
}

function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getPartyFromLetter(letter) {
  const map = { A: 'BJP', B: 'CONGRESS', C: 'AAP' };
  return map[letter] || null;
}

function getFinalVotes(data) {
  if (data.totalVotes <= 50) {
    return { ...data.votes };
  }

  return {
    BJP: data.votes.BJP + data.votes.CONGRESS * 0.5 + data.votes.AAP * 0.5,
    CONGRESS: data.votes.CONGRESS * 0.5,
    AAP: data.votes.AAP * 0.5
  };
}

function getWinner(votesObj) {
  let winner = null;
  let maxVotes = -1;
  for (const party in votesObj) {
    if (votesObj[party] > maxVotes) {
      maxVotes = votesObj[party];
      winner = party;
    }
  }
  return { winner, votes: maxVotes };
}

function setOutput(text) {
  document.getElementById('output').innerText = text;
}

function updateHeader() {
  const data = loadData();
  document.getElementById('totalVotes').innerText = data.totalVotes;
  document.getElementById('statusText').innerText = data.stopped ? 'Stopped' : 'Active';
}

function castVote(letter) {
  const data = loadData();
  if (data.stopped) {
    setOutput('Voting has been stopped.');
    updateHeader();
    return;
  }

  const party = getPartyFromLetter(letter);
  if (!party) {
    setOutput('Invalid vote.');
    return;
  }

  data.votes[party] += 1;
  data.totalVotes += 1;
  saveData(data);
  updateHeader();
  setOutput(`Vote cast for ${party}`);
}

function showTotal() {
  const data = loadData();
  updateHeader();
  setOutput(
    `Total Votes: ${data.totalVotes}\n\n` +
    `BJP: ${data.votes.BJP}\n` +
    `CONGRESS: ${data.votes.CONGRESS}\n` +
    `AAP: ${data.votes.AAP}`
  );
}

function showResults() {
  const data = loadData();
  const finalVotes = getFinalVotes(data);
  const winnerInfo = getWinner(data.totalVotes > 50 ? finalVotes : data.votes);
  updateHeader();

  let text = `Total Votes: ${data.totalVotes}\n\n`;
  text += `Original Votes:\n`;
  text += `BJP: ${data.votes.BJP}\n`;
  text += `CONGRESS: ${data.votes.CONGRESS}\n`;
  text += `AAP: ${data.votes.AAP}\n\n`;

  if (data.totalVotes > 50) {
    text += `Rule Applied: 50% of CONGRESS and AAP votes count toward BJP\n\n`;
  } else {
    text += `Rule not applied yet. It activates after more than 50 total votes.\n\n`;
  }

  text += `Final Votes:\n`;
  text += `BJP: ${finalVotes.BJP}\n`;
  text += `CONGRESS: ${finalVotes.CONGRESS}\n`;
  text += `AAP: ${finalVotes.AAP}\n\n`;
  text += `Winner: ${winnerInfo.winner} with ${winnerInfo.votes} votes`;

  setOutput(text);
}

function stopVoting() {
  const password = document.getElementById('password').value;
  if (password !== PASSWORD) {
    setOutput('Incorrect password');
    return;
  }

  const data = loadData();
  data.stopped = true;
  saveData(data);
  updateHeader();

  const finalVotes = getFinalVotes(data);
  const winnerInfo = getWinner(data.totalVotes > 50 ? finalVotes : data.votes);
  setOutput(
    `Voting stopped successfully\n\n` +
    `Total Votes: ${data.totalVotes}\n` +
    `Winner: ${winnerInfo.winner} with ${winnerInfo.votes} votes`
  );
}

function resetVoting() {
  const password = document.getElementById('password').value;
  if (password !== PASSWORD) {
    setOutput('Incorrect password');
    return;
  }

  saveData(getDefaultData());
  updateHeader();
  setOutput('Voting system reset');
}

updateHeader();
