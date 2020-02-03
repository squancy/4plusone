import React from 'react';
import ReactDOM from 'react-dom';
import './index.css'

// Create a single bubble instance
function Bubble(props) {
  return (
    <div className='bubble' key={props.num} id={'bubble_' + props.num}>
      <span className='numCont'>{props.num + 1}</span>
    </div>
  );
}

// Repeat bubble instances
function Repeat(props) {
  let result = [];
  for (let i = 0; i < props.n; i++) {
    result.push(<Bubble num={i} />);
  }
  return result;
}

// Color the proper number of bubbles red
function displayBubbles(num, self) {
  for (let i = 0; i < self.state.numOfBubblesStart - num; i++) {
    _('bubble_' + i).style.backgroundColor = 'red';
  } 
}

// When user wants to play again reset bubbles
function resetBubbles(self) {
  for (let i = 0; i < self.state.numOfBubblesStart; i++) {
    _('bubble_' + i).style.backgroundColor = 'white';
  }
}

// Component for displaying difficulty levels; hide it later
function DiffLevels(props) {
  return (
    <div className={props.obj.state.isShow ? 'showBtns' : 'hideBtns'}>
      <button className='diffBtn' onClick={() => props.obj.startGame(1)}>Dumb</button>
      <button className='diffBtn' onClick={() => props.obj.startGame(2)}>Medium</button>
      <button className='diffBtn' onClick={() => props.obj.startGame(3)}>Hardcore</button>
    </div>
  );
}

// Manage states; render UI
function manageStateAfterTurn(self, turn, bubbles) {
  self.setState({
    numOfBubbles: self.state.numOfBubbles - bubbles,
    nextPlayer: turn
  }, () => {
    displayBubbles(self.state.numOfBubbles, self);
  });
}

// Component for displaying bubble remove buttons; hide it when needed
function RemButtons(props) {
  return (
    <div className={!props.obj.state.isShow ? 'showBtns' : 'hideBtns'}>
      <button className='diffBtn' onClick={() => props.obj.removeBubbles(1)}>1</button> 
      <button className='diffBtn' onClick={() => props.obj.removeBubbles(2)}>2</button> 
      <button className='diffBtn' id='mayHide' 
        onClick={() => props.obj.removeBubbles(3)}>3</button> 
    </div>
  );
}

// Main component class that gets rendered
class Game extends React.Component {
  constructor(props) {
    super(props);
    
    // Start with a random number of bubbles between 20 and 35
    this.autorand = this.autorand.bind(this);
    let bub = this.autorand(20, 35, false);
    this.state = {
      isShow: true,
      nextPlayer: 'Your',
      welcMsg: true,
      diffLevel: 1,
      hideRem: false,
      winner: null,
      numOfBubbles: bub,
      numOfBubblesStart: bub
    };

    this.hideBtns = this.hideBtns.bind(this);
    this.startGame= this.startGame.bind(this);
    this.removeBubbles = this.removeBubbles.bind(this);
    this.dumbPlay = this.dumbPlay.bind(this);
    this.mediumPlay = this.mediumPlay.bind(this);
    this.hardcorePlay = this.hardcorePlay.bind(this);
    this.playAgain = this.playAgain.bind(this);
  }

  hideBtns() {
    this.setState({ isShow: false });
  }

  startGame(diff) {
    this.hideBtns();
    this.setState({
      welcMsg: false,
      diffLevel: diff
    }); 
  }

  // Check if user or computer has lost the match
  checkIfLost() {
    if (this.state.numOfBubbles === 1) {
      this.setState({
        winner: this.state.nextPlayer === 'Your' ? 'c' : 'u',
        hideRem: true
      });
      return true;
    }
    return false;
  }

  // Logic for playing another match; reset everything
  playAgain() {
    let bub = this.autorand(20, 35);
    this.setState({
      isShow: true,
      nextPlayer: 'Your',
      welcMsg: true,
      hideRem: false,
      diffLevel: 1,
      winner: null,
      numOfBubbles: bub,
      numOfBubblesStart: bub
    }, () => {
      resetBubbles(this);
    }); 
  }

