async function RetrieveAllPaginatedData(BaseURL, pageSize=250) {
    let result = [];
    let retrievedData;
    let pageNumber = 0;
    do {
        const requestURL = generateURL(BaseURL, pageNumber, pageSize);
        retrievedData = await fetch(requestURL)
            .then(response => { return response.json(); });
        result = result.concat(retrievedData.data);
        pageNumber += 1;
    } while (pageNumber < retrievedData.paging_info.numberOfPages);
    return result;
}

async function RetrieveOnePage(BaseURL, pageSize, pageNumber) {
    let result = [];
    let retrievedData;
    const requestURL = generateURL(BaseURL, pageNumber, pageSize);
    retrievedData = await fetch(requestURL)
        .then(response => { return response.json(); });
    result = result.concat(retrievedData.data);
    return result;
}

async function RetrieveNonPaginatedData(BaseURL){
    let retrievedData = await fetch(BaseURL)
        .then(response => { return response.json(); });
    return retrievedData;
}

export { RetrieveAllPaginatedData , RetrieveOnePage, RetrieveNonPaginatedData};

function generateURL(BaseURL, pageNumber, pageSize = 250) {
    let requestByPage;
    const pages = "page=" + pageNumber;
    if (BaseURL.includes("?")) {
        requestByPage = BaseURL + "&" + pages;
    } else {
        requestByPage = BaseURL + "?" + pages;
    }
    const size = "itemsPerPage=" + pageSize;
    requestByPage = requestByPage + "&" + size;
    return requestByPage;
}

