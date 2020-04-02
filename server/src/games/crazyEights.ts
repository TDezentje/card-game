import { Card } from 'models/card.model';
import { GameLogic, GamePlayer, GameEffect, GameEffectType } from './game.logic';
import { Player } from 'models/player.model';
const uuid = require('uuid/v4');

export class CrazyEights extends GameLogic {
    public static gameName = "Crazy Eights";
    public static guid = "cb805f77-d4ec-4bac-b0f9-000a548a53f3";
    public static minPlayers = 2;
    public static maxPlayers = 4;
    private _currentPlayer: GamePlayer;
    private activeMultipleChoice: GameEffect;
    private activeTakeCard: GameEffect;
    private forcedSymbol: string;
    protected hasStack = true;

    private get currentPlayer() {
        return this._currentPlayer;
    }

    private set currentPlayer(value: GamePlayer) {
        this._currentPlayer = value;
        this.onNextPlayer(this, value.guid);
    }

    private _rotationClockwise: boolean;
    private get rotationClockwise() {
        return this._rotationClockwise;
    }

    private set rotationClockwise(value: boolean) {
        this._rotationClockwise = value;
        this.onEffect(this, new GameEffect(GameEffectType.RotationChanged, {
            rotationClockwise: value
        }));
    }

    protected startCardAmountInHand = 7;

    public buttonClicked(){

    }

    public startGame(players: Player[]) {
        super.startGame(players);

        this.currentPlayer = this.players[Math.floor(Math.random() * Math.floor(this.players.length))];
        this.rotationClockwise = true;
    }

    public takeCards(playerGuid: string) {
        if (this.activeMultipleChoice) {
            return;
        }

        if (playerGuid !== this.currentPlayer?.guid) {
            return;
        }

        const count = this.activeTakeCard?.effectData.count || 1;
        
        if (this.activeTakeCard) {
            this.activeTakeCard.effectData.playerGuid = this.currentPlayer.guid;
            this.onEffect(this, this.activeTakeCard);
            delete this.activeTakeCard;
        }

        if (this.cardsOnPile.length > 1 && this.cardsToUse.length < count) {
            this.resetPile();
        }

        const cards: Card[] = [];
        for (let i = 0; i < count; i++) {
            const randomIdx = Math.floor(Math.random() * Math.floor(this.cardsToUse.length));
            cards.push(...this.cardsToUse.splice(randomIdx, 1));
        }

        this.currentPlayer.cards.push(...cards);
        this.currentPlayer = this.getNextPlayer(1);
        this.onTakeCards(this, playerGuid, cards, this.cardsToUse.length !== 0);


        if (this.cardsOnPile.length > 1 && this.cardsToUse.length === 0) {
            this.resetPile();
        }
    }

    private resetPile() {
        this.cardsToUse = JSON.parse(JSON.stringify(this.cardsOnPile));
        this.cardsOnPile = [];
        this.onEffect(this, new GameEffect(GameEffectType.ResetPile, {emptyPile: false}));
    }

    public playCard(playerGuid: string, cardGuid: string) {
        if (playerGuid !== this.currentPlayer.guid) {
            return;
        }

        const card = CrazyEights.cards.find(c => c.guid === cardGuid);
        if (!this.isValidCard(card)) {
            return;
        }

        delete this.forcedSymbol;
        this.cardsOnPile.push(card);
        this.takeCardFromHand(cardGuid);

        const previousPlayer = this.currentPlayer;
        this.checkEffects(card);
        this.onPlayCard(this, playerGuid, card);

        if (previousPlayer.cards.length === 0) {
            this.onGameover(this, {
                text: `CONGRATULATIONS!\n${previousPlayer.name} won`,
                buttonText: 'Next game',
                altText: 'Wait for the gamemaster'
            });
        }

        if (this.cardsOnPile.length > 5 && this.cardsToUse.length === 0) {
            this.cardsToUse = JSON.parse(JSON.stringify(this.cardsOnPile));
            this.cardsOnPile = [];
            this.onEffect(this, new GameEffect(GameEffectType.ResetPile, {emptyPile: false}));
        }
    }

    private addTakeCardEffect(count) {
        if (!this.activeTakeCard) {
            this.activeTakeCard = new GameEffect(GameEffectType.TakeCard, {count: 0});
        }
        this.activeTakeCard.effectData.count += count;
    }

