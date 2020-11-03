const core = require('@actions/core');
const fnSeed = require("./function.js");

(async () => {
    try {
        const org = core.getInput('organization')

        const repoName = process.env.GITHUB_REPOSITORY.split("/")[1]
        const repoUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
        const version = process.env.GITHUB_REF.replace("refs/tags/", "")
        if (!/v[0-9]+\.[0-9]+\.[0.9]+/.test(version)) {
            core.setFailed(`${version} is not a valid semver like v1.0.0`)
            return
        }
        const res = fnSeed.makeCatalogFunction(".", repoName, repoUrl, org, "v1.0.0")
        core.info(JSON.stringify(res))
    } catch (error) {
        core.setFailed(error.message);
    }
})();
