const core = require('@actions/core');
const fnSeed = require("./function.js");
const axios = require("axios");


const seed = async (apiUrl, loginPayload, payload) => {
    const resp = await axios.post(`${apiUrl}/v1/account/login`, loginPayload)
    const opts = {
        headers: {
            "Authorization": `bearer ${resp.data.token.id}`
        }
    }
    try {
        await axios.post(`${apiUrl}/v1/internal/storage/seed`, payload, opts)
    } finally {
        await axios.delete(`${apiUrl}/v1/account/logout`, opts)
    }
}

(async () => {
    try {
        const apiUrl = core.getInput('api_url')
        const loginPayload = {email: core.getInput('api_username'), password: core.getInput('api_password')}
        const org = core.getInput('organization')

        const repoName = process.env.GITHUB_REPOSITORY.split("/")[1]
        const repoUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
        const version = process.env.GITHUB_REF.replace("refs/tags/", "")
        if (!/^v[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) {
            core.info(`${version} is not a valid semver like v1.0.0, skipping seed`)
            return
        }
        const catalogDef = await fnSeed.makeCatalogFunction(".", repoName, repoUrl, org, version)
        core.info(`Seeding with: ${JSON.stringify(catalogDef, null, 2)}`)
        await seed(apiUrl, loginPayload, {"catalog_functions": [catalogDef]})
    } catch (error) {
        if (error.data) {
           core.error(`Request failed with data: ${error.data}`)
        }
        core.setFailed(error);
    }
})();
