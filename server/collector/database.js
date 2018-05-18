/* global config */

function getObjectClass(obj){
  return Object.prototype.toString.call(obj).slice(8, -1);
}

class Database {
  constructor(){
    this.MySQL = require("promise-mysql");
    this.isConnected = false;
  }
  
  async connect(){
    try {
      config.mysql.charset = "utf8mb4";
      console.log(config.mysql);
      this.connection = await this.MySQL.createConnection(config.mysql);
      this.isConnected = true;
    } catch(e){
      throw e;
    }
  }
  
  async _query(query, values){
    return this.killBuffers(await this.connection.query(query, values));
  }
  
  async _first(query, values){
    let response = await this._query(query, values);
    
    if( response.length === 0 ) return null;
    else return response[0];
  }
  
  async _count(query, values){
    let response = await this._query(query, values);
    
    if( response.length === 0 ) return 0;
    else return response[0].result;
  }
  
  async _insert(query, values){
    let response = await this.connection.query(query, values);
    return response.insertId;
  }
  
  async _is(query, values){
    let response = await this._first(query, values);
    return response.result > 0;
  }
  
  killBuffers(obj){
    if( getObjectClass(obj) != "Array" ) obj = [ obj ];
    
    obj.forEach((n) => {
      Object.keys(n).forEach((v) => {
        if( getObjectClass(n[v]) == "Uint8Array" ) n[v] = n[v].readInt8(0); 
      });
    });
    
    return obj;
  }
  
  async getUserByApiKey(apikey){
    return await this._first("SELECT * FROM users WHERE apikey = ? LIMIT 1", [ apikey ]);
  }
  
  async getUnverifiedApp(app){
    return await this._first("SELECT * FROM apps_unverified WHERE appid = ?", [ app ]);
  }
  
  async addApp(table, appid, title, oprice, price, discount, windows, macos, linux, htcvive, oculusrift, windowsmr, reviews, releasedate, submitter, verifier){
    var items = [ appid, title, oprice, price, discount, windows, macos, linux, htcvive, oculusrift, windowsmr, reviews, releasedate, submitter ];
    if( table == "" ) items.push(verifier);
    
    return await this._query("INSERT INTO apps" + table + " (appid, title, oprice, price, discount, windows, macos, linux, htcvive, oculusrift, windowsmr, reviews, releasedate, submitter" + (table == "" ? ", verifier" : "") + ")" + " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?), ?" + ( table == "" ? ", ?" : "") + ")", items);
  }
  
  async deleteApp(table, appid){
    return await this._query("DELETE FROM apps" + table + " WHERE appid = ?", [ appid ]);
  }
}

module.exports = Database;