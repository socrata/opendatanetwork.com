
class Sources {
    constructor(sources) {
        this.sources = sources;
    }

    forRegions(regions) {
        const selectedTypes = new Set(regions.map(region => region.type));

        return this.sources.filter(source => {
            const sourceTypes = new Set(source.regions);
            return Sources.intersection(sourceTypes, selectedTypes).size > 0;
        });
    }

    static intersection(a, b) {
        return new Set([...a].filter(x => b.has(x)));
    }
}

