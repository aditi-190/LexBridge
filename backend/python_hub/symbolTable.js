class SymbolTable {
    constructor(parent = null) {
        this.symbols = new Map();
        this.parent = parent;
    }

    define(name, info) {
        if (this.symbols.has(name)) {
            return false; // already declared in this scope
        }
        this.symbols.set(name, info);
        return true;
    }

    lookup(name) {
        if (this.symbols.has(name)) {
            return this.symbols.get(name);
        }
        if (this.parent !== null) {
            return this.parent.lookup(name);
        }
        return null;
    }

    lookupLocal(name) {
        return this.symbols.get(name) || null;
    }

    toObject() {
        const symbolsObj = {};
        for (const [name, info] of this.symbols.entries()) {
            symbolsObj[name] = info;
        }
        return {
            symbols: symbolsObj,
            parent: this.parent ? this.parent.toObject() : null
        };
    }
}

module.exports = SymbolTable;