// Game State
let coins = 1000;
let currentBet = 0;
let gameInProgress = false;

// Blackjack State
let deck = [];
let playerHand = [];
let dealerHand = [];
let playerScore = 0;
let dealerScore = 0;

// Poker State
let pokerDeck = [];
let communityCards = [];
let playerPokerHand = [];
let bot1Hand = [];
let bot2Hand = [];
let pokerPot = 0;
let pokerBet = 0;
let pokerRound = 0;

// Card suits and values
const suits = ['♠️', '♥️', '♦️', '♣️'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateCoinDisplay();
    createDeck();
});

// Utility Functions
function updateCoinDisplay() {
    document.getElementById('coinAmount').textContent = coins;
}

function showGame(game) {
    // Hide all games
    document.querySelectorAll('.game-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected game
    document.getElementById(game + '-game').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function createDeck() {
    deck = [];
    pokerDeck = [];
    
    for (let suit of suits) {
        for (let value of values) {
            const card = { suit, value };
            deck.push({ ...card });
            pokerDeck.push({ ...card });
        }
    }
}

function shuffleDeck(deckToShuffle) {
    for (let i = deckToShuffle.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deckToShuffle[i], deckToShuffle[j]] = [deckToShuffle[j], deckToShuffle[i]];
    }
}

function drawCard(fromDeck) {
    return fromDeck.pop();
}

function getCardValue(card, isBlackjack = true) {
    if (isBlackjack) {
        if (card.value === 'A') return 11;
        if (['J', 'Q', 'K'].includes(card.value)) return 10;
        return parseInt(card.value);
    }
    return card.value;
}

function calculateScore(hand) {
    let score = 0;
    let aces = 0;
    
    for (let card of hand) {
        if (card.value === 'A') {
            aces++;
            score += 11;
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            score += 10;
        } else {
            score += parseInt(card.value);
        }
    }
    
    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }
    
    return score;
}

function createCardElement(card, hidden = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    
    if (hidden) {
        cardDiv.className += ' card-back';
        cardDiv.innerHTML = '🎰';
    } else {
        const isRed = card.suit === '♥️' || card.suit === '♦️';
        cardDiv.className += isRed ? ' red' : ' black';
        cardDiv.innerHTML = `
            <div>${card.value}</div>
            <div style="font-size: 1.5em;">${card.suit}</div>
            <div style="transform: rotate(180deg);">${card.value}</div>
        `;
    }
    
    return cardDiv;
}

// BLACKJACK FUNCTIONS
function setBet(amount) {
    if (gameInProgress) return;
    if (amount > coins) {
        showMessage('Nicht genügend Coins!');
        return;
    }
    
    currentBet = amount;
    document.getElementById('currentBet').textContent = currentBet;
    
    // Enable deal button
    document.getElementById('deal-btn').disabled = false;
}

function dealCards() {
    if (currentBet === 0) {
        showMessage('Bitte setze zuerst einen Einsatz!');
        return;
    }
    
    if (currentBet > coins) {
        showMessage('Nicht genügend Coins!');
        return;
    }
    
    // Deduct bet from coins
    coins -= currentBet;
    updateCoinDisplay();
    
    gameInProgress = true;
    
    // Reset game
    playerHand = [];
    dealerHand = [];
    
    // Clear cards
    document.getElementById('player-cards').innerHTML = '';
    document.getElementById('dealer-cards').innerHTML = '';
    
    // Shuffle deck
    createDeck();
    shuffleDeck(deck);
    
    // Deal initial cards
    playerHand.push(drawCard(deck));
    dealerHand.push(drawCard(deck));
    playerHand.push(drawCard(deck));
    dealerHand.push(drawCard(deck));
    
    updateDisplay();
    
    // Check for blackjack
    if (playerScore === 21) {
        setTimeout(() => {
            endGame('Blackjack! Du gewinnst!', currentBet * 2.5);
        }, 1000);
    } else {
        enableGameButtons();
    }
    
    // Disable deal button
    document.getElementById('deal-btn').disabled = true;
}

function hit() {
    playerHand.push(drawCard(deck));
    updateDisplay();
    
    if (playerScore > 21) {
        endGame('Bust! Du hast verloren!', 0);
    } else if (playerScore === 21) {
        stand();
    }
}

function stand() {
    // Reveal dealer's hidden card
    updateDisplay(true);
    
    // Dealer draws cards
    setTimeout(() => {
        dealerPlay();
    }, 1000);
}

function doubleDown() {
    if (currentBet > coins) {
        showMessage('Nicht genügend Coins zum Verdoppeln!');
        return;
    }
    
    coins -= currentBet;
    currentBet *= 2;
    updateCoinDisplay();
    document.getElementById('currentBet').textContent = currentBet;
    
    // Draw one card and stand
    hit();
    if (playerScore <= 21) {
        setTimeout(() => {
            stand();
        }, 1000);
    }
    
    // Disable double down
    document.getElementById('double-btn').disabled = true;
}

function dealerPlay() {
    const dealerCardsDiv = document.getElementById('dealer-cards');
    
    function drawDealerCard() {
        if (dealerScore < 17) {
            dealerHand.push(drawCard(deck));
            updateDisplay(true);
            setTimeout(drawDealerCard, 1000);
        } else {
            // Determine winner
            let message, winnings;
            
            if (dealerScore > 21) {
                message = 'Dealer Bust! Du gewinnst!';
                winnings = currentBet * 2;
            } else if (dealerScore > playerScore) {
                message = 'Dealer gewinnt!';
                winnings = 0;
            } else if (playerScore > dealerScore) {
                message = 'Du gewinnst!';
                winnings = currentBet * 2;
            } else {
                message = 'Unentschieden!';
                winnings = currentBet;
            }
            
            endGame(message, winnings);
        }
    }
    
    drawDealerCard();
}

