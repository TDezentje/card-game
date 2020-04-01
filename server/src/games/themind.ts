import { Card } from 'models/card.model';
import { GameLogic } from './game.logic';

export class TheMind extends GameLogic {
    public static gameName = "The mind";
    public static guid = "57325385-1037-49df-9230-8806929531a2";
    public minPlayers = 2;
    private level = 1;
    private isGameOver = false;
    protected startCardAmountInHand = 1;
    protected hasStack = false;

    public playCard(playerGuid: string, cardGuid: string) {
        if (this.isGameOver) {
            return;
        }

        this.takeCardFromHand(cardGuid);
        const card = TheMind.cards.find(c => c.guid === cardGuid);

        this.onPlayCard(this, playerGuid, card);

        if (!this.isValidCard(cardGuid)) {
            this.isGameOver = true;
            this.onGameover(this, {
                text: 'GAME OVER!',
                buttonText: 'Retry',
                altText: 'Wait for the gamemaster'
            });
            return;
        }

        this.cardsOnPile.push(card);

        if (this.players.every(p => p.cards.length === 0)) {
            this.onGameover(this, {
                text: 'CONGRATULATIONS!',
                buttonText: 'Next level',
                altText: 'Wait for the gamemaster'
            });
        }
    }

    public buttonClicked(){

    }

    public takeCards() {

    }

    public answerMultipleChoice() {

    }

    public isValidCard(cardGuid: string) {
        const cardsInCurrentGame = TheMind.cards.filter(c => !this.cardsToUse.some(ctu => ctu.guid == c.guid));
        const nextCard = cardsInCurrentGame.find(c => !this.cardsOnPile.some(ctu => ctu.guid === c.guid));
        return nextCard.guid == cardGuid;
    }

    public nextGame() {
        this.resetGame();

        if (this.isGameOver) {
            this.isGameOver = false;
        } else {
            this.level += 1;
            this.startCardAmountInHand += 1;
        }

        this.startGame(this.players);
    }

    public resetGame() {
        if (this.isGameOver) {
            this.level = 1;
            this.startCardAmountInHand = 1;
        }
        this.cardsToUse = JSON.parse(JSON.stringify(TheMind.cards));
        this.cardsOnPile = [];
    }

