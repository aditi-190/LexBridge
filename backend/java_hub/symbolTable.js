// Symbol table storing rich info objects per symbol, e.g.
// { category: "function", returnType: "void", params: [...] }
// or { category: "variable", dataType: "int" }
//
// FIX: the previous version's define(name, type, value) took three
// separate positional arguments and wrapped them in a Symbol class with
// only .name/.type/.value fields. semanticAnalyzer.js, however, calls
// define(name, { category, dataType/returnType, params, ... }) — a single
// info object. Under the old signature that whole object landed in the
// unused "type" slot, so symbol.category was always undefined and every
// `symbol.category !== "function"` check spuriously failed — even for
// correctly-registered builtins like System.out.println.
class SymbolTable {
    constructor(parent = null) {
        this.symbols = new Map();
        this.parent = parent; // enclosing scope, for nested blocks/functions
    }

    /**
     * Declares a new symbol in THIS scope only.
     * @param {string} name
     * @param {object} info - e.g. { category: "variable", dataType: "int" }
     * @returns {boolean} false if already declared in this scope (redeclaration)
     */
    define(name, info = {}) {
        if (this.symbols.has(name)) {
            return false;
        }
        this.symbols.set(name, info);
        return true;
    }

    /** Looks up a symbol in this scope, then walks up parent scopes. */
    lookup(name) {
        if (this.symbols.has(name)) {
            return this.symbols.get(name);
        }
        if (this.parent) {
            return this.parent.lookup(name);
        }
        return null;
    }

    /** Looks up a symbol ONLY in this exact scope (no walking up). */
    lookupLocal(name) {
        return this.symbols.get(name) || null;
    }

    /** Flat snapshot of this scope's symbols, for debugging/display. */
    toObject() {
        const obj = {};
        for (const [key, value] of this.symbols.entries()) {
            obj[key] = value;
        }
        return obj;
    }
}

module.exports = SymbolTable;