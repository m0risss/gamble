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
        
                showPokerMessage(winner);
        resetPokerGame();
    }, 2000);
}

function call() {
    showPokerMessage('Du gehst mit. Nächste Runde...');
    nextPokerRound();
}

function raise() {
    if (pokerBet > coins) {
        showPokerMessage('Nicht genügend Coins zum Erhöhen!');
        return;
    }
    
    coins -= pokerBet;
    pokerPot += pokerBet;
    updateCoinDisplay();
    document.getElementById('pokerPot').textContent = pokerPot;
    
    showPokerMessage('Du erhöhst den Einsatz! Nächste Runde...');
    nextPokerRound();
}

function nextPokerRound() {
    pokerRound++;
    
    // Bot actions
    setTimeout(() => {
        const bot1Action = Math.random() > 0.3 ? 'call' : 'fold';
        const bot2Action = Math.random() > 0.3 ? 'call' : 'fold';
        
        document.getElementById('bot1-action').textContent = `Bot 1: ${bot1Action}`;
        document.getElementById('bot2-action').textContent = `Bot 2: ${bot2Action}`;
        
        // Deal community cards based on round
        if (pokerRound === 1) {
            // Flop - 3 cards
            for (let i = 0; i < 3; i++) {
                communityCards.push(drawCard(pokerDeck));
            }
            showPokerMessage('Flop! 3 Community Cards aufgedeckt.');
        } else if (pokerRound === 2) {
            // Turn - 1 card
            communityCards.push(drawCard(pokerDeck));
            showPokerMessage('Turn! 4. Community Card aufgedeckt.');
        } else if (pokerRound === 3) {
            // River - 1 card
            communityCards.push(drawCard(pokerDeck));
            showPokerMessage('River! Alle Community Cards aufgedeckt.');
        } else {
            // Showdown
            showdown();
            return;
        }
        
        updatePokerDisplay();
        
        if (pokerRound >= 3) {
            setTimeout(() => {
                showdown();
            }, 2000);
        }
    }, 1500);
}

function showdown() {
    disablePokerButtons();
    
    // Reveal all hands
    const bot1Div = document.getElementById('bot1-cards');
    bot1Div.innerHTML = '';
    bot1Hand.forEach(card => {
        bot1Div.appendChild(createCardElement(card));
    });
    
    const bot2Div = document.getElementById('bot2-cards');
    bot2Div.innerHTML = '';
    bot2Hand.forEach(card => {
        bot2Div.appendChild(createCardElement(card));
    });
    
    // Calculate best hands
    const playerBestHand = getBestHand([...playerPokerHand, ...communityCards]);
    const bot1BestHand = getBestHand([...bot1Hand, ...communityCards]);
    const bot2BestHand = getBestHand([...bot2Hand, ...communityCards]);
    
    // Update hand displays
    document.getElementById('player-poker-hand').textContent = `${playerBestHand.name} (${playerBestHand.rank})`;
    document.getElementById('bot1-action').textContent = `${bot1BestHand.name} (${bot1BestHand.rank})`;
    document.getElementById('bot2-action').textContent = `${bot2BestHand.name} (${bot2BestHand.rank})`;
    
    // Determine winner
    const hands = [
        { player: 'Du', hand: playerBestHand, isPlayer: true },
        { player: 'Bot 1', hand: bot1BestHand, isPlayer: false },
        { player: 'Bot 2', hand: bot2BestHand, isPlayer: false }
    ];
    
    hands.sort((a, b) => b.hand.rank - a.hand.rank);
    
    const winner = hands[0];
    let message;
    let winnings = 0;
    
    if (winner.isPlayer) {
        message = `🎉 Du gewinnst mit ${winner.hand.name}!`;
        winnings = pokerPot;
        coins += winnings;
        updateCoinDisplay();
        
        // Add win effect
        document.querySelector('.coin-display').classList.add('win-glow');
        setTimeout(() => {
            document.querySelector('.coin-display').classList.remove('win-glow');
        }, 3000);
    } else {
        message = `${winner.player} gewinnt mit ${winner.hand.name}!`;
    }
    
    showPokerMessage(message);
    
    setTimeout(() => {
        resetPokerGame();
    }, 4000);
}

