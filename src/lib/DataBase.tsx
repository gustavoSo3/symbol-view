import "server-only";

class Database {

    // Saving Favorites on a local array of strings (symbols) 
    // TODO:: Implement SQL database, or remote database (per user favorites)
    private favorites: Array<string>;

    constructor() {
        this.favorites = new Array<string>();
    };

    getFavorites(): Array<string> {
        return this.favorites;
    };

    addToFavorites(symbol: string): Array<string> {
        const upper_symbol = symbol.toUpperCase();
        const symbol_index = this.favorites.indexOf(upper_symbol);
        if (symbol_index > -1) {
            console.log("Symbol is in favorites");
        } else {
            this.favorites.push(upper_symbol);
        }

        return this.favorites;
    }

    removeFromFavorites(symbol: string): Array<string> {
        const upper_symbol = symbol.toUpperCase();
        const symbol_index = this.favorites.indexOf(upper_symbol);
        if (symbol_index > -1) {
            this.favorites.splice(symbol_index, 1);
        } else {
            console.log("The symbol is not in favorites");
        }

        return this.favorites;
    }

    deleteAllFavorites() {
        this.favorites = new Array<string>;
    }

};

const DBFavorites = new Database();

export default DBFavorites;