var DBUtilis = require('./DBUtilis');
// this module is to orgnaize any sql queries we have
module.exports = {
    getAccounts: function(userid, res) {
		// nested queries to get all accounts for user id, with basic constructs
        let sql = 'select * from (select a_id from customer_accounts where c_id = "' + userid + '") as t_a_id inner join account_info on t_a_id.a_id = account_info.a_id group by account_info.a_id';
        DBUtilis.executeQuery(sql, res);
    },
	addUser: function(userid, dob, phone, res) {
		// insert query, modifies database
        let sql = 'INSERT INTO customer_info (c_id, d_o_b, phone)VALUES(?, ?, ?)';
		let data = [userid, dob, phone]
        DBUtilis.executeQueryWithData(sql, data, res);
    },
    addAccount: function(userid, res) {
		// insert query
        let sql = 'INSERT INTO customer_accounts (c_id)VALUES("' + userid + '")';
        DBUtilis.executeGetQuery(sql, res);
    },
    deposit: function(amount, act_id, res) {
		// this is a transaction, modifies database
        let sql = 'update account_info SET account_balance = account_balance + ? where a_id = ?';
		let data = [amount, act_id]
		
		let sql2 = "INSERT INTO transactions_table (a_id, transaction_amount, transaction_date, transaction_description) VALUES(?, ?,date('now'), ?)"
		let data2 = [act_id, amount, "Desposit"]
        
        DBUtilis.executeTransaction(sql,sql2, data, data2, res);
    },
    withdraw: function(amount, act_id, res) {
		// this is a transaction, with 3 sql statements, modifies database
        let sql = 'update account_info SET account_balance = account_balance - ? where a_id = ?';
		let data = [amount, act_id]
		
		let sql2 = "INSERT INTO transactions_table (a_id, transaction_amount, transaction_date, transaction_description) VALUES(?, ?,date('now'), ?)"
		let data2 = [act_id, amount*-1, "Desposit"]
		
		let sql3 = 'select * from account_info where a_id = ? and account_balance - ? >= 0';
		let data3 = [act_id, amount]
		
        DBUtilis.executeTransactionWithCheck(sql,sql2, sql3, data, data2, data3, res);
    },
    transfer: function(amount, act_id1, act_id2, res) {
		// this is a transaction, modifies database
        let sql1 = 'update account_info SET account_balance = account_balance - ? where a_id = ?';
		let sql2 = 'update account_info SET account_balance = account_balance + ? where a_id = ?';
		let data1 = [amount, act_id1]
		let data2 = [amount, act_id2]
		let sql3 = 'select * from account_info where a_id = ? and account_balance - ? >= 0';
		let data3 = [act_id1, amount]
		
		DBUtilis.executeTransactionWithCheck(sql1, sql2, sql3, data1, data2, data3, res);
    },
    getTransactions: function(userid, res) {
		// nested queries to find all transactions for a user
        let sql = 'select * from (select a_id from customer_accounts where c_id = "' + userid + '") as t inner join transactions_table on t.a_id = transactions_table.a_id';
        DBUtilis.executeQuery(sql, res);
    },
    getTotalBalance: function(userid, res) {
		// nested queries to get total balance using Aggregate functions
        let sql = 'select sum(account_balance) as bal from (select a_id from customer_accounts where c_id = "' + userid + '") as t inner join account_info on t.a_id = account_info.a_id';
        DBUtilis.executeGetQuery(sql, res);
    },
    viewAll: function(res) {
		// shows the use of view
        let sql = 'select * from view_all_accounts';
        DBUtilis.executeQuery(sql, res);
    },
};


/*
this is the view
CREATE VIEW `view_all_accounts` AS 
SELECT account_balance, c_id, account_info.a_id from account_info INNER JOIN customer_accounts where account_info.a_id = customer_accounts.a_id

this is 1 trigger
CREATE TRIGGER on_account_insert AFTER INSERT ON customer_accounts
BEGIN
INSERT INTO account_info (a_id, account_balance)
         VALUES(NEW.a_id, 0);
END

this is the second trigger
CREATE TRIGGER on_customer_info_insert AFTER INSERT ON customer_info
BEGIN
INSERT INTO customer_accounts (c_id)
         VALUES(NEW.c_id);
END
*/