function getBestHand(cards) {
    // Simple poker hand evaluation
    const values = cards.map(card => {
        if (card.value === 'A') return 14;
        if (card.value === 'K') return 13;
        if (card.value === 'Q') return 12;
        if (card.value === 'J') return 11;
        return parseInt(card.value);
    }).sort((a, b) => b - a);
    
    const suits = cards.map(card => card.suit);
    const valueCounts = {};
    
    values.forEach(value => {
        valueCounts[value] = (valueCounts[value] || 0) + 1;
    });
    
    const counts = Object.values(valueCounts).sort((a, b) => b - a);
    const isFlush = suits.every(suit => suit === suits[0]) && suits.length >= 5;
    const isStraight = checkStraight(values);
    
    // Hand rankings (higher number = better hand)
    if (isFlush && isStraight) {
        return { name: 'Straight Flush', rank: 8 };
    } else if (counts[0] === 4) {
        return { name: 'Vier Gleiche', rank: 7 };
    } else if (counts[0] === 3 && counts[1] === 2) {
        return { name: 'Full House', rank: 6 };
    } else if (isFlush) {
        return { name: 'Flush', rank: 5 };
    } else if (isStraight) {
        return { name: 'Straße', rank: 4 };
    } else if (counts[0] === 3) {
        return { name: 'Drilling', rank: 3 };
    } else if (counts[0] === 2 && counts[1] === 2) {
        return { name: 'Zwei Paare', rank: 2 };
    } else if (counts[0] === 2) {
        return { name: 'Ein Paar', rank: 1 };
    } else {
        return { name: 'High Card', rank: 0 };
    }
}

function checkStraight(values) {
    const uniqueValues = [...new Set(values)].sort((a, b) => b - a);
    if (uniqueValues.length < 5) return false;
    
    for (let i = 0; i <= uniqueValues.length - 5; i++) {
        let consecutive = true;
        for (let j = 0; j < 4; j++) {
            if (uniqueValues[i + j] - uniqueValues[i + j + 1] !== 1) {
                consecutive = false;
                break;
            }
        }
        if (consecutive) return true;
    }
    
    // Check for A-2-3-4-5 straight
    if (uniqueValues.includes(14) && uniqueValues.includes(5) && 
        uniqueValues.includes(4) && uniqueValues.includes(3) && uniqueValues.includes(2)) {
        return true;
    }
    
    return false;
}

function enablePokerButtons() {
    document.getElementById('fold-btn').disabled = false;
    document.getElementById('call-btn').disabled = false;
    document.getElementById('raise-btn').disabled = false;
    document.getElementById('poker-deal-btn').disabled = true;
}

function disablePokerButtons() {
    document.getElementById('fold-btn').disabled = true;
    document.getElementById('call-btn').disabled = true;
    document.getElementById('raise-btn').disabled = true;
    document.getElementById('poker-deal-btn').disabled = false;
}

function resetPokerGame() {
    pokerBet = 0;
    pokerPot = 0;
    pokerRound = 0;
    document.getElementById('pokerPot').textContent = pokerPot;
    
    // Clear displays
    document.getElementById('community-cards').innerHTML = '';
    document.getElementById('player-poker-cards').innerHTML = '';
    document.getElementById('bot1-cards').innerHTML = '';
    document.getElementById('bot2-cards').innerHTML = '';
    document.getElementById('player-poker-hand').textContent = '';
    document.getElementById('bot1-action').textContent = '';
    document.getElementById('bot2-action').textContent = '';
    
    disablePokerButtons();
    showPokerMessage('Neues Spiel bereit!');
}

function showPokerMessage(message) {
    document.getElementById('poker-message').textContent = message;
}

// Additional Casino Features
function addBonusCoins() {
    const bonus = Math.floor(Math.random() * 100) + 50;
    coins += bonus;
    updateCoinDisplay();
    showMessage(`🎁 Bonus! Du erhältst ${bonus} Coins!`);
}

// Daily bonus (simple implementation)
function checkDailyBonus() {
    const lastBonus = localStorage.getItem('lastBonus');
    const today = new Date().toDateString();
    
    if (lastBonus !== today) {
        const dailyBonus = 200;
        coins += dailyBonus;
        updateCoinDisplay();
        localStorage.setItem('lastBonus', today);
        showMessage(`🌟 Täglicher Bonus: ${dailyBonus} Coins erhalten!`);
    }
}

// Save/Load game state
function saveGameState() {
    localStorage.setItem('casinoCoins', coins.toString());
}

