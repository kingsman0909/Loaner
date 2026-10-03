const db = require('../config/db');

const findByUsername = async (username) => {
    console.log("model reach")
    const [rows] = await db.query(`
        select * from Loaner where username = ?
    `, [username]);

    
    return rows[0];
}

const createLoaner = async (Loaner) => {
    const {
        role,
        username,
        password,
        firstname,
        lastname,
        age,
        sourceOfIncome,
        contact,
        province,
        city,
        brgy,
        subd
    } = Loaner;

    
    
        const [rows] = await db.query(`
            insert into Loaner(username, password, firstname, lastname, age, source_of_income, province, city, brgy, subd, contact, role)
            values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
        `, [username, password, firstname, lastname, age, sourceOfIncome, province, city, brgy, subd, contact, role])

        
        return rows;
   
}

const changePassword = async (username, newPass) => {

    const [rows] = await db.query( `
            update Loaner set password = ? where username = ?
        `, [newPass, username]);
    
    return rows;
}



module.exports = {
    findByUsername,
    createLoaner,
    changePassword
}