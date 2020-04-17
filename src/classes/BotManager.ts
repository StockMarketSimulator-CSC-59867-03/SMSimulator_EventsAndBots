import {Order} from '../models/order.model';
import {StockDataModel} from '../models/stockData.model';


// Returns a number within the range (starting - range) and (starting + range)
function randomizeNumber(range: number, starting: number){
    return Math.floor(Math.random() * ((starting + range) - (starting - range) + 1)) + (starting - range);
}

export default class BotManager {
    sessionID: string;
    stockMap: Map<string,StockDataModel>; // favoribility settings
    db: any;
    stockDataListner: any;
    constructor(sessionID: string, db: any) {
        this.sessionID = sessionID;
        this.db = db;
        console.log("BotManager Created");
        this.stockMap = new Map();
        this.getStocks();
        this.loop();
        setInterval(this.loop.bind(this),5000);
    }

    getStocks(){
        this.stockMap = new Map();
        let stockDoc = this.db.collection("Sessions").doc(this.sessionID).collection("Stocks");

        if(this.stockDataListner != null){
            this.stockDataListner();
        }

       this.stockDataListner = stockDoc
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified") {
                this.stockMap.set(change.doc.id,change.doc.data());
            }
            if (change.type === "removed") {
                console.log("Removed city: ", change.doc.data());
            }
        });
    });

    }

   async loop(){
        console.log("BOT LOOP");
       let batch = this.db.batch();
       let date = new Date();

        for (let [symbol, data] of this.stockMap) {
            let buyOrderDoc = this.db.collection("BuyOrders").doc();
            let sellOrderDoc = this.db.collection("SellOrders").doc();
            let favoribility = data.favorability;

            // BUY ORDER
            let priceRange = 10; // Needs to depend on favoribility
            let quantity = 10; // Needs to depend on favoribility

            let newBuyOrder: Order = {
                price: randomizeNumber(priceRange,data.price),
                quantity: quantity,
                sessionID: this.sessionID,
                stock: symbol,
                time: date.getTime(),
                user: "bot"
            };

            batch.set(buyOrderDoc, newBuyOrder);

            // SELL ORDER
            let newSellOrder: Order = {
                price: randomizeNumber(priceRange,data.price),
                quantity: quantity * 2,
                sessionID: this.sessionID,
                stock: symbol,
                time: date.getTime(),
                user: "bot"
            };

            batch.set(sellOrderDoc, newSellOrder);


          }

          batch.commit().then(function () {
            console.log("Completed Batch");
        });

    }

}