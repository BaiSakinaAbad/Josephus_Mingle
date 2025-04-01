// Backend logic (from previous code)

class CircleLinkedList {
    constructor() {
        this.players = [];
        this.size = 0;
        this.iteratorIndex = 0;
    }

    addPlayer(playerId) {
        this.players.push(playerId);
        this.size++;
        this.iteratorIndex = 0;
    }

    removeKthPlayer(k) {
        if (this.players.length === 0 || this.size === 0) return -1;

        for (let i = 0; i < k; i++) {
            if (this.iteratorIndex >= this.players.length) {
                this.iteratorIndex = 0;
            }
            this.iteratorIndex++;
        }

        this.iteratorIndex--;
        const eliminatedPlayer = this.players[this.iteratorIndex];
        this.players.splice(this.iteratorIndex, 1);
        this.size--;

        if (this.iteratorIndex >= this.players.length) {
            this.iteratorIndex = 0;
        }

        return eliminatedPlayer;
    }

    getSize() {
        return this.size;
    }

    printList() {
        if (this.players.length === 0) return;
        return this.players.join(' ');
    }
}

class JosephusGame {
    constructor() {
        this.players = new CircleLinkedList();
        this.skipNumber = 0;
        this.speed = 0;
        this.isReady = false;
        this.numberOfPlayers = 0;
        this.eliminationOrder = [];
    }

    static getSkipNumberRange(numberOfPlayers) {
        const minSkip = 2;
        const maxSkip = numberOfPlayers;
        return [minSkip, maxSkip];
    }

    startGame() {
        return "Transition to Page 2: Are you ready?";
    }

    handleReadyResponse(response) {
        if (response.toUpperCase() === "YES") {
            this.isReady = true;
            return "Transition to Page 3: Enter game settings";
        } else if (response.toUpperCase() === "NO") {
            return "Button 'NO' changes to 'YES'";
        }
        return "Invalid response";
    }

    setupGame(numberOfPlayers, skipNumber, speed) {
        if (numberOfPlayers < 3 || numberOfPlayers > 40) {
            return "Error: Number of players must be between 3 and 40.";
        }
        
        const [minSkip, maxSkip] = JosephusGame.getSkipNumberRange(numberOfPlayers);
        if (skipNumber < minSkip || skipNumber > maxSkip) {
            return `Error: Skip number must be between ${minSkip} and ${maxSkip}.`;
        }

        if (speed < 0) {
            return "Error: Speed must be non-negative.";
        }

        if (![500, 1000, 1500, 2000].includes(speed)) {
            return "Error: Speed must be 500 (0.5s), 1000 (1s), 1500 (1.5s), or 2000 (2s).";
        }

        this.numberOfPlayers = numberOfPlayers;
        this.skipNumber = skipNumber;
        this.speed = speed;
        this.eliminationOrder = [];

        for (let i = 1; i <= numberOfPlayers; i++) {
            this.players.addPlayer(i);
        }

        return "Game setup successful. Ready to play!";
    }

    async playGame(updateCallback) {
        if (!this.isReady || this.players.getSize() === 0) {
            return -1;
        }

        while (this.players.getSize() > 1) {
            const eliminatedPlayer = this.players.removeKthPlayer(this.skipNumber);
            this.eliminationOrder.push(eliminatedPlayer);

            // Update UI via callback
            if (updateCallback) {
                updateCallback(this.players.players, eliminatedPlayer);
            }

            await new Promise(resolve => setTimeout(resolve, this.speed));
        }

        const winner = this.players.removeKthPlayer(1);
        if (updateCallback) {
            updateCallback(this.players.players, winner);
        }

        return winner;
    }

    resetGame() {
        this.players = new CircleLinkedList();
        this.skipNumber = 0;
        this.speed = 0;
        this.isReady = false;
        this.numberOfPlayers = 0;
        this.eliminationOrder = [];
    }
}