    private checkEffects(card: Card) {
        if (card.corner.leftTop === 'A') {
            this.rotationClockwise = !this.rotationClockwise;
        }

        if (card.corner.leftTop === '8') {
            const skippedPlayer = this.getNextPlayer(1);
            this.currentPlayer = this.getNextPlayer(2);
            this.onEffect(this, new GameEffect(GameEffectType.PlayerSkipped, {
                playerGuid: skippedPlayer.guid
            }));
            return;
        }

        if (card.corner.leftTop === '7') {
            this.currentPlayer = this.getNextPlayer(0);
            this.onEffect(this, new GameEffect(GameEffectType.KeepTurn, {
                playerGuid: this.currentPlayer.guid
            }));
            return;
        }

        if (card.corner.leftTop === '2') {
            this.addTakeCardEffect(2);
        }

        if (card.corner.leftTop === '✪') {
            this.addTakeCardEffect(5);
        }

        if (card.corner.leftTop === 'J' || card.corner.leftTop === '✪') {
            this.activeMultipleChoice = new GameEffect(GameEffectType.MultipleChoice, {
                options: [{
                    guid: uuid(),
                    text: '♣',
                    color: '#323232'
                },
                {
                    guid: uuid(),
                    text: '♥',
                    color: '#f91c2c'
                },
                {
                    guid: uuid(),
                    text: '♠',
                    color: '#323232'
                },
                {
                    guid: uuid(),
                    text: '♦',
                    color: '#f91c2c'
                }]
            }, this.currentPlayer.guid);

            this.onEffect(this, this.activeMultipleChoice);
            return;
        }

        this.currentPlayer = this.getNextPlayer(1);
    }

    public answerMultipleChoice(playerGuid: string, answerGuid: string) {
        if (!this.activeMultipleChoice && playerGuid !== this.activeMultipleChoice.playerGuid) {
            return;
        }

        const answer = this.activeMultipleChoice.effectData.options.find(o => o.guid === answerGuid);
        if(!answer) {
            return;
        }

        this.forcedSymbol = answer.text;
        this.onEffect(this, new GameEffect(GameEffectType.ForceColor, {
            text: answer.text,
            color: answer.color
        }));

        delete this.activeMultipleChoice;
        this.currentPlayer = this.getNextPlayer(1);
    }

    private getNextPlayer(stepCount: number) {
        let currentPlayerIdx = this.players.findIndex(p => p.guid === this.currentPlayer.guid);
        if (this.rotationClockwise) {
            currentPlayerIdx += stepCount;
            if (currentPlayerIdx >= this.players.length) {
                currentPlayerIdx = currentPlayerIdx % this.players.length;
            }
        } else {
            const idx = 0 - (currentPlayerIdx - stepCount);
            currentPlayerIdx -= stepCount;
            if (currentPlayerIdx < 0) {
                currentPlayerIdx = this.players.length - idx;
            }
        }
        return this.players[currentPlayerIdx];
    }

    protected isValidCard(card: Card) {
        if (this.activeMultipleChoice) {
            return false;
        }

        const lastCardIdx = this.cardsOnPile.length - 1;
        if (lastCardIdx === -1) {
            return true;
        }
        const lastPlayedCard = this.cardsOnPile[lastCardIdx];

        if ((lastPlayedCard.corner.leftTop === '2' || lastPlayedCard.corner.leftTop === '✪') && this.activeTakeCard) {
            return ['2', '✪'].includes(card.corner.leftTop);
        }

        // Same type of card or same display of card
        if ((this.forcedSymbol || lastPlayedCard.corner.leftBottom) === card.corner.leftBottom ||
            lastPlayedCard.corner.leftTop === card.corner.leftTop ||
            lastPlayedCard.display === card.display) {
            return true;
        }

        // Card is joker
        if (card.corner.leftTop === '✪') {
            return true;
        }

        return false;
    }

    public nextGame() {
        this.startGame(this.players);
    }

    public resetGame() {
        this.cardsToUse = JSON.parse(JSON.stringify(CrazyEights.cards));
        this.cardsOnPile = [];
    }

