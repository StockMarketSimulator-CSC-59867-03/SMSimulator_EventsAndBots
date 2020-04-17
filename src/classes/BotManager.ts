import {Order} from '../models/order.model';
import {StockDataModel} from '../models/stockData.model';

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
       let batch = this.db.batch();
       let date = new Date();
        console.log(date.getTime());
        for (let [symbol, data] of this.stockMap) {
            
            let favoribility = data.favorability;
            let price = data.price;
            console.log(favoribility);


          }

    }

}