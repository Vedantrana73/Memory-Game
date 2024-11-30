

class MemoryGame {
    constructor() {


        this.themes = {
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐯', '🐨', '🐵'],
            food: ['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍋', '🍉', '🥭', '🍊', '🍐'],
        };


        //Intialize elements
        this.boardElement = document.getElementById('game-board');
        this.movesElement = document.querySelector('.moves');
        this.timerElement = document.querySelector('.timer');
        this.scoreElement = document.querySelector('.score');
        this.resultElement = document.querySelector('.result');
        this.resetButton = document.getElementById('reset-btn');
        this.hintButton = document.getElementById('hint-btn');
        this.difficultySelect = document.getElementById('difficulty-select');
        this.themeSelect = document.getElementById('theme-select');
        this.themeToggle = document.getElementById('theme-toggle');
        this.hintButton.textContent = `Hint (${this.hintRemaining} left)`

        // Check if required elements exist


        //Game start variable
        this.cards = [];
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.time = 0;
        this.timer = null;
        this.score = 0;
        this.hintRemaining = 3;

        this.resetButton.addEventListener('click', () => this.resetGame());
        this.hintButton.addEventListener('click', () => this.useHint());
        this.themeSelect.addEventListener('change', () => this.resetGame());
        this.difficultySelect.addEventListener('change', () => this.resetGame());
        this.themeToggle.addEventListener('click', () => this.toggleDarkMode());


        // Set default values if not already set


        //intialize game
        this.initGame();
        this.startTimer();
    }

    getGameConfig() {
        const difficulty = this.difficultySelect.value;
        const theme = this.themeSelect.value;
        const emojiSet = this.themes[theme];

        const gridSizes = {
            'easy': { rows: 4, cols: 4, pairsCount: 8 },
            'medium': { rows: 6, cols: 6, pairsCount: 12 },
        };

        const config = gridSizes[difficulty];
        config.emojis = emojiSet.slice(0, config.pairsCount);
        return config;
    }

    //intialize game board
    initGame() {
        const config = this.getGameConfig();

        //reset game state
        this.selectedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.score = 0;
        this.hintRemaining = 3;

        //update UI
        this.movesElement.textContent = `Moves: ${this.moves}`;
        this.scoreElement.textContent = `Score: ${this.score}`;
        this.hintButton.textContent = `Hint: (${this.hintRemaining} left)`;
        this.resultElement.textContent = '';

        //creating shuffled cards
        const shuffledEmojis = [...config.emojis, ...config.emojis].sort(() => Math.random() - 0.5);

        //set grid layout
        this.boardElement.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
        this.boardElement.innerHTML = '';

        //create cards
        this.cards = shuffledEmojis.map((emoji, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.emoji = emoji;
            card.dataset.index = index;
            card.addEventListener('click', () => this.handleCardClick(card));
            this.boardElement.appendChild(card);
            return card;
        });
    }

    //handle cardclick
    handleCardClick(card) {
        if (card.classList.contains('matched') || card.classList.contains('flipped') || this.selectedCards.length === 2)
            return;

        //reveal card
        card.textContent = card.dataset.emoji;
        card.classList.add('flipped');
        this.selectedCards.push(card);

        //update moves and score
        this.moves++;
        this.movesElement.textContent = `Moves: ${this.moves}`;
        this.updateScore();

        //check for match
        if (this.selectedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 1000);
        }
    }
    checkMatch() {
        const [card1, card2] = this.selectedCards;

        if (card1.dataset.emoji === card2.dataset.emoji) {
            //match found
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.matchedPairs++;

            //update score
            this.score += 50;
            this.scoreElement.textContent = `Score: ${this.score}`;

            if (this.matchedPairs === this.getGameConfig().pairsCount) {
                this.stopTimer();
                this.resultElement.textContent = `Congratulations! You won in ${this.moves} moves and ${this.formatTime(this.time)}!`
            }
        }
        else {
            //no match - hide cards
            card1.textContent = ''
            card2.textContent = ''
            card1.classList.remove('flipped')
            card2.classList.remove('flipped')
        }

        //reset selected cards
        this.selectedCards = [];
    }
    updateScore() {
        if (this.moves > this.getGameConfig().pairsCount * 2) {
            this.score = Math.max(0, this.score - 10);
            this.scoreElement.textContent = `Score: ${this.score};`
        }
    }

    //timers
    startTimer() {
        this.timer = setInterval(() => {
            this.time++;
            this.timerElement.textContent = `Time: ${this.formatTime(this.time)}`
        }, 1000)
    }

    stopTimer() {
        clearInterval(this.timer);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    //hint
    useHint() {
        if (this.hintRemaining <= 0) return;

        //find first unmatched pair
        const unmatchedCards = this.cards.filter(card => !card.classList.contains('matched') && !card.classList.contains('flipped'));

        if (unmatchedCards.length < 2) return;

        //temp show 2 cards
        const firstCard = unmatchedCards.find(card => unmatchedCards.some(c => c !== card && c.dataset.emoji === card.dataset.emoji));

        const secondCard = unmatchedCards.find(c => c !== firstCard && c.dataset.emoji === firstCard.dataset.emoji)

        if (firstCard && secondCard) {
            firstCard.textContent = firstCard.dataset.emoji
            secondCard.textContent = secondCard.dataset.emoji
            firstCard.classList.add('flipped')
            secondCard.classList.add('flipped')

            //hide after 2 sec
            setTimeout(() => {
                firstCard.textContent = '';
                secondCard.textContent = '';
                firstCard.classList.remove('flipped')
                secondCard.classList.remove('flipped')
            }, 2000);

            this.hintRemaining--;
            this.hintButton.textContent = `Hint: (${this.hintRemaining} left)`
        }
    };

    //dark mode toggle
    toggleDarkMode() {
        document.body.classList.toggle('dark-mode')
        this.themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀ Light Mode'
            : '🌓 Dark Mode';
    }



    //reset game
    resetGame() {
        this.stopTimer();
        this.time = 0;
        this.timerElement.textContent = 'Time 00:00';
        this.initGame();
        this.startTimer()
    }

}
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame()
})