function updateDisplay(showDealerCards = false) {
    // Update player cards
    const playerCardsDiv = document.getElementById('player-cards');
    playerCardsDiv.innerHTML = '';
    playerHand.forEach(card => {
        playerCardsDiv.appendChild(createCardElement(card));
    });
    
    // Update dealer cards
    const dealerCardsDiv = document.getElementById('dealer-cards');
    dealerCardsDiv.innerHTML = '';
    dealerHand.forEach((card, index) => {
        const hidden = index === 1 && !showDealerCards && gameInProgress;
        dealerCardsDiv.appendChild(createCardElement(card, hidden));
    });
    
    // Update scores
    playerScore = calculateScore(playerHand);
    dealerScore = showDealerCards ? calculateScore(dealerHand) : getCardValue(dealerHand[0]);
    
    document.getElementById('player-score').textContent = `Score: ${playerScore}`;
    document.getElementById('dealer-score').textContent = `Score: ${showDealerCards ? dealerScore : '?'}`;
}

function enableGameButtons() {
    document.getElementById('hit-btn').disabled = false;
    document.getElementById('stand-btn').disabled = false;
    document.getElementById('double-btn').disabled = playerHand.length > 2 || currentBet > coins;
}

function disableGameButtons() {
    document.getElementById('hit-btn').disabled = true;
    document.getElementById('stand-btn').disabled = true;
    document.getElementById('double-btn').disabled = true;
}

function endGame(message, winnings) {
    gameInProgress = false;
    coins += winnings;
    updateCoinDisplay();
    showMessage(message);
    disableGameButtons();
    
    // Reset bet
    currentBet = 0;
    document.getElementById('currentBet').textContent = currentBet;
    document.getElementById('deal-btn').disabled = false;
    
    // Add win effect
    if (winnings > 0) {
        document.querySelector('.coin-display').classList.add('win-glow');
        setTimeout(() => {
            document.querySelector('.coin-display').classList.remove('win-glow');
        }, 3000);
    }
}

function showMessage(message) {
    document.getElementById('game-message').textContent = message;
}

// POKER FUNCTIONS
function setPokerBet(amount) {
    if (amount > coins) {
        showPokerMessage('Nicht genügend Coins!');
        return;
    }
    
    pokerBet = amount;
    pokerPot = amount * 3; // Player + 2 bots
    document.getElementById('pokerPot').textContent = pokerPot;
}

function dealPoker() {
    if (pokerBet === 0) {
        showPokerMessage('Bitte setze zuerst einen Einsatz!');
        return;
    }
    
    if (pokerBet > coins) {
        showPokerMessage('Nicht genügend Coins!');
        return;
    }
    
    // Deduct bet
    coins -= pokerBet;
    updateCoinDisplay();
    
    // Reset game
    createDeck();
    shuffleDeck(pokerDeck);
    
    communityCards = [];
    playerPokerHand = [];
    bot1Hand = [];
    bot2Hand = [];
    pokerRound = 0;
    
    // Deal hole cards
    for (let i = 0; i < 2; i++) {
        playerPokerHand.push(drawCard(pokerDeck));
        bot1Hand.push(drawCard(pokerDeck));
        bot2Hand.push(drawCard(pokerDeck));
    }
    
    updatePokerDisplay();
    enablePokerButtons();
    showPokerMessage('Karten ausgeteilt! Du bist dran.');
}

function updatePokerDisplay() {
    // Community cards
    const communityDiv = document.getElementById('community-cards');
    communityDiv.innerHTML = '';
    communityCards.forEach(card => {
        communityDiv.appendChild(createCardElement(card));
    });
    
    // Player cards
    const playerDiv = document.getElementById('player-poker-cards');
    playerDiv.innerHTML = '';
    playerPokerHand.forEach(card => {
        playerDiv.appendChild(createCardElement(card));
    });
    
    // Bot cards (hidden)
    const bot1Div = document.getElementById('bot1-cards');
    bot1Div.innerHTML = '';
    for (let i = 0; i < bot1Hand.length; i++) {
        bot1Div.appendChild(createCardElement({}, true));
    }
    
    const bot2Div = document.getElementById('bot2-cards');
    bot2Div.innerHTML = '';
    for (let i = 0; i < bot2Hand.length; i++) {
        bot2Div.appendChild(createCardElement({}, true));
    }
    
    // Update hand info
    if (communityCards.length >= 3) {
        const playerBestHand = getBestHand([...playerPokerHand, ...communityCards]);
        document.getElementById('player-poker-hand').textContent = playerBestHand.name;
    }
}

function fold() {
    showPokerMessage('Du hast gefoldet. Bots spielen weiter...');
    disablePokerButtons();
    
    setTimeout(() => {
        // Bots play against each other
        const bot1BestHand = getBestHand([...bot1Hand, ...communityCards]);
        const bot2BestHand = getBestHand([...bot2Hand, ...communityCards]);
        
        let winner;
        if (bot1BestHand.rank > bot2BestHand.rank) {
            winner = 'Bot 1 gewinnt den Pot!';
        } else if (bot2BestHand.rank > bot1BestHand.rank) {
            winner = 'Bot 2 gewinnt den Pot!';
        } else {
            winner = 'Unentschieden zwischen den Bots!';
        }
        
        show
