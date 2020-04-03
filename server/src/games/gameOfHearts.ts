import { Card } from 'models/card.model';
import { GameLogic, GameEffect, GameEffectType, GamePlayer } from './game.logic';
import { Player } from 'models/player.model';

export class GameOfHearts extends GameLogic {
    public static gameName = "Game of Hearts";
    public static guid = "17ba85b3-ac8a-42d3-8964-228823d213d2";
    public static minPlayers = 4;
    public static maxPlayers = 4;
    protected hasStack = false;

    protected startCardAmountInHand = 8;
    private _currentPlayer: GamePlayer;
    private get currentPlayer() {
        return this._currentPlayer;
    }

    private set currentPlayer(value: GamePlayer) {
        this._currentPlayer = value;
        this.onNextPlayer(this, value.guid);
    }

    private totalScore: {
        [key: string]: number;
    } = {};

    private score: {
        [key: string]: number;
    } = {};

    private playedCards: {
        [key: string]: Card;
    } = {};

    public startGame(players: Player[]) {
        super.startGame(players);

        const playerIdx = this.players.findIndex(p => p.cards.some(c => c.corner.leftTop === "7" && c.corner.leftBottom === "♣"));
        this.currentPlayer = this.players[playerIdx];
        this.onEffect(this, new GameEffect(GameEffectType.RotationChanged, {
            rotationClockwise: true
        }));
    }

    public takeCards() {
    }

    public playCard(playerGuid: string, cardGuid: string) {
        if (this.playedCards[playerGuid]) {
            return;
        }

        const player = this.players.find(p => p.guid === playerGuid);
        const card = player.cards.find(c => c.guid === cardGuid);

        if (player.cards.some(c => c.corner.leftTop === "7" && c.corner.leftBottom === "♣") && !(card.corner.leftTop === "7" && card.corner.leftBottom === "♣")) {
            return;
        }

        if (!this.isValidCard(player, card)) {
            return;
        }
        this.playedCards[playerGuid] = card;
        player.cards.splice(player.cards.findIndex(c => c.guid === cardGuid), 1);

        this.onPlayCard(this, playerGuid, card);
        let currentPlayerIdx = this.players.findIndex(p => p.guid === this.currentPlayer.guid);
        currentPlayerIdx++;
        if (currentPlayerIdx >= this.players.length) {
            currentPlayerIdx = currentPlayerIdx % this.players.length;
        }
        this.currentPlayer = this.players[currentPlayerIdx];

        if (this.players.length === Object.keys(this.playedCards).length) {
            this.calculateScore();
            this.resetPile();
        }
    }

    private calculateScore() {
        const firstCard = Object.values(this.playedCards)[0];
        let scorePlayerGuid;
        let higestIndex = 0;
        for (const playerGuid of Object.keys(this.playedCards)) {
            if (this.playedCards[playerGuid].corner.leftBottom !== firstCard.corner.leftBottom) {
                continue;
            }
            const idx = GameOfHearts.cards.findIndex(c => c.guid === this.playedCards[playerGuid].guid);

            if (idx > higestIndex) {
                scorePlayerGuid = playerGuid;
                higestIndex = idx;
            }
        }

        if (!this.score[scorePlayerGuid]) {
            this.score[scorePlayerGuid] = 0;
        }

        for (const card of Object.values(this.playedCards)) {
            if (card.corner.leftBottom === "♥") {
                this.score[scorePlayerGuid] += 1;
            }

            if (card.corner.leftBottom === "♠" && card.corner.leftTop === "Q") {
                this.score[scorePlayerGuid] += 5;
            }

            if (card.corner.leftBottom === "♣" && card.corner.leftTop === "J") {
                this.score[scorePlayerGuid] += 2;
            }
        }
        const player = this.players.find(p => p.guid === scorePlayerGuid);
        if (player.cards.length === 0) {
            let text = "";
            let playerWithAllPoints;
            for (const scorePlayerGuid of Object.keys(this.score)) {
                if (this.score[scorePlayerGuid] === 15) {
                    playerWithAllPoints = scorePlayerGuid;
                    break;
                }
            }
            let isWinner = {
                scorePlayerGuid: "",
                score: 0
            };
            for (const scorePlayerGuid of Object.keys(this.playedCards)) {
                const player = this.players.find(p => p.guid === scorePlayerGuid);
                if (!this.totalScore[scorePlayerGuid]) {
                    this.totalScore[scorePlayerGuid] = 0;
                }
                
                this.totalScore[scorePlayerGuid] += playerWithAllPoints ? playerWithAllPoints === scorePlayerGuid ? 0 : 15 : this.score[scorePlayerGuid];
                if (this.totalScore[scorePlayerGuid] >= 50 && isWinner?.score < this.totalScore[scorePlayerGuid]) {
                    isWinner = { scorePlayerGuid, score: this.score[scorePlayerGuid] };
                }
                text += `\n${player.name}: ${this.totalScore[scorePlayerGuid] || 0}`;
            }

            if (isWinner.scorePlayerGuid) {
                const player = this.players.find(p => p.guid === isWinner.scorePlayerGuid);
                this.onGameover(this, {
                    text: `Loser!\n${player.name} lost the game`,
                    buttonText: 'Next game',
                    altText: 'Wait for the gamemaster'
                });
            } else {
                this.onGameover(this, {
                    text: `Score\n${text}`,
                    buttonText: 'Next game',
                    altText: 'Wait for the gamemaster'
                });
            }

            return;
        }

        this.currentPlayer = player;
    }

    private resetPile() {
        this.playedCards = {};
        this.cardsOnPile = [];
        this.onEffect(this, new GameEffect(GameEffectType.ResetPile, { emptyPile: true }));
    }

    public buttonClicked() {
    }

    public isValidCard(player: GamePlayer, card: Card) {
        if (Object.keys(this.playedCards).length === 0) {
            return true;
        }

        const firstCard = Object.values(this.playedCards)[0];
        if (firstCard.corner.leftBottom === card.corner.leftBottom) {
            return true;
        }

        if (!player.cards.some(c => c.corner.leftBottom === firstCard.corner.leftBottom)) {
            return true;
        }

        return false;
    }

    public answerMultipleChoice() {
    }

    public nextGame() {
        this.startGame(this.players);
        this.score = {};
        if (Object.values(this.totalScore).some(v => v >= 50)) {
            this.totalScore = {};
        }
    }

    public resetGame() {
        this.cardsToUse = JSON.parse(JSON.stringify(GameOfHearts.cards));
        this.cardsOnPile = [];
    }

    private static cards: Card[] = [
        {
            guid: 'cea7ce9f-c74c-437b-bbaf-2a52fff27b15',
            display: '7',
            color: '#f91c2c',
            corner: { leftTop: '7', leftBottom: '♥', rightTop: '♥', rightBottom: '7' }
        },
        {
            guid: '779ef632-b66f-488a-b7d9-35626b50e5b7',
            display: '8',
            color: '#f91c2c',
            corner: { leftTop: '8', leftBottom: '♥', rightTop: '♥', rightBottom: '8' }
        },
        {
            guid: '691149bf-f4a0-4432-911f-bedb833c8a10',
            display: '9',
            color: '#f91c2c',
            corner: { leftTop: '9', leftBottom: '♥', rightTop: '♥', rightBottom: '9' }
        },
        {
            guid: '0d2c1175-b180-47ff-ad5e-a075fa481464',
            display: '10',
            color: '#f91c2c',
            corner: { leftTop: '10', leftBottom: '♥', rightTop: '♥', rightBottom: '10' }
        },
        {
            guid: '17ed7cc7-b815-486d-a792-890b98df46a8',
            display: 'J',
            color: '#f91c2c',
            corner: { leftTop: 'J', leftBottom: '♥', rightTop: '♥', rightBottom: 'J' }
        },
        {
            guid: '692a8dd5-306a-4d0b-a028-7fbd4cfb7d37',
            display: 'Q',
            color: '#f91c2c',
            corner: { leftTop: 'Q', leftBottom: '♥', rightTop: '♥', rightBottom: 'Q' }
        },
        {
            guid: 'bc1aaab4-f4a0-4b06-af2e-b78d65ff570c',
            display: 'K',
            color: '#f91c2c',
            corner: { leftTop: 'K', leftBottom: '♥', rightTop: '♥', rightBottom: 'K' }
        },
        {
            guid: 'dc1fbbb4-f4a0-4b06-af2e-b78d65ff570c',
            display: '♥',
            color: '#f91c2c',
            corner: { leftTop: 'A', leftBottom: '♥', rightTop: '♥', rightBottom: 'A' }
        },
        {
            guid: 'a291714b-98ac-4631-a11d-e21914bb25fd',
            display: '7',
            corner: { leftTop: '7', leftBottom: '♠', rightTop: '♠', rightBottom: '7' }
        },
        {
            guid: 'caad96b1-a4f0-4743-a2f4-57b73069abf4',
            display: '8',
            corner: { leftTop: '8', leftBottom: '♠', rightTop: '♠', rightBottom: '8' }
        },
        {
            guid: '96b2f12e-d33c-405c-891e-a35ed3528664',
            display: '9',
            corner: { leftTop: '9', leftBottom: '♠', rightTop: '♠', rightBottom: '9' }
        },
        {
            guid: 'bcd1389c-78e6-4b04-9b50-9fd601b81ee9',
            display: '10',
            corner: { leftTop: '10', leftBottom: '♠', rightTop: '♠', rightBottom: '10' }
        },
        {
            guid: '17ed7cc7-b815-486d-a792-890b984446a8',
            display: 'J',
            corner: { leftTop: 'J', leftBottom: '♠', rightTop: '♠', rightBottom: 'J' }
        },
        {
            guid: '692a8dd5-306a-4d0b-a028-7fbd43337d37',
            display: 'Q',
            corner: { leftTop: 'Q', leftBottom: '♠', rightTop: '♠', rightBottom: 'Q' }
        },
        {
            guid: 'bc1aaab4-f4a0-4b06-af2e-b78d2222570c',
            display: 'K',
            corner: { leftTop: 'K', leftBottom: '♠', rightTop: '♠', rightBottom: 'K' }
        },
        {
            guid: 'dc1fbbb4-f4a0-4b06-af2e-b78d1111570c',
            display: '♠',
            corner: { leftTop: 'A', leftBottom: '♠', rightTop: '♠', rightBottom: 'A' }
        },
        {
            guid: 'f6c04b76-7a4e-4642-9ed0-e2935a7228a3',
            display: '7',
            color: '#f91c2c',
            corner: { leftTop: '7', leftBottom: '♦', rightTop: '♦', rightBottom: '7' }
        },
        {
            guid: '851127ac-eb3f-45ea-8bad-5c1b3faad3c6',
            display: '8',
            color: '#f91c2c',
            corner: { leftTop: '8', leftBottom: '♦', rightTop: '♦', rightBottom: '8' }
        },
        {
            guid: 'e3f8631f-9224-424e-87f2-00a6f088e167',
            display: '9',
            color: '#f91c2c',
            corner: { leftTop: '9', leftBottom: '♦', rightTop: '♦', rightBottom: '9' }
        },
        {
            guid: '9a2f68fe-abe2-415e-9fca-ec905614aaf2',
            display: '10',
            color: '#f91c2c',
            corner: { leftTop: '10', leftBottom: '♦', rightTop: '♦', rightBottom: '10' }
        },
        {
            guid: '17ed7cc7-b815-422d-a792-890b984446a8',
            display: 'J',
            color: '#f91c2c',
            corner: { leftTop: 'J', leftBottom: '♦', rightTop: '♦', rightBottom: 'J' }
        },
        {
            guid: '692a8dd5-306a-433b-a028-7fbd43337d37',
            display: 'Q',
            color: '#f91c2c',
            corner: { leftTop: 'Q', leftBottom: '♦', rightTop: '♦', rightBottom: 'Q' }
        },
        {
            guid: 'bc1aaab4-f4a0-4444-af2e-b78d2222570c',
            display: 'K',
            color: '#f91c2c',
            corner: { leftTop: 'K', leftBottom: '♦', rightTop: '♦', rightBottom: 'K' }
        },
        {
            guid: 'dc1fbbb4-f4a0-4777-af2e-b78d1111570c',
            display: '♦',
            color: '#f91c2c',
            corner: { leftTop: 'A', leftBottom: '♦', rightTop: '♦', rightBottom: 'A' }
        },
        {
            guid: '5188f2f1-d07f-47f3-a9b7-bf57b8402fa6',
            display: '7',
            corner: { leftTop: '7', leftBottom: '♣', rightTop: '♣', rightBottom: '7' }
        },
        {
            guid: '07ed78b7-b815-486d-a792-890b98df46a8',
            display: '8',
            corner: { leftTop: '8', leftBottom: '♣', rightTop: '♣', rightBottom: '8' }
        },
        {
            guid: '792a8e75-306a-4d0b-a028-7fbd4cfb7d37',
            display: '9',
            corner: { leftTop: '9', leftBottom: '♣', rightTop: '♣', rightBottom: '9' }
        },
        {
            guid: 'ac1fcbb4-f4a0-4b06-af2e-b78d65ff570c',
            display: '10',
            corner: { leftTop: '10', leftBottom: '♣', rightTop: '♣', rightBottom: '10' }
        },
        {
            guid: '17ed78b7-b815-486d-a792-890b98df46a8',
            display: 'J',
            corner: { leftTop: 'J', leftBottom: '♣', rightTop: '♣', rightBottom: 'J' }
        },
        {
            guid: '692a8e75-306a-4d0b-a028-7fbd4cfb7d37',
            display: 'Q',
            corner: { leftTop: 'Q', leftBottom: '♣', rightTop: '♣', rightBottom: 'Q' }
        },
        {
            guid: 'bc1fcbb4-f4a0-4b06-af2e-b78d65ff570c',
            display: 'K',
            corner: { leftTop: 'K', leftBottom: '♣', rightTop: '♣', rightBottom: 'K' }
        },
        {
            guid: 'dc1fcbb4-f4a0-4b06-af2e-b78d65ff570c',
            display: '♣',
            corner: { leftTop: 'A', leftBottom: '♣', rightTop: '♣', rightBottom: 'A' }
        }
    ]
}   