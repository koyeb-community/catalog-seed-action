const fs = require("fs").promises;
const yamlfm = require("yaml-front-matter");
const yaml = require("js-yaml");
const moment = require("moment");
const path = require("path");

const convertMarkdownToJson = (content) => {
    const options = {
        width: 0,
        content: true,
    };

    const _metadata = yamlfm.loadFront([content]);

    if (options.width) {
        // Max of WIDTH chars snapped to word boundaries, trim whitespace
        const truncateOptions = {
            length: width,
            separator: /\s/,
            omission: " …",
        };
        _metadata.preview = truncate(
            _metadata["__content"].trim(),
            truncateOptions
        );
    }

    if (typeof content != "undefined") {
        _metadata["content"] = _metadata["__content"];
    }

    delete _metadata["__content"];

    if (_metadata.date) {
        _metadata.iso8601Date = moment(_metadata.date).format();
    }

    return {
        ..._metadata,
    };
};

const makeCatalogFunction = async (repoPath, repoName, repoUrl, dockerOrg, version) => {
    const readmeMetadata = convertMarkdownToJson(await fs.readFile(path.join(repoPath, "README.md")));
    const tmplYaml = yaml.load(await fs.readFile(path.join(repoPath, "template.yaml")));
    const name = repoName.replace("/", "-");
    return Object.assign(
        {},
        {
            name: name,
            display_name: readmeMetadata.display_name,
            short_description: readmeMetadata.short_description,
            description: readmeMetadata.content,
            status: readmeMetadata.status,
            version: version.replace("v", ""),
            tags: readmeMetadata.tags ? readmeMetadata.tags.split(",") : [],
            icon: readmeMetadata.icon,
            website: repoUrl,
            parameters: readmeMetadata.parameters,
            template: readmeMetadata.template,
            image: readmeMetadata.image || `${dockerOrg}/${repoName}:${version}`,
        },
        tmplYaml
    );
};

module.exports = {makeCatalogFunction}