function loadGameState() {
    const savedCoins = localStorage.getItem('casinoCoins');
    if (savedCoins) {
        coins = parseInt(savedCoins);
        updateCoinDisplay();
    }
}

// Auto-save every 30 seconds
setInterval(saveGameState, 30000);

// Load game state on page load
window.addEventListener('load', () => {
    loadGameState();
    checkDailyBonus();
});

// Add some casino sound effects (optional)
function playCardSound() {
    // You can add actual sound files here
    console.log('Card dealt sound');
}

function playWinSound() {
    // You can add actual sound files here
    console.log('Win sound');
}

function playLoseSound() {
    // You can add actual sound files here
    console.log('Lose sound');
}

// Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (document.getElementById('blackjack-game').classList.contains('active')) {
        switch(event.key) {
            case 'h':
            case 'H':
                if (!document.getElementById('hit-btn').disabled) {
                    hit();
                }
                break;
            case 's':
            case 'S':
                if (!document.getElementById('stand-btn').disabled) {
                    stand();
                }
                break;
            case 'd':
            case 'D':
                if (!document.getElementById('double-btn').disabled) {
                    doubleDown();
                }
                break;
            case ' ':
                event.preventDefault();
                if (!document.getElementById('deal-btn').disabled) {
                    dealCards();
                }
                break;
        }
    }
});

// Mobile touch improvements
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
    
    // Add touch feedback
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// Prevent context menu on long press for mobile
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'BUTTON' || e.target.classList.contains('card')) {
        e.preventDefault();
    }
});

// Add some Easter eggs
let konamiCode = [];
const konamiSequence = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'KeyB', 'KeyA'
];

document.addEventListener('keydown', (event) => {
    konamiCode.push(event.code);
    
    if (konamiCode.length > konamiSequence.length) {
        konamiCode.shift();
    }
    
    if (konamiCode.length === konamiSequence.length &&
        konamiCode.every((code, index) => code === konamiSequence[index])) {
        
        // Easter egg: Give bonus coins
        coins += 1000;
        updateCoinDisplay();
        showMessage('🎮 Konami Code aktiviert! 1000 Bonus Coins!');
        konamiCode = [];
    }
});

// Initialize tooltips for better UX
function addTooltips() {
    const tooltips = {
        'hit-btn': 'Ziehe eine weitere Karte (H)',
        'stand-btn': 'Beende deinen Zug (S)',
        'double-btn': 'Verdopple deinen Einsatz und ziehe eine Karte (D)',
        'deal-btn': 'Starte ein neues Spiel (Leertaste)',
        'fold-btn': 'Gib deine Karten auf',
        'call-btn': 'Gehe mit dem aktuellen Einsatz mit',
        'raise-btn': 'Erhöhe den Einsatz'
    };
    
    Object.entries(tooltips).forEach(([id, text]) => {
        const element = document.getElementById(id);
        if (element) {
            element.title = text;
        }
    });
}

// Call tooltip function after DOM is loaded
document.addEventListener('DOMContentLoaded', addTooltips);

// Add coin animation when winning
function animateCoins(amount) {
    const coinDisplay = document.querySelector('.coin-display');
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const coin = document.createElement('div');
            coin.textContent = '💰';
            coin.style.position = 'absolute';
            coin.style.fontSize = '2em';
            coin.style.left = Math.random() * window.innerWidth + 'px';
            coin.style.top = '0px';
            coin.style.pointerEvents = 'none';
            coin.style.zIndex = '1000';
            
            document.body.appendChild(coin);
            
            // Animate coin falling
            let pos = 0;
            const fallInterval = setInterval(() => {
                pos += 5;
                coin.style.top = pos + 'px';
                coin.style.opacity = 1 - (pos / window.innerHeight);
                
                if (pos > window.innerHeight) {
                    clearInterval(fallInterval);
                    document.body.removeChild(coin);
                }
            }, 16);
        }, i * 200);
    }
}

// Enhanced win function
function celebrateWin(amount) {
    animateCoins(amount);
    
    // Flash effect
    document.body.style.background = 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)';
    setTimeout(() => {
        document.body.style.background = '';
    }, 500);
}

console.log('🎰 Royal Casino loaded successfully! 🎰');
console.log('Keyboard shortcuts:');
console.log('H - Hit, S - Stand, D - Double Down, Space - Deal');
console.log('Try the Konami Code for a surprise! ⬆️⬆️⬇️⬇️⬅️➡️⬅️➡️BA');

