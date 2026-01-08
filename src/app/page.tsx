import { Suspense } from "react";
import { getSymbolsQuery } from "../lib/APICalls";
import { SymbolCardSHIMMER } from "../components/SymbolCard";
import SymbolCardsContainer from "../components/SymbolCardsContainer";
import DBFavorites from "../lib/DataBase";



export default function Page() {


  DBFavorites.deleteAllFavorites();
  ["NVDA",
    "MSFT",
    "AAPL",
    "GOOGL",
    "AMZN",
    "META",
    "AVGO",
    "TSM",
    "TSLA",
    "ORCL",
    "ASML",
    "CSCO",
    "AMD",
    "INTC",
    "TXN"].forEach((symbol: string) => {
      DBFavorites.addToFavorites(symbol);
    });
  const home_page_symbols: Array<string> = DBFavorites.getFavorites();

  const symbols_api_query = getSymbolsQuery(home_page_symbols);

  return (
    <div className="flex flex-col">
      <div className="flex flex-col ml-10 mr-10 mt-5 mb-10 border-2 border-black">
        <label htmlFor="Search Bar">Look for the Symbol missing</label>
        <input className="mr-5 ml-5" type="text" name="Search Bar" id="search_bar" />
      </div>


      <div className="mt-3 text-2xl text-center">Click on a symbol for more information</div>
      <div className="flex flex-wrap p-2 items-center justify-center">
        <Suspense fallback={Array.from({ length: home_page_symbols.length }).map((_, i) => <SymbolCardSHIMMER key={i} />)}>
          <SymbolCardsContainer symbol_promise={symbols_api_query} />
        </Suspense>
      </div>
    </div>
  );
}
