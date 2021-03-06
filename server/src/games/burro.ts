import { Card } from 'models/card.model';
import { GameLogic, GameEffect, GameEffectType, GamePlayer, GameScore } from './game.logic';
import { Player } from 'models/player.model';

export class Burro extends GameLogic {
    public static gameName = "Burro";
    public static guid = "f9508adf-cd29-4697-afea-4acc7a8ae96e";
    public static minPlayers = 3;
    public static maxPlayers = 8;
    protected hasStack = false;

    protected startCardAmountInHand = 4;

    private score: {
        [key: string]: string[];
    } = {};
    private invalidHandClicked: boolean;
    private whoClicked = [];

    public startGame(players: Player[]) {
        super.startGame(players);

        this.onEffect(this, new GameEffect(GameEffectType.RotationChanged, {
            rotationClockwise: true
        }));

        this.onEffect(this, new GameEffect(GameEffectType.Button, {
            buttonText: "Burro",
            waitForClick: true
        }));
    }

    public takeCards() {
    }

    public playCard(playerGuid: string, cardGuid: string) {
        if (this.whoClicked.includes(playerGuid)) {
            return;
        }

        let playerIndex = this.players.findIndex(p => p.guid === playerGuid);
        const player = this.players[playerIndex];

        playerIndex++;
        if (playerIndex >= this.players.length) {
            playerIndex = playerIndex % this.players.length;
        }

        const receivingPlayer = this.players[playerIndex];

        if (receivingPlayer.cards.length === 5) {
            return;
        }

        const card = player.cards.splice(player.cards.findIndex(c => c.guid === cardGuid), 1)?.[0];
        receivingPlayer.cards.push(card);

        this.onMoveCard(this, player.guid, receivingPlayer.guid, card);
    }

    public buttonClicked(playerGuid: string) {
        if (this.invalidHandClicked) {
            return;
        }

        if (this.whoClicked.length > 0 && !this.whoClicked.includes(playerGuid)) {
            this.whoClicked.push(playerGuid);

            if (this.whoClicked.length === this.players.length) {
                this.playerLost(this.players.find(p => p.guid === this.whoClicked[this.whoClicked.length - 1]));
            }

            return;
        } else if (this.whoClicked.length > 0) {
            return;
        }


        const playerIndex = this.players.findIndex(p => p.guid === playerGuid);
        const player = this.players[playerIndex];

        if (!this.isValidHand(player)) {
            this.invalidHandClicked = true;
            this.playerLost(player);
            return;
        }

        this.whoClicked.push(player.guid);
        this.onEffect(this, new GameEffect(GameEffectType.Button, {
            buttonText: player.name,
            playerGuid: player.guid,
            waitForClick: true
        }));
    }

    private playerLost(player: Player) {
        let playerScore = this.score[player.guid];
        if (!playerScore) {
            playerScore = this.score[player.guid] = [];
        }

        playerScore.push(Burro.gameName.substr(playerScore.length, 1));

        this.onGameover(this, {
            text: `${player.name}\n${playerScore.join(' ')}${new Array(Burro.gameName.length - playerScore.length + 1).join(' _')}`,
            buttonText: 'Next game',
            altText: 'Wait for the gamemaster'
        });
    }

    public isValidHand(player: GamePlayer) {
        const uniqueCardsInHand = player.cards.map(x => x.corner.leftTop).filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
        for (const uniqueCard of uniqueCardsInHand) {
            const count = player.cards.reduce((acc, card) => card.corner.leftTop === uniqueCard ? ++acc : acc, 0);
            if (count === 4) {
                return true;
            }
        }

        return false;
    }

    public answerMultipleChoice() {
    }

    public nextGame() {
        this.startGame(this.players);
        const scoreBoard = this.players.map(player => 
            new GameScore(
                player.name, 
                `${this.score[player.guid]?.join(' ') || ''}${new Array(Burro.gameName.length - (this.score[player.guid]?.length || 0) + 1).join(' _')}`
            )
        );
        this.onUpdateScore(this, scoreBoard);
    }

    public resetGame() {
        if (Object.values(this.score).some(value => value.length === Burro.gameName.length)) {
            this.score = {};
        }

        this.invalidHandClicked = false;
        this.whoClicked = [];
        this.cardsToUse = JSON.parse(JSON.stringify(Burro.cards));
        this.cardsToUse.sort((a, b) => {
            if (a.display > b.display) return 1;
            if (b.display > a.display) return -1;

            return 0;
        }).splice(0, Burro.cards.length - (this.players.length * this.startCardAmountInHand));
        this.cardsOnPile = [];
        const scoreBoard = this.players.map(player => 
            new GameScore(
                player.name, 
                `${new Array(Burro.gameName.length - (this.score[player.guid]?.length || 0) + 1).join(' _')}`
            )
        );
        this.onUpdateScore(this, scoreBoard);
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
        }
    ]
}   