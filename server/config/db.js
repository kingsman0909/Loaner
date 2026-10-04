require("dotenv").config();

const mysql = require("mysql2/promise");


/*
|--------------------------------------------------------------------------
| DATABASE MODE
|--------------------------------------------------------------------------
|
| DB_MODE=aiven
|     -> Aiven MySQL
|
| DB_MODE=local
|     -> Local MySQL
|
*/

const dbMode = String(process.env.DB_MODE || "local")
    .trim()
    .toLowerCase();


/*
|--------------------------------------------------------------------------
| DATABASE CONFIGURATION
|--------------------------------------------------------------------------
*/

let dbConfig;

switch (dbMode) {

    // ==========================================================
    // AIVEN
    // ==========================================================

    case "aiven":

        dbConfig = {
            host: process.env.AIVEN_DB_HOST,
            port: Number(process.env.AIVEN_DB_PORT || 27887),
            user: process.env.AIVEN_DB_USER,
            password: process.env.AIVEN_DB_PASSWORD,
            database: process.env.AIVEN_DB_NAME,

            ssl: {
                rejectUnauthorized: false
            }
        };

        break;


    // ==========================================================
    // LOCAL MYSQL
    // ==========================================================

    case "local":

        dbConfig = {
            host: process.env.LOCAL_DB_HOST || "localhost",
            port: Number(process.env.LOCAL_DB_PORT || 3306),
            user: process.env.LOCAL_DB_USER || "root",
            password: process.env.LOCAL_DB_PASSWORD || "",
            database: process.env.LOCAL_DB_NAME || "loaner"
        };

        break;


    // ==========================================================
    // INVALID MODE
    // ==========================================================

    default:

        throw new Error(
            `[DB] Invalid DB_MODE="${dbMode}". ` +
            `Use "local" or "aiven".`
        );
}


/*
|--------------------------------------------------------------------------
| DISPLAY DATABASE CONFIGURATION
|--------------------------------------------------------------------------
*/

console.log("");
console.log("========================================");
console.log("       DATABASE CONFIGURATION");
console.log("========================================");
console.log(`[DB] Mode     : ${dbMode.toUpperCase()}`);
console.log(`[DB] Host     : ${dbConfig.host}`);
console.log(`[DB] Port     : ${dbConfig.port}`);
console.log(`[DB] User     : ${dbConfig.user}`);
console.log(`[DB] Database : ${dbConfig.database}`);
console.log(
    `[DB] SSL      : ${
        dbMode === "aiven"
            ? "ENABLED"
            : "DISABLED"
    }`
);
console.log("========================================");
console.log("");


/*
|--------------------------------------------------------------------------
| MYSQL CONNECTION POOL
|--------------------------------------------------------------------------
*/

const pool = mysql.createPool({

    ...dbConfig,

    waitForConnections: true,

    connectionLimit: 10,

    queueLimit: 0,

    enableKeepAlive: true,

    keepAliveInitialDelay: 0
});


/*
|--------------------------------------------------------------------------
| TRACK INITIALIZED CONNECTIONS
|--------------------------------------------------------------------------
*/

const initializedConnections = new WeakSet();


/*
|--------------------------------------------------------------------------
| INITIALIZE CONNECTION
|--------------------------------------------------------------------------
|
| Aiven-specific SQL configuration.
|
*/

async function initializeConnection(connection) {

    if (dbMode !== "aiven") {
        return;
    }

    if (initializedConnections.has(connection)) {
        return;
    }

    await connection.query(`
        SET SESSION sql_mode = REPLACE(
            @@SESSION.sql_mode,
            'ANSI_QUOTES',
            ''
        )
    `);

    initializedConnections.add(connection);
}


/*
|--------------------------------------------------------------------------
| DATABASE WRAPPER
|--------------------------------------------------------------------------
|
| Existing models can continue using:
|
|     db.query(...)
|     db.execute(...)
|     db.getConnection()
|
*/

const db = {


    /*
    |--------------------------------------------------------------------------
    | QUERY
    |--------------------------------------------------------------------------
    */

    async query(sql, values) {

        let connection;

        try {

            connection = await pool.getConnection();

            await initializeConnection(connection);

            return await connection.query(sql, values);

        } finally {

            if (connection) {
                connection.release();
            }

        }
    },


    /*
    |--------------------------------------------------------------------------
    | EXECUTE
    |--------------------------------------------------------------------------
    */

    async execute(sql, values) {

        let connection;

        try {

            connection = await pool.getConnection();

            await initializeConnection(connection);

            return await connection.execute(sql, values);

        } finally {

            if (connection) {
                connection.release();
            }

        }
    },


    /*
    |--------------------------------------------------------------------------
    | GET CONNECTION
    |--------------------------------------------------------------------------
    */

    async getConnection() {

        const connection = await pool.getConnection();

        await initializeConnection(connection);

        return connection;
    }

};


/*
|--------------------------------------------------------------------------
| TEST DATABASE CONNECTION
|--------------------------------------------------------------------------
*/

(async () => {

    let connection;

    try {

        connection = await pool.getConnection();

        await initializeConnection(connection);

        await connection.query("SELECT 1");


        /*
        |--------------------------------------------------------------------------
        | SQL MODE
        |--------------------------------------------------------------------------
        */

        const [modeRows] = await connection.query(
            "SELECT @@SESSION.sql_mode AS sql_mode"
        );

        const sqlMode = modeRows[0]?.sql_mode || "";


        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        console.log(
            `[DB] MySQL connection successful → ${dbMode.toUpperCase()}`
        );

        console.log(
            `[DB] SQL Mode → ${sqlMode}`
        );

        console.log(
            `[DB] ANSI_QUOTES → ${
                sqlMode.includes("ANSI_QUOTES")
                    ? "ENABLED"
                    : "DISABLED"
            }`
        );

        console.log("");


    } catch (error) {

        console.error("");
        console.error("========================================");
        console.error("       DATABASE CONNECTION ERROR");
        console.error("========================================");
        console.error(`[DB] Mode : ${dbMode.toUpperCase()}`);
        console.error(`[DB] Host : ${dbConfig.host}`);
        console.error(`[DB] Port : ${dbConfig.port}`);
        console.error(`[DB] DB   : ${dbConfig.database}`);
        console.error(`[DB] Error: ${error.message}`);
        console.error("========================================");
        console.error("");

    } finally {

        if (connection) {
            connection.release();
        }

    }

})();


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = db;