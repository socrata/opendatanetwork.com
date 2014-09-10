var pg = require('pg').native, 
    connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/census', 
    client, 
    query;

client = new pg.Client(connectionString);
client.connect();

query = client.query(
    "CREATE TABLE documents (portal_id bigserial primary key, portal_title varchar(255), portal_url varchar(255), housing smallint, restaurant_inspections smallint, transit smallint, health smallint, crime smallint, permits smallint);" +
    "INSERT INTO documents (portal_title, portal_url, housing, restaurant_inspections, transit, health, crime, permits) VALUES ('Australian Capital Territory', 'https://www.data.act.gov.au', 0, 0, 0, 0, 0, 0);"
    );
query.on('end', function() { client.end(); });