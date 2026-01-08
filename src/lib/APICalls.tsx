import "server-only";

async function validateAPICall(url: string): Promise<apiCall> {
    try {
        // Using force-cache helps for request to not be duplicated, this is at
        // fetch level maybe could implement own cache of the actual sanitized data

        const response = await fetch(url, { cache: "force-cache" });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();

        if (data["Note"]) {
            // Invalid API call
            // Here I need to limit since its the limit what is causing it (or pay to get more calls)
            throw new Error(`API info message: ${data["Note"]}`);
        }

        if (data["Information"]) {
            // Invalid API call
            // Here I need to limit since its the limit what is causing it
            throw new Error(`API info message: ${data["Information"]}`);
        }

        return {
            is_valid: true,
            data: data,
        }
    } catch (error: any) {
        return {

            is_valid: false,
            data: null,
        };
    }
}



async function getSymbolQuery(symbol: string): Promise<symbol_simple_query> {

    var simple_symbol_api_response: apiCall = await validateAPICall(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`);

    if (!simple_symbol_api_response.is_valid) {
        return {
            symbol: "API_LIMIT",
            open: 302.5,
            high: 304.31,
            low: 296.3450,
            price: 296.7300,
            change: -5.74,
            change_percent: -1.8977,
        };

    };

    return {
        symbol: simple_symbol_api_response.data["Global Quote"]["01. symbol"] ?? "NA",
        open: Number(simple_symbol_api_response.data["Global Quote"]["02. open"]) ?? 0,
        high: Number(simple_symbol_api_response.data["Global Quote"]["03. high"]) ?? 0,
        low: Number(simple_symbol_api_response.data["Global Quote"]["04. low"]) ?? 0,
        price: Number(simple_symbol_api_response.data["Global Quote"]["05. price"]) ?? 0,
        change: Number(simple_symbol_api_response.data["Global Quote"]["09. change"]) ?? 0,
        change_percent: parseFloat(simple_symbol_api_response.data["Global Quote"]["10. change percent"].replace("%", "")),
    };

}

export async function getSymbolsQuery(symbols: Array<string>): Promise<Array<symbol_simple_query>> {

    const resp_symbols: Array<symbol_simple_query> = await Promise.all(
        symbols.map(async (symbol: string) => {
            return getSymbolQuery(symbol);
        })
    );

    var sanitized_symbols: Array<symbol_simple_query> = new Array<symbol_simple_query>();

    resp_symbols.forEach((symbol: symbol_simple_query) => {
        if (symbol.symbol != "API_LIMIT") {
            sanitized_symbols.push(symbol);
        }
    })

    return sanitized_symbols;
}

function parseDaySeries(raw: any): days_series {
    const meta = raw["Meta Data"];
    const series = raw["Time Series (Daily)"];

    const parsed_series: days_series["time_series_daily"] = {};

    for (const date in series) {
        const day = series[date];
        parsed_series[date] = {
            open: Number(day["1. open"] ?? 0),
            high: Number(day["2. high"] ?? 0),
            low: Number(day["3. low"] ?? 0),
            close: Number(day["4. close"] ?? 0),
            volume: Number(day["5. volume"] ?? 0),
        };
    }

    return {
        meta_data: {
            information: meta["1. Information"] ?? "NA",
            symbol: meta["2. Symbol"] ?? "NA",
            last_refreshed: meta["3. Last Refreshed"] ?? "NA",
            output_size: meta["4. Output Size"] ?? "NA",
            time_zone: meta["5. Time Zone"] ?? "NA",
        },
        time_series_daily: parsed_series,
    };
}

export async function getSymbolInfo(symbol: string): Promise<symbol_complex_query> {

    var symbol_api_response: apiCall = await validateAPICall(`https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`);

    var day_series_api_response: apiCall = await validateAPICall(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${process.env.NEXT_PUBLIC_API_KEY}`);


    if (!symbol_api_response.is_valid || !day_series_api_response.is_valid) {
        //We get the demo IBM response
        symbol_api_response = await validateAPICall("https://www.alphavantage.co/query?function=OVERVIEW&symbol=IBM&apikey=demo")
        day_series_api_response = await validateAPICall(
            "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=demo"
        );
    };

    return {
        symbol: symbol_api_response.data["Symbol"] ?? "NA",
        asset_type: symbol_api_response.data["AssetType"] ?? "NA",
        name: symbol_api_response.data["Name"] ?? "NA",
        description: symbol_api_response.data["Description"] ?? "NA",
        exchange: symbol_api_response.data["Exchange"] ?? "NA",
        currency: symbol_api_response.data["Currency"] ?? "NA",
        country: symbol_api_response.data["Country"] ?? "NA",
        sector: symbol_api_response.data["Sector"] ?? "NA",
        industry: symbol_api_response.data["Industry"] ?? "NA",
        market_capitalization: Number(symbol_api_response.data["MarketCapitalization"] ?? 0),
        last_data: await getSymbolQuery(symbol),
        day_series: parseDaySeries(day_series_api_response.data)
    };

}
