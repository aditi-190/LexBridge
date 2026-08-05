class Symbol {
  constructor(name, type, value = null) {
    this.name = name;
    this.type = type;
    this.value = value;
  }
}

class SymbolTable {
  constructor(parent = null) {
    this.symbols = new Map();
    this.parent = parent; 
  }

  define(name, type = "UNKNOWN", value = null) {
    const symbol = new Symbol(name, type, value);
    this.symbols.set(name, symbol);
    return symbol;
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
}

module.exports = SymbolTable;