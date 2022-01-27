// const { client } = require('./index');

// async function testDB() {
//   try {
//     // connect the client to the database, finally
//     client.connect();

//     // queries are promises, so we can await them
//     const {rows} = await client.query(`SELECT * FROM users;`);

//     // for now, logging is a fine way to see what's up
//     console.log(rows);
//   } catch (error) {
//     console.error(error);
//   } finally {
//     // it's important to close out the client connection
//     client.end();
//   }
// }

// testDB();
const {
    createUser,
    client,
    getAllUsers // new
  } = require('./index');
  
  async function dropTables() {
    try {
      console.log("Starting to drop tables...");
      await client.query(`
      DROP TABLE IF EXISTS users;
      `);
      console.log("Finished dropping tables!")
    } catch (error) {
      console.error("Error dropping tables!")
      throw error; // we pass the error up to the function that calls dropTables
    }
  }
  
  // this function should call a query which creates all tables for our database 
  async function createTables() {
    try {
      console.log("Starting to build tables...")
      await client.query(`
        CREATE TABLE users(
          id SERIAL PRIMARY KEY,
          username varchar(255) UNIQUE NOT NULL,
          password varchar(255) NOT NULL
        );
      `);
      console.log("Finished building tables!")
    } catch (error) {
      console.error("Error building tables!")
      throw error; // we pass the error up to the function that calls createTables
    }
  }

  async function createInitialUsers() {
    try {
      console.log("Starting to create users...");
  
      const albert = await createUser({ username: 'albert', password: 'bertie99' });
      // const albertTwo = await createUser({ username: 'albert', password: 'imposter_albert' });
      const sandra = await createUser({ username: 'sandra', password: '2sandy4me' });
      const glamgal = await createUser({ username: 'glamgal', password: 'soglam' });

      console.log(albert);
      console.log(sandra);
      console.log(glamgal);
      // const albertTwo = await createUser({ username: 'albert', password: 'imposter_albert' });
      // console.log(albertTwo)
      console.log("Finished creating users!");
    } catch(error) {
      console.error("Error creating users!");
      throw error;
    }
  }
  
  async function rebuildDB() {
    try {
      client.connect();
  
      await dropTables();
      await createTables();
      await createInitialUsers();
    } catch (error) {
      // console.error(error)
      throw error;
    }
  }

  async function testDB() {
    try {
      // client.connect();
      console.log("Starting to test database...")
  
      const users = await getAllUsers();
      console.log("getAllUsers:", users);
      console.log("Finished database tests!")
    } catch (error) {
      console.error("Error testing database!");
      throw error;
    // } finally {
    //   client.end();
    }
  }
  
  rebuildDB()
    .then(testDB)
    .catch(console.error)
    .finally(() => client.end());