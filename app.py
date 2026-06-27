from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

class VotingSystem:
    def __init__(self):
        self.votes = {
            'BJP': 0,
            'CONGRESS': 0,
            'AAP': 0
        }
        self.total_votes = 0
        self.party_map = {'A': 'BJP', 'B': 'CONGRESS', 'C': 'AAP'}
        self.voting_stopped = False

    def cast_vote(self, party):
        if self.voting_stopped:
            return False, 'Voting has been stopped.'
        if party not in self.votes:
            return False, 'Invalid party.'
        self.votes[party] += 1
        self.total_votes += 1
        return True, f'Vote cast for {party}'

    def get_party_from_letter(self, letter):
        return self.party_map.get(letter.upper())

    def get_final_votes(self):
        if self.total_votes <= 50:
            return self.votes.copy()

        final_votes = self.votes.copy()
        congress_contribution = self.votes['CONGRESS'] * 0.5
        aap_contribution = self.votes['AAP'] * 0.5

        final_votes['BJP'] = self.votes['BJP'] + congress_contribution + aap_contribution
        final_votes['CONGRESS'] = self.votes['CONGRESS'] * 0.5
        final_votes['AAP'] = self.votes['AAP'] * 0.5
        return final_votes

    def get_winner(self):
        target = self.get_final_votes() if self.total_votes > 50 else self.votes
        winner = max(target, key=target.get)
        return winner, target[winner]

    def stop(self):
        self.voting_stopped = True

    def reset(self):
        self.votes = {'BJP': 0, 'CONGRESS': 0, 'AAP': 0}
        self.total_votes = 0
        self.voting_stopped = False

voting = VotingSystem()
PASSWORD = '6344'

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/vote', methods=['POST'])
def vote():
    data = request.get_json(silent=True) or {}
    party_code = data.get('party', '')
    party = voting.get_party_from_letter(party_code)
    if not party:
        return jsonify({'success': False, 'message': 'Invalid vote'}), 400
    success, message = voting.cast_vote(party)
    status = 200 if success else 403
    return jsonify({'success': success, 'message': message, 'total_votes': voting.total_votes, 'votes': voting.votes}), status

@app.route('/total')
def total():
    return jsonify({'total_votes': voting.total_votes, 'votes': voting.votes, 'stopped': voting.voting_stopped})

@app.route('/results')
def results():
    final_votes = voting.get_final_votes()
    winner, winner_votes = voting.get_winner()
    return jsonify({
        'total_votes': voting.total_votes,
        'original_votes': voting.votes,
        'final_votes': final_votes,
        'winner': winner,
        'winner_votes': winner_votes,
        'rule_applied': voting.total_votes > 50,
        'stopped': voting.voting_stopped
    })

@app.route('/stop', methods=['POST'])
def stop():
    data = request.get_json(silent=True) or {}
    if data.get('password') != PASSWORD:
        return jsonify({'success': False, 'message': 'Incorrect password'}), 403
    voting.stop()
    final_votes = voting.get_final_votes()
    winner, winner_votes = voting.get_winner()
    return jsonify({
        'success': True,
        'message': 'Voting stopped successfully',
        'total_votes': voting.total_votes,
        'final_votes': final_votes,
        'winner': winner,
        'winner_votes': winner_votes,
        'rule_applied': voting.total_votes > 50
    })

@app.route('/reset', methods=['POST'])
def reset():
    data = request.get_json(silent=True) or {}
    if data.get('password') != PASSWORD:
        return jsonify({'success': False, 'message': 'Incorrect password'}), 403
    voting.reset()
    return jsonify({'success': True, 'message': 'Voting system reset'})

if __name__ == '__main__':
    app.run(debug=True)