  // Generate a random number between min and max
  autorand(min, max, init = true) {
    if (init && this.state.numOfBubbles === 2) max = 2;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Level 1: randomly choose to remove 1, 2 or 3 bubbles
  dumbPlay() {
    if (this.checkIfLost()) return; 
    let randBubble = this.autorand(1, 3);
    manageStateAfterTurn(this, 'Your', randBubble);
    if(this.checkIfLost()) return;
    if (this.state.numOfBubbles === 2) _('mayHide').style.display = 'none'; 
  }

  // Level 2: plays winning strategy in 60% and dumbPlay() in 40%
  mediumPlay() {
    if (this.checkIfLost()) return;
    let strategy = this.autorand(1, 10);
    if (strategy > 6) {
      this.dumbPlay();
    } else {
      this.hardcorePlay(); 
    }
    if(this.checkIfLost()) return;
    if (this.state.numOfBubbles === 2) _('mayHide').style.display = 'none'; 
  }

  /* 
    Level 3: plays winning strategy in 100%;
    Leave that number of bubbles for user when divided by 4 returns a remainder of 1
  */
  hardcorePlay() {
    if (this.checkIfLost()) return;
    let allBubbles = this.state.numOfBubbles;
    if (allBubbles % 4 === 0){
       manageStateAfterTurn(this, 'Your', 3);
    }else if(allBubbles % 4 === 1){
      // Computer is in a loosing position; generate a random num
      let bubbles = this.autorand(1, 3);
      manageStateAfterTurn(this, 'Your', bubbles);
    }else if(allBubbles % 4 === 2){
      manageStateAfterTurn(this, 'Your', 1);
    }else{
      manageStateAfterTurn(this, 'Your', 2);
    }
    if(this.checkIfLost()) return;
    if (this.state.numOfBubbles === 2) _('mayHide').style.display = 'none'; 
  }
 
  // Remove 1, 2 or 3 bubbles by user
  removeBubbles(num) {
    let staticBubbles = this.state.numOfBubbles;
    if (this.state.nextPlayer !== 'Your') return;
    manageStateAfterTurn(this, 'Computer\'s', num); 
    if (staticBubbles - num === 0) {
      this.setState({
        winner: 'c',    
        hideRem: true
      });
      return;
    } 
    if (this.state.diffLevel === 1) setTimeout(this.dumbPlay, 1000);
    else if (this.state.diffLevel === 2) setTimeout(this.mediumPlay, 1000);
    else setTimeout(this.hardcorePlay, 1000);
  }

  render() {
    let title;
    if (this.state.welcMsg) {
      title = <p>Wanna play? Choose a difficutly level.</p>;
    } else {
      title = <p>{this.state.nextPlayer} turn</p>;
    }
   
    if (this.state.winner) {
      if (this.state.diffLevel === 1 && this.state.winner === 'c') {
        title = <p>Jeez... there is no handicapped mode.</p>;
      } else if (this.state.diffLevel !== 3 && this.state.winner === 'u') {
        title = <p>Not bad. Now beat me in hardcore mode...</p>;
      } else if (this.state.winner === 'u') {
        title = <p>Nice play. You know the secret?</p>;
      } else {
        title = <p>Have you tried playing in dumb mode?</p>;
      }
    }

    return (
      <div className='container'>
        <div className='bubbleContainer'>
          <Repeat n={this.state.numOfBubblesStart} />
        </div>
        <hr className='sep' />
        <div className='playerInfo'> 
          {title}
          <DiffLevels obj={this} /> 
          {this.state.hideRem ? '' : <RemButtons obj={this} />} 
          {this.state.winner ? 
            <button className='diffBtn' id='pAgain'
              onClick={this.playAgain}>Play again</button> 
            : ''
          }
        </div>
      </div>
    );
  }
}

function _(el) {
  return document.getElementById(el);
}

ReactDOM.render(<Game />, _('root'))
