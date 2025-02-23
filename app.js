const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
//API 1 Get Method
app.get(`/players/`, async (request, response) => {
  const getCricketTeamQuery = `
    SELECT
      *
    FROM
      cricket_team;`
  const cricketArray = await db.all(getCricketTeamQuery)
  response.send(cricketArray.map(i => convertDbObjectToResponseObject(i)))
})
//API 2 Post Method
app.post(`/players/`, async (request, response) => {
  const details = request.body
  const {playerName, jerseyNumber, role} = details
  const addCricketQuery = `
  INSERT INTO
  cricket_team(player_name,jersey_number,role)
  VALUES( 
    '${playerName}',
    ${jerseyNumber},
    '${role}');`

  const dbResponse = await db.run(addCricketQuery)
  response.send('Player Added to Team')
})
// API 3 GET Method
app.get(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT
     *
    FROM
   cricket_team
    WHERE
      player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})
//API 4 PUT Method
app.put(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const details = request.body
  const {playerName, jerseyNumber, role} = details
  const updatePlayerQuery = `
    UPDATE
      cricket_team
    SET
    player_name='${playerName}',
    jersey_number='${jerseyNumber}',
    role='${role}'
    WHERE 
    player_id=${playerId};`
  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
//API 5 DELETE Method
app.delete(`/players/:playerId/`, async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE
      player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app
