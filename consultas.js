const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'postgres',
    database: 'skatepark',
    port: 5432,
})

async function nuevoSkater(email, nombre, password, anos_experiencia, especialidad, foto) {
    const result = await pool.query(
        `INSERT INTO skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ('${email}', '${nombre}', '${password}', '${anos_experiencia}', '${especialidad}', '${foto}', false) RETURNING *`
    )
    const skater = result.rows[0];
    return skater;
}

async function getSkater(email, password){
    const result = await pool.query(
        `SELECT * FROM skaters WHERE email = '${email}' AND password = '${password}'`
    );
    return result.rows[0];
}

async function actualizarSkater(email, nombre, anos_experiencia, especialidad) {
    const result = await pool.query(
        `UPDATE skaters SET nombre ='${nombre}', anos_experiencia='${anos_experiencia}', especialidad='${especialidad}' WHERE email = '${email}' RETURNING *`
    )
    return result.rows[0];
}

async function eliminarSkater(email) {
    const result = await pool.query(
        `DELETE FROM skaters WHERE email = '${email}' RETURNING *`
    )
   return result.rowCount;
}

async function getSkaters() {
    const result = await pool.query(`SELECT * FROM skaters`);
    return result.rows;
}

async function cambiarEstado(id, estado){
    const result = await pool.query(
        `UPDATE skaters SET estado = ${estado} WHERE id = ${id} RETURNING *`
    );
    return result.rows[0];
}

module.exports = { nuevoSkater, getSkater, actualizarSkater, eliminarSkater, getSkaters, cambiarEstado }