const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./bankBackend.db', (err) => {
    //let db = new sqlite3.Database('./test.db', (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

module.exports = {
    executeQuery: function(sql, res) {
        db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            rows.forEach((row) => {
                //console.log(row); // right now it just prints out the query, but we should have it return and then handle it on the server
            });
			res.send(rows)
        });
    },
    executeGetQuery: function(sql, res) {
        db.get(sql, [], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            res.send(row)
        });
    },
    executeQueryWithData: function(sql, data, res) {
        db.get(sql, data, (err, row) => {
            if (err) {
				res.send(err.message);
                return console.error(err.message);
            }
			res.send(row)
        });
    },
    executeTransaction: function(sql, sql2, data1, data2, res) {
        db.serialize(function() {
            db.run("BEGIN");
            db.run(sql, data1, (err, row) => {
                if (err) {
                    console.log(err.message);
                    res.send("Transaction has been cancelled")
                } else {
                    db.run(sql2, data2, (err, row) => {
                        if (err) {
                            console.log(err);
                            db.rollback;
                            res.send("Transaction has been cancelled");
                        } else {
                            console.log('Transaction is done')
                            db.run('commit');
                            res.send("Transaction succeed");
                        }
                    });
                }

            });

        });
    },
    executeTransactionWithCheck: function(sql, sql2, sql3, data1, data2, data3, res) {
        db.serialize(function() {
            db.run("BEGIN");
			db.all(sql3, data3, (err, rows) => {
				if (err) {
					console.log(err.message)
					return res.send(err.message);
				} else {
					if (rows.length > 0) { // checks to make sure there was a row with that a_id
						db.run(sql, data1, (err, row) => { 
							if (err) {
								console.log(err.message);
								return res.send("Transaction has been cancelled")
							} else {
								db.run(sql2, data2, (err, row) => {
									if (err) {
										console.log(err);
										db.rollback;
										return res.send("Transaction has been cancelled");
									} else {
										console.log('Transaction is done')
										db.run('commit');
										return res.send("Transaction succeed");
									}
								});
							}

						});
					} else {
						db.run('commit');
						return res.send("check failed"); // if the user account doesn't exist then send back that it doesn't
					}
				}
			});
        });
    }
};