// Frontend logic with jQuery
$(document).ready(function() {
    const game = new JosephusGame();
    const playersList = new CircleLinkedList();
    let noClicked = false;
    let circlesContainer = $('.circles-container');
    const radius = 150;
    let angle = 0;
    let labels = [];
    let playersElem = [];
    let eliminatedPlayers = [];
    


    function displayPlayers() {
        circlesContainer.empty();
        $('.elimination-container').empty();
        labels=[];
        playersElem = [];
        eliminatedPlayers = [];

        for (let i = 0; i < localStorage.getItem('numberOfPlayers'); i++) {
            const smallCircle = document.createElement("div");
            const labelSquare = document.createElement("div");
            smallCircle.classList.add("small-circle");
            labelSquare.classList.add("small-square");
            circlesContainer.append(smallCircle);
            circlesContainer.append(labelSquare);
            playersList.addPlayer(i);
            playersElem.push(smallCircle);
            labels.push(labelSquare);
        }
    
        playersElem.forEach((circle, index) => {
            let theta = angle + (index * (2 * Math.PI)) / localStorage.getItem('numberOfPlayers');
            let x = Math.cos(theta) * radius + 90; // Adjust for center
            let y = Math.sin(theta) * radius + 90; // Adjust for center
            circle.style.transform = `translate(${x}px, ${y}px)`;
            circle.classList.add('bg-green-outline');
        });

        labels.forEach((label, index) => {
            let theta = angle + (index * (2 * Math.PI)) / localStorage.getItem('numberOfPlayers');
            let x = Math.cos(theta) * (radius+25) + 90; // Adjust for center
            let y = Math.sin(theta) * (radius+25) + 90; // Adjust for center
            label.style.transform = `translate(${x}px, ${y}px)`;
            label.style.color = '#000';
            label.append(index+1);
            label.classList.add('bg-white');
        });
    
        angle += 0.02;
        //requestAnimationFrame(animate);
      }
    
      displayPlayers();

      function changePlayerColor(playerIndex,colorClass){
        playersElem.forEach((circle, index) => {
           if(index == playerIndex){
            circle.classList.add(colorClass);
           }
        });
      }

      $('.simulation-start-button').on('click', async function(){
        if (playersList.getSize() <=1){
            displayPlayers();
        }
        while (playersList.getSize() > 1) {
            const eliminatedPlayer = playersList.removeKthPlayer(localStorage.getItem('skipNumber'));
            eliminatedPlayers.push(eliminatedPlayer);
            //eliminationOrder.push(eliminatedPlayer);
            changePlayerColor(eliminatedPlayer,'bg-red');
            
            $('.elimination-container').append(`<h5 class="eliminated-text">Player ${eliminatedPlayer+1} Eliminated</h5>`);
            await new Promise(resolve => setTimeout(resolve, localStorage.getItem('speed')));
        }

        playersList.players.forEach((player,index) => {
            changePlayerColor(player,'bg-green');
            $('.elimination-container').append(`<h5 class="winner-text">Winner: Player ${player + 1}!</h5>`);
        })


      });

    // Page 1: Play Game Button
    $('#play-game-btn').click(function() {
        game.startGame();
        $('.page').removeClass('active');
        $('#page2').addClass('active');
    });

    // Page 2: Are You Ready?
    $('#yes-btn').click(function() {
        const response = game.handleReadyResponse("YES");
        if (response.includes("Page 3")) {
            $('.page').removeClass('active');
            $('#page3').addClass('active');
        }
    });

    $('#no-btn').click(function() {
        const response = game.handleReadyResponse("NO");
        if (response.includes("changes to 'YES'")) {
            noClicked = true;
            $('#no-btn').text("YES").off('click').click(function() {
                const yesResponse = game.handleReadyResponse("YES");
                if (yesResponse.includes("Page 3")) {
                    $('.page').removeClass('active');
                    $('#page3').addClass('active');
                }
            });
        }
    });


    // Page 4: Simulation
    $('#start-simulation-btn').click(async function() {
        $(this).prop('disabled', true);
        const winner = await game.playGame((remainingPlayers, eliminatedPlayer) => {
            // Update circle display
            $('#circle-display').text(remainingPlayers.join(' '));
            // Update elimination order
            if (eliminatedPlayer) {
                $('#elimination-list').append(`<li>Player ${eliminatedPlayer}</li>`);
            }
        });

        // Transition to result page
        $('.page').removeClass('active');
        $('#page5').addClass('active');
        $('#safe-spot').text(winner);

        // Automatically transition to Page 6 after a short delay
        setTimeout(() => {
            $('.page').removeClass('active');
            $('#page6').addClass('active');
        }, 2000); // 2-second delay to let the user read the result
    });

    $('#exit-btn').click(function() {
        // Reset game and go back to Page 1
        game.resetGame();
        $('.page').removeClass('active');
        $('#page1').addClass('active');
        $('#elimination-list').empty();
        $('#start-simulation-btn').prop('disabled', false);
    });

    // Page 6: Play Again?
    $('#play-again-yes-btn').click(function() {
        // Reset game and go back to Page 1
        game.resetGame();
        $('.page').removeClass('active');
        $('#page1').addClass('active');
        $('#elimination-list').empty();
        $('#start-simulation-btn').prop('disabled', false);
        $('#num-players').val('');
        $('#skip-number').val('');
        $('#speed').val('');
        if (noClicked) {
            $('#no-btn').text("NO");
            noClicked = false;
        }
    });

    $('#play-again-no-btn').click(function() {
        // Close the application (for a web app, you might redirect or show a goodbye message)
        window.close(); // Note: This may not work in all browsers due to security restrictions
        // Alternatively, you can redirect to another page or show a message
        alert("Thanks for playing! Goodbye!");
    });
});

