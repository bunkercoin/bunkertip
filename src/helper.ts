// Import config
import config from "../config.js";

// Import packages
import * as http from "http";

export const rpc = (method: string, params: (number | string)[]): Promise<[string | undefined, any]> => {
    return new Promise((resolve) => {
        // Initialize the request
        const request = http.request(
            {
                hostname: config.rpc.hostname,
                port: config.rpc.port,
                path: `/`,
                method: `POST`,
                headers: {
                    "Content-Type": `application/json`,
                    Authorization: `Basic ${Buffer.from(
                        `${config.rpc.username}:${config.rpc.password}`,
                        `utf8`,
                    ).toString(`base64`)}`,
                },
            },
            (response) => {
                let data = ``;
                response.setEncoding(`utf8`);

                response.on(`data`, (chunk) => {
                    data += chunk;
                });

                response.on(`end`, () => {
                    const parsedJSON = JSON.parse(data);
                    if (!parsedJSON || !parsedJSON[`id`] || parsedJSON[`error`]) {
                        resolve([JSON.stringify(parsedJSON[`error`]), {}]);
                    } else {
                        resolve([undefined, parsedJSON[`result`]]);
                    }
                });
            },
        );

        // Catch HTTP errors
        request.on(`error`, (error) => {
            resolve([error.message, {}]);
        });

        // Write the body
        request.write(
            JSON.stringify({
                jsonrpc: `1.0`,
                id: `bkc-tipbot`,
                method: method,
                params: params,
            }),
        );
        request.end();
    });
};
