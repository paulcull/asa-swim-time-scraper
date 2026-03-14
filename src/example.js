'use strict';

const { getTimes } = require('./index');

async function main() {
    const asaNumber = '1168208';
    const swims = await getTimes(asaNumber);
    console.log(JSON.stringify(swims, null, 2));
}

main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
});
