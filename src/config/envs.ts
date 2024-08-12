import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;

    NATS_SERVERS: string[];

    // PRODUCTS_MICROSERVICES_HOST: string;
    // PRODUCTS_MICROSERVICES_PORT: number;

}

const envsSchema = joi.object({
    PORT: joi.number().required(),

    NATS_SERVERS: joi.array().items(joi.string()).required(),
    // PRODUCTS_MICROSERVICES_HOST: joi.string().required(),
    // PRODUCTS_MICROSERVICES_PORT: joi.number().required(),


})
    .unknown(true);

const { error, value } = envsSchema.validate({
    ...process.env,
    NATS_SERVERS: process.env.NATS_SERVERS?.split(',')
});

if (error) {
    throw new Error(`Config validation error: ${error.message}`)
}

const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,

    natsServers: envVars.NATS_SERVERS
    // productMicroserviceHost: envVars.PRODUCTS_MICROSERVICES_HOST,
    // productMicroservicePort: envVars.PRODUCTS_MICROSERVICES_PORT,

}