    private static cards: Card[] = [
        {
            guid: 'ed00453b-89dd-41dc-8096-525728e312a0',
            display: '2',
            color: '#f91c2c',
            corner: { leftTop: '2', leftBottom: '♥', rightTop: '♥', rightBottom: '2' }
        },
        {
            guid: 'f9771681-bd43-4e60-97d8-01ba4b38d83a',
            display: '3',
            color: '#f91c2c',
            corner: { leftTop: '3', leftBottom: '♥', rightTop: '♥', rightBottom: '3' }
        },
        {
            guid: '77f1a4bd-2198-4c67-af1e-6539e6eb01d0',
            display: '4',
            color: '#f91c2c',
            corner: { leftTop: '4', leftBottom: '♥', rightTop: '♥', rightBottom: '4' }
        },
        {
            guid: '898deda6-e1d8-48a7-8cea-a328a1ef4a1f',
            display: '5',
            color: '#f91c2c',
            corner: { leftTop: '5', leftBottom: '♥', rightTop: '♥', rightBottom: '5' }
        },
        {
            guid: '40c254ce-5243-48f5-8534-3929f9c12dc0',
            display: '6',
            color: '#f91c2c',
            corner: { leftTop: '6', leftBottom: '♥', rightTop: '♥', rightBottom: '6' }
        },
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
            guid: 'd3a166c8-4a08-40f7-aff5-47cb8a8382f7',
            display: '2',
            corner: { leftTop: '2', leftBottom: '♠', rightTop: '♠', rightBottom: '2' }
        },
        {
            guid: '1fe3640d-17fe-4779-9248-862c2b0a395a',
            display: '3',
            corner: { leftTop: '3', leftBottom: '♠', rightTop: '♠', rightBottom: '3' }
        },
        {
            guid: 'ea4d864c-df56-4f01-b18b-58f636588372',
            display: '4',
            corner: { leftTop: '4', leftBottom: '♠', rightTop: '♠', rightBottom: '4' }
        },
        {
            guid: 'e806407a-341e-4525-ba11-ff57567f73db',
            display: '5',
            corner: { leftTop: '5', leftBottom: '♠', rightTop: '♠', rightBottom: '5' }
        },
        {
            guid: '9e0a23f2-ce2b-4b9e-bd98-ae30ef4fd376',
            display: '6',
            corner: { leftTop: '6', leftBottom: '♠', rightTop: '♠', rightBottom: '6' }
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
            guid: '1f97dd68-ece5-4c07-ab60-adbed4e76fac',
            display: '2',
            color: '#f91c2c',
            corner: { leftTop: '2', leftBottom: '♦', rightTop: '♦', rightBottom: '2' }
        },
        {
            guid: 'da43445b-7017-45a2-9d7e-d78e8f1a7233',
            display: '3',
            color: '#f91c2c',
            corner: { leftTop: '3', leftBottom: '♦', rightTop: '♦', rightBottom: '3' }
        },
        {
            guid: '6405faf8-9926-481a-aac5-17f4c890e4cf',
            display: '4',
            color: '#f91c2c',
            corner: { leftTop: '4', leftBottom: '♦', rightTop: '♦', rightBottom: '4' }
        },
        {
            guid: 'd504c8d3-fc61-46ce-b781-e49869245c4f',
            display: '5',
            color: '#f91c2c',
            corner: { leftTop: '5', leftBottom: '♦', rightTop: '♦', rightBottom: '5' }
        },
        {
            guid: '297f0a57-c5d8-496f-a261-8c2c07543ee3',
            display: '6',
            color: '#f91c2c',
            corner: { leftTop: '6', leftBottom: '♦', rightTop: '♦', rightBottom: '6' }
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
            guid: '7142cfd3-6658-4dd0-89c2-ea6597d00736',
            display: '2',
            corner: { leftTop: '2', leftBottom: '♣', rightTop: '♣', rightBottom: '2' }
        },
        {
            guid: '1702762c-66c5-4697-acef-5b7b329124bd',
            display: '3',
            corner: { leftTop: '3', leftBottom: '♣', rightTop: '♣', rightBottom: '3' }
        },
        {
            guid: '206b561c-44ea-4a93-b178-2bf36730b589',
            display: '4',
            corner: { leftTop: '4', leftBottom: '♣', rightTop: '♣', rightBottom: '4' }
        },
        {
            guid: '5f302f6f-af8b-4669-90f1-e9478d8df073',
            display: '5',
            corner: { leftTop: '5', leftBottom: '♣', rightTop: '♣', rightBottom: '5' }
        },
        {
            guid: 'c4663938-c418-465a-828a-4ab448465ab1',
            display: '6',
            corner: { leftTop: '6', leftBottom: '♣', rightTop: '♣', rightBottom: '6' }
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
        },
        {
            guid: '9cfe88eb-0cc2-419a-8284-3178095252dc',
            display: '🤹',
            corner: { leftTop: '✪', leftBottom: '✪', rightTop: '✪', rightBottom: '✪' }
        },
        {
            guid: 'c21dea09-4ca1-4f1d-a1e9-5917d07aad49',
            display: '🤹',
            color: '#f91c2c',
            corner: { leftTop: '✪', leftBottom: '✪', rightTop: '✪', rightBottom: '✪' }
        }
    ]
}   