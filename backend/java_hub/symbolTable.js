class SymbolTable {
    constructor(parent = null) {
        this.symbols = new Map(); 
        this.parent = parent;    
    }

    define(name, symbolInfo) {
        if (this.symbols.has(name)) {
            return false; 
        }
        this.symbols.set(name, symbolInfo);
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