    private static cards: Card[] = [
        {
            "guid": "6ebc1ede-beb5-4be9-ad01-769862f29c80",
            "display": "1",
            "corner": {
                "leftTop": "1",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "1"
            }
        },
        {
            "guid": "762146a2-5abc-4f4b-9d8a-06020a9419da",
            "display": "2",
            "corner": {
                "leftTop": "2",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "2"
            }
        },
        {
            "guid": "dca93f15-de2c-4280-8f94-af5de154f8d1",
            "display": "3",
            "corner": {
                "leftTop": "3",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "3"
            }
        },
        {
            "guid": "6e791037-6039-4bbe-a79d-a9c57e0dc0e9",
            "display": "4",
            "corner": {
                "leftTop": "4",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "4"
            }
        },
        {
            "guid": "5d701595-327a-41b8-8d80-86df5366efb9",
            "display": "5",
            "corner": {
                "leftTop": "5",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "5"
            }
        },
        {
            "guid": "736c3490-0d7a-4ee2-a455-d8c59e1c52ec",
            "display": "6",
            "corner": {
                "leftTop": "6",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "6"
            }
        },
        {
            "guid": "e7510504-d43a-4c3e-b745-11a9af243281",
            "display": "7",
            "corner": {
                "leftTop": "7",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "7"
            }
        },
        {
            "guid": "44265f28-544c-4708-a165-8791245300e6",
            "display": "8",
            "corner": {
                "leftTop": "8",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "8"
            }
        },
        {
            "guid": "839cb9a6-e83d-42f0-b781-1c03215c1ac6",
            "display": "9",
            "corner": {
                "leftTop": "9",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "9"
            }
        },
        {
            "guid": "a4abacc8-6149-4391-b968-765a4b3eb988",
            "display": "10",
            "corner": {
                "leftTop": "10",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "10"
            }
        },
        {
            "guid": "3a51f089-ac4a-4dcd-87a8-22e7408bc20d",
            "display": "11",
            "corner": {
                "leftTop": "11",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "11"
            }
        },
        {
            "guid": "241c4327-e008-48cd-a805-25c4d75fc900",
            "display": "12",
            "corner": {
                "leftTop": "12",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "12"
            }
        },
        {
            "guid": "c95efbf0-346e-4704-9c90-86e2e3a0f423",
            "display": "13",
            "corner": {
                "leftTop": "13",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "13"
            }
        },
        {
            "guid": "e27083d8-3c1d-4a4b-9386-73c19eaf7239",
            "display": "14",
            "corner": {
                "leftTop": "14",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "14"
            }
        },
        {
            "guid": "da280a67-b92b-4ef7-81a9-dea2ae7b7105",
            "display": "15",
            "corner": {
                "leftTop": "15",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "15"
            }
        },
        {
            "guid": "b6334d70-7074-443b-9613-0bdc3a6d3ff4",
            "display": "16",
            "corner": {
                "leftTop": "16",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "16"
            }
        },
        {
            "guid": "1a2bee10-f0aa-4538-80de-f88b9885fdb7",
            "display": "17",
            "corner": {
                "leftTop": "17",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "17"
            }
        },
        {
            "guid": "79db195f-0204-43ef-a9fd-b940a2f5b20a",
            "display": "18",
            "corner": {
                "leftTop": "18",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "18"
            }
        },
        {
            "guid": "ae64a5c4-a131-4dd2-a88a-e4598946853f",
            "display": "19",
            "corner": {
                "leftTop": "19",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "19"
            }
        },
        {
            "guid": "39c843f9-aac7-4d2e-80cd-4706e79c9b03",
            "display": "20",
            "corner": {
                "leftTop": "20",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "20"
            }
        },
        {
            "guid": "57f59478-0f46-411e-a494-d359795e1755",
            "display": "21",
            "corner": {
                "leftTop": "21",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "21"
            }
        },
        {
            "guid": "cbaa4ee9-e036-48c7-a31a-aa0b88e2c49b",
            "display": "22",
            "corner": {
                "leftTop": "22",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "22"
            }
        },
        {
            "guid": "607e12e8-1c9a-48c7-890e-4c4f8a7c4a93",
            "display": "23",
            "corner": {
                "leftTop": "23",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "23"
            }
        },
        {
            "guid": "9100cc18-b8da-4149-a1f9-79ff09d60f2a",
            "display": "24",
            "corner": {
                "leftTop": "24",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "24"
            }
        },
        {
            "guid": "68a60b05-921b-4f53-bd4a-1b6959dbdc77",
            "display": "25",
            "corner": {
                "leftTop": "25",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "25"
            }
        },
        {
            "guid": "3544bb37-0dbb-4241-8540-a9dfc74ccdb6",
            "display": "26",
            "corner": {
                "leftTop": "26",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "26"
            }
        },
        {
            "guid": "fd46a489-e2f2-4656-9b3d-43fc5d903fa5",
            "display": "27",
            "corner": {
                "leftTop": "27",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "27"
            }
        },
        {
            "guid": "f4aaea3d-1ad9-4825-8e83-28df5b8163a4",
            "display": "28",
            "corner": {
                "leftTop": "28",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "28"
            }
        },
        {
            "guid": "2a3941ce-c07f-4d03-91de-609e3b636619",
            "display": "29",
            "corner": {
                "leftTop": "29",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "29"
            }
        },
        {
            "guid": "d462befa-6b51-4e70-bb7a-e6cb3af7a34a",
            "display": "30",
            "corner": {
                "leftTop": "30",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "30"
            }
        },
        {
            "guid": "6e88e21e-6196-4fb9-9700-70280df7bcdf",
            "display": "31",
            "corner": {
                "leftTop": "31",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "31"
            }
        },
        {
            "guid": "8824e9a4-40a5-4b19-b577-e9542be21135",
            "display": "32",
            "corner": {
                "leftTop": "32",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "32"
            }
        },
        {
            "guid": "ea52b076-592a-4d13-aa1d-4bf4cf241671",
            "display": "33",
            "corner": {
                "leftTop": "33",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "33"
            }
        },
        {
            "guid": "c4f23351-12f2-42b4-9d84-f16c272d9688",
            "display": "34",
            "corner": {
                "leftTop": "34",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "34"
            }
        },
        {
            "guid": "bcd789ba-6d81-4f8d-a3a1-01aeba2b2661",
            "display": "35",
            "corner": {
                "leftTop": "35",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "35"
            }
        },
        {
            "guid": "b6684a03-6393-4899-a28c-5e6715152c8b",
            "display": "36",
            "corner": {
                "leftTop": "36",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "36"
            }
        },
        {
            "guid": "3f0b06ec-bebc-4736-a834-22b4588b0200",
            "display": "37",
            "corner": {
                "leftTop": "37",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "37"
            }
        },
        {
            "guid": "2d222f1e-ec3a-47d9-8f38-e4f43f4dea5b",
            "display": "38",
            "corner": {
                "leftTop": "38",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "38"
            }
        },
        {
            "guid": "0ee2a1ef-c0cf-4468-9737-b964a7765cb8",
            "display": "39",
            "corner": {
                "leftTop": "39",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "39"
            }
        },
        {
            "guid": "80f610d7-d0b7-4a87-bf34-a5db68580a83",
            "display": "40",
            "corner": {
                "leftTop": "40",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "40"
            }
        },
        {
            "guid": "450ac25a-e059-435e-b5b1-35cdeb58194b",
            "display": "41",
            "corner": {
                "leftTop": "41",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "41"
            }
        },
        {
            "guid": "2c2a80d8-53aa-46e9-8a5d-d29453fa392b",
            "display": "42",
            "corner": {
                "leftTop": "42",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "42"
            }
        },
        {
            "guid": "ce930274-3d07-471c-a817-1638c0b780a5",
            "display": "43",
            "corner": {
                "leftTop": "43",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "43"
            }
        },
        {
            "guid": "c900d56c-5501-4839-8418-f77c515311d2",
            "display": "44",
            "corner": {
                "leftTop": "44",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "44"
            }
        },
        {
            "guid": "031a8580-fde3-4b9d-a232-2bda211be354",
            "display": "45",
            "corner": {
                "leftTop": "45",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "45"
            }
        },
        {
            "guid": "46ae0265-4643-4a8c-ad77-dc60f4e47f89",
            "display": "46",
            "corner": {
                "leftTop": "46",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "46"
            }
        },
        {
            "guid": "57c945f1-7b86-41b5-97cc-e4d21310e1aa",
            "display": "47",
            "corner": {
                "leftTop": "47",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "47"
            }
        },
        {
            "guid": "f0094d14-c688-4253-8b16-eac7333cf67c",
            "display": "48",
            "corner": {
                "leftTop": "48",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "48"
            }
        },
        {
            "guid": "0ec01572-75c8-4087-81f3-c9493ca283e9",
            "display": "49",
            "corner": {
                "leftTop": "49",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "49"
            }
        },
        {
            "guid": "6eb17abb-476a-48ff-9487-c4a9c5719096",
            "display": "50",
            "corner": {
                "leftTop": "50",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "50"
            }
        },
        {
            "guid": "df9a3537-8c8c-404e-9ef9-9eb916de680b",
            "display": "51",
            "corner": {
                "leftTop": "51",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "51"
            }
        },
        {
            "guid": "27f1b775-1239-49ce-8f94-c7d61d497b08",
            "display": "52",
            "corner": {
                "leftTop": "52",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "52"
            }
        },
        {
            "guid": "ec9b5c4f-57d2-4f5d-a5ff-457f3e298783",
            "display": "53",
            "corner": {
                "leftTop": "53",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "53"
            }
        },
        {
            "guid": "09905704-18ab-44e9-ba08-db3cf69d3359",
            "display": "54",
            "corner": {
                "leftTop": "54",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "54"
            }
        },
        {
            "guid": "632b4d31-5323-48fd-bbc4-8af0b4c4aaef",
            "display": "55",
            "corner": {
                "leftTop": "55",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "55"
            }
        },
        {
            "guid": "eb8861a9-2894-48c0-ac5f-b68518da3e48",
            "display": "56",
            "corner": {
                "leftTop": "56",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "56"
            }
        },
        {
            "guid": "7a621810-68f6-49e2-9767-c20d7a908e5c",
            "display": "57",
            "corner": {
                "leftTop": "57",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "57"
            }
        },
        {
            "guid": "97b22329-02b4-47aa-b73a-f59c1a4d6b02",
            "display": "58",
            "corner": {
                "leftTop": "58",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "58"
            }
        },
        {
            "guid": "3fc9c370-bccf-456f-80ca-d765f1cd8e58",
            "display": "59",
            "corner": {
                "leftTop": "59",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "59"
            }
        },
        {
            "guid": "6d7edfb1-d9a7-4003-86d2-e1630e99bbb8",
            "display": "60",
            "corner": {
                "leftTop": "60",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "60"
            }
        },
        {
            "guid": "0aea2ce0-4df9-49a4-b44a-d5ce97d8cb49",
            "display": "61",
            "corner": {
                "leftTop": "61",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "61"
            }
        },
        {
            "guid": "f1333a08-e120-4f1b-86ed-ad5ee5921d9e",
            "display": "62",
            "corner": {
                "leftTop": "62",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "62"
            }
        },
        {
            "guid": "d5e06893-5710-468f-89a2-46c385196b64",
            "display": "63",
            "corner": {
                "leftTop": "63",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "63"
            }
        },
        {
            "guid": "d84a7e1d-a016-4f39-b4b0-dfb8e6b3cd9e",
            "display": "64",
            "corner": {
                "leftTop": "64",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "64"
            }
        },
        {
            "guid": "9dfeb176-41ed-418d-b285-87a927867ad9",
            "display": "65",
            "corner": {
                "leftTop": "65",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "65"
            }
        },
        {
            "guid": "0178394e-b1c9-4343-af7c-e2b064433fd3",
            "display": "66",
            "corner": {
                "leftTop": "66",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "66"
            }
        },
        {
            "guid": "b504d307-b5c2-4ed2-b8ca-f8c63295b14a",
            "display": "67",
            "corner": {
                "leftTop": "67",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "67"
            }
        },
        {
            "guid": "4c2c3672-e0fc-4119-ba6b-88158a59abad",
            "display": "68",
            "corner": {
                "leftTop": "68",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "68"
            }
        },
        {
            "guid": "efabdd15-aa10-4ee1-aeac-2f01252fe421",
            "display": "69",
            "corner": {
                "leftTop": "69",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "69"
            }
        },
        {
            "guid": "b609a13b-912d-4faa-9d71-19f2004f0136",
            "display": "70",
            "corner": {
                "leftTop": "70",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "70"
            }
        },
        {
            "guid": "286c45db-894a-461a-b644-57c162f6a4d5",
            "display": "71",
            "corner": {
                "leftTop": "71",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "71"
            }
        },
        {
            "guid": "45b43539-831d-40cb-82e9-bec492bcb631",
            "display": "72",
            "corner": {
                "leftTop": "72",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "72"
            }
        },
        {
            "guid": "c7bd8114-c59a-4440-89aa-c910df00c47a",
            "display": "73",
            "corner": {
                "leftTop": "73",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "73"
            }
        },
        {
            "guid": "a29c2cff-e27f-4fd2-8b36-1ea230b7f76a",
            "display": "74",
            "corner": {
                "leftTop": "74",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "74"
            }
        },
        {
            "guid": "f3482325-a064-4f10-a1ac-a530ef1569ef",
            "display": "75",
            "corner": {
                "leftTop": "75",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "75"
            }
        },
        {
            "guid": "4993f51e-b6dd-45a2-9bce-128615c7f026",
            "display": "76",
            "corner": {
                "leftTop": "76",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "76"
            }
        },
        {
            "guid": "fcdfe17e-1236-4596-992d-8dc71093e361",
            "display": "77",
            "corner": {
                "leftTop": "77",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "77"
            }
        },
        {
            "guid": "4a57ccd4-511c-4653-af36-8aff60616450",
            "display": "78",
            "corner": {
                "leftTop": "78",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "78"
            }
        },
        {
            "guid": "f6943c5e-05cd-483e-a353-bd32d33c1f29",
            "display": "79",
            "corner": {
                "leftTop": "79",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "79"
            }
        },
        {
            "guid": "8185c1bd-140a-43a8-a663-64e368d4c418",
            "display": "80",
            "corner": {
                "leftTop": "80",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "80"
            }
        },
        {
            "guid": "c642811d-4dc9-4693-b082-9f6db14ddaab",
            "display": "81",
            "corner": {
                "leftTop": "81",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "81"
            }
        },
        {
            "guid": "0b0b0ca7-08d1-447b-9f3c-e2ee03df12a7",
            "display": "82",
            "corner": {
                "leftTop": "82",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "82"
            }
        },
        {
            "guid": "b7d3426a-b702-4c34-a471-68c4893d3e33",
            "display": "83",
            "corner": {
                "leftTop": "83",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "83"
            }
        },
        {
            "guid": "6f58bc80-0422-433d-bc6a-b8bd50cf4999",
            "display": "84",
            "corner": {
                "leftTop": "84",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "84"
            }
        },
        {
            "guid": "70077a57-9e94-40e1-9889-f1c396a6a9cd",
            "display": "85",
            "corner": {
                "leftTop": "85",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "85"
            }
        },
        {
            "guid": "141431c8-f430-48e3-8685-b822f7e023fe",
            "display": "86",
            "corner": {
                "leftTop": "86",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "86"
            }
        },
        {
            "guid": "16dcc6c4-546e-4004-8f90-1f1f7ebf3e7f",
            "display": "87",
            "corner": {
                "leftTop": "87",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "87"
            }
        },
        {
            "guid": "2923206b-278e-486f-b924-38506b69e101",
            "display": "88",
            "corner": {
                "leftTop": "88",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "88"
            }
        },
        {
            "guid": "2aff0030-0bab-4fac-9c10-aa431b4d6809",
            "display": "89",
            "corner": {
                "leftTop": "89",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "89"
            }
        },
        {
            "guid": "451b4bd8-989b-44d9-ba77-b165704456ae",
            "display": "90",
            "corner": {
                "leftTop": "90",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "90"
            }
        },
        {
            "guid": "a73e819a-b474-4acf-98a5-fcd56ae89c39",
            "display": "91",
            "corner": {
                "leftTop": "91",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "91"
            }
        },
        {
            "guid": "67e5a00f-6973-47c1-a377-cfab6c0402c7",
            "display": "92",
            "corner": {
                "leftTop": "92",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "92"
            }
        },
        {
            "guid": "3f464978-b496-4d28-8af6-6ba320b289ea",
            "display": "93",
            "corner": {
                "leftTop": "93",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "93"
            }
        },
        {
            "guid": "0981c4ff-d2c3-474e-ad6b-bb791655c023",
            "display": "94",
            "corner": {
                "leftTop": "94",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "94"
            }
        },
        {
            "guid": "560990b1-057f-4a58-a1cc-2882743d64c3",
            "display": "95",
            "corner": {
                "leftTop": "95",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "95"
            }
        },
        {
            "guid": "c917a21d-a4d7-4e21-86ac-a738bdd28d69",
            "display": "96",
            "corner": {
                "leftTop": "96",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "96"
            }
        },
        {
            "guid": "1e1d09fe-66dd-472f-a1bd-4b8ed25cbde9",
            "display": "97",
            "corner": {
                "leftTop": "97",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "97"
            }
        },
        {
            "guid": "4af7f1c0-b368-4dcb-a8ac-751492f8a0bf",
            "display": "98",
            "corner": {
                "leftTop": "98",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "98"
            }
        },
        {
            "guid": "c33c0cf4-b7b1-402d-a00a-0b503c030abb",
            "display": "99",
            "corner": {
                "leftTop": "99",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "99"
            }
        },
        {
            "guid": "c6efe2c3-5e86-4105-ab35-eebe8d1838aa",
            "display": "100",
            "corner": {
                "leftTop": "100",
                "leftBottom": "",
                "rightTop": "",
                "rightBottom": "100"
            }
        }
    ]
}
