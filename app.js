const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();
app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (req, res) => {
  const getPlayersQuery = `select * from cricket_team`;
  const playersArray = await database.all(getPlayersQuery);
  res.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const postPlayerQuery = `
    insert into cricket_team (player_name, jersey_number, role)
    values ('${playerName}','${jerseyNumber}','${role}');`;
  const player = await database.run(postPlayerQuery);
  res.send("Player Added to Team");
});

app.get("/players/:playerId/", async (req, res) => {
  const { playerId } = req.params;
  const getPlayerQuery1 = `
    select * from cricket_team where player_id=${playerId};`;
  const player = await database.get(getPlayerQuery1);
  res.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/", async (req, res) => {
  const { playerName, jerseyNumber, role } = req.body;
  const { playerId } = req.params;
  const updatePlayerQuery = `
    UPDATE cricket_team SET 
    player_name='${playerName}',
    jersey_number='${jerseyNumber}',
    role='${role}'
    where player_id=${playerId};`;

  await database.run(updatePlayerQuery);
  res.send("Player Details Updated");
});

app.delete("/players/:playerId", async (req, res) => {
  const { playerId } = req.params;
  const deletePlayerQuery = `
    delete from cricket_team where 
    player_id=${playerId};`;
  await database.run(deletePlayerQuery);
  res.send("Player Removed");
});

module.exports = app;
