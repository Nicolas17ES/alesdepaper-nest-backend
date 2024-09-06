import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv'; // Import dotenv to load env variables
import entities from '../src/entities';

// Load the environment variables manually
dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10), // Convert the port from string to number
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: entities,
    migrations: ['dist/db/migrations/*.js'],
    synchronize: true,  // Optional, synchronize the database schema automatically
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;