// UI.js FILE CONTENTS: updating UI elements, handling user interactions, and displaying search results.

// Importing API Functions from our api.js file.
import { fetchSearchResults, fetchGeneDetails, fetchPopulationDetails } from "./api.js";
// fetchSearchResults(): Fetches search results, 
// fetchGeneDetails(): Fetches gene details & 
// fetchPopulationDetails(): Fetches population details.

// Load search results from session storage. Event listener waits for the page to load (DOMContentLoaded event).
document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.getElementById("resultsTableBody");
    if (!tableBody) return;
    // Below retrieves stored search results from sessionStorage.
    const storedResults = sessionStorage.getItem("searchResults");
    if (storedResults) {
        displayResults(JSON.parse(storedResults));  // Displays the results in the results table
    }
});

// Helper function to clean gene names - v.important for uniprot API call.
function cleanGeneName(geneName) {
    if (!geneName) return "";
    if (Array.isArray(geneName)) return geneName[0];
    // Handles gene names stored as arrays or JSON strings.
    if (typeof geneName === "string") {
        try {
            const parsed = JSON.parse(geneName);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];   // 0 index = first gene name only, should only be 1 anyway, but problem?
        } catch (e) {}
    }
    return geneName;    //Returns a clean, readable name for UI display & uniprot.
}

// Handles user search form submission
document.getElementById("searchForm")?.addEventListener("submit", async function (event) {
    event.preventDefault();
    const searchType = document.getElementById("searchType").value;
    let query;
    // Retrieves search input based on selected type (SNP, gene, or population).
    if (searchType === "snp") {
        query = document.getElementById("snpInput").value;
    } else if (searchType === "gene") {
        query = `["${document.getElementById("geneInput").value.trim()}"]`;
    } else if (searchType === "population") {
        query = document.getElementById("populationInput").value;
    }
    // Calls the fetchSearchResults() function to retrieve data.
    if (!query) return;
    const results = await fetchSearchResults(searchType, query);
    displayResults(results);
});

// Display search results (table formatting)
// Works to iterates over search results and populates the table dynamically
// Gene and population names are linked for further exploratio in other html pages.
function displayResults(results) {
    const tableBody = document.getElementById("resultsTableBody");
    if (!tableBody) return;
    tableBody.innerHTML =
        results.length === 0
            ? "<tr><td colspan='7'>No results found</td></tr>"
            : results
                  .map(
                      (result) => `
            <tr>
                <td>${result[0]}</td>
                <td>${result[1]}</td>
                <td>${result[2]}</td>
                <td>${result[3]}</td>
                <td><a href="/gene/${encodeURIComponent(cleanGeneName(result[4]))}">${cleanGeneName(result[4])}</a></td>
                <td>${result[5]}</td>
                <td><a href="/population/${encodeURIComponent(result[6])}">${result[6]}</a></td>
                <td>${result[7] || "N/A"}</td>
            </tr>`
                  )
                  .join("");
}

// Check if the page is for the SA population
const isSAPopulation = window.location.pathname.includes("/population/SA");

if (isSAPopulation) {
    document.addEventListener("DOMContentLoaded", async () => {
        console.log("DOM Loaded. Populating dropdowns...");

        const ihsChromosomeSelect = document.getElementById("ihsChromosomeSelect");
        const ihsSubpopSelect = document.getElementById("ihsSubpopSelect");
        const fstChromosomeSelect = document.getElementById("fstChromosomeSelect");

        if (!ihsChromosomeSelect || !ihsSubpopSelect || !fstChromosomeSelect) {
            console.error("Dropdown elements not found in DOM!");
            return;
        }

        console.log("Dropdown elements found. Fetching data...");

        await populateDropdown("/api/chromosomes", ihsChromosomeSelect, "Chromosome");
        await populateDropdown("/api/chromosomes", fstChromosomeSelect, "Chromosome");
        await populateDropdown("/api/subpopulations", ihsSubpopSelect, "Sub-population");

        console.log("All dropdowns populated.");

        ihsChromosomeSelect.addEventListener("change", () => {
            console.log(`Chromosome selected: ${ihsChromosomeSelect.value}`);
            fetchAndDisplayIHS(1);
        });

        ihsSubpopSelect.addEventListener("change", () => {
            console.log(`Sub-population selected: ${ihsSubpopSelect.value}`);
            fetchAndDisplayIHS(1);
        });

        fstChromosomeSelect.addEventListener("change", () => {
            console.log(`FST Chromosome selected: ${fstChromosomeSelect.value}`);
            fetchAndDisplayFST(1);
        });
    });

    async function populateDropdown(apiUrl, dropdown, placeholderText) {
        try {
            console.log(`Fetching data from ${apiUrl}...`);

            const response = await fetch(apiUrl);
            const data = await response.json();

            console.log(`Data received from ${apiUrl}:`, data);

            if (!Array.isArray(data) || data.length === 0) {
                console.error(`Error: No valid data received from ${apiUrl}`);
                return;
            }

            dropdown.innerHTML = `<option value="">-- Select ${placeholderText} --</option>`;
            data.forEach((value) => {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = `${placeholderText} ${value}`;
                dropdown.appendChild(option);
            });

            console.log(`Dropdown ${placeholderText} populated successfully.`);

        } catch (error) {
            console.error(`Error fetching ${placeholderText} data from ${apiUrl}:`, error);
        }
    }

    async function fetchAndDisplayIHS(page = 1) {
        const chromosome = document.getElementById("ihsChromosomeSelect").value;
        const subPopulation = document.getElementById("ihsSubpopSelect").value;
        if (!chromosome) return;

        let url = `/api/ihs?chromosome=${chromosome}&limit=50&offset=${(page - 1) * 50}`;
        if (subPopulation) {
            url += `&sub_population=${subPopulation}`;
        }

        console.log("Fetching IHS data from:", url);

        try {
            const response = await fetch(url);
            const ihsData = await response.json();
            console.log("IHS Data:", ihsData);

            const ihsTableBody = document.getElementById("ihsTable").querySelector("tbody");

            if (!Array.isArray(ihsData) || ihsData.length === 0) {
                ihsTableBody.innerHTML = "<tr><td colspan='6'>No data available</td></tr>";
                return;
            }

            ihsTableBody.innerHTML = ihsData.map(({ Chromosome, Position, iHS_Score, Mean_iHS, Std_iHS, Population }) => `
                <tr>
                    <td>${Chromosome}</td>
                    <td>${Position}</td>
                    <td>${iHS_Score.toFixed(4)}</td>
                    <td>${Mean_iHS.toFixed(4)}</td>
                    <td>${Std_iHS.toFixed(4)}</td>
                    <td>${Population}</td>
                </tr>
            `).join("");

        } catch (error) {
            console.error("Error fetching IHS data:", error);
        }
    }

    async function fetchAndDisplayFST(page = 1) {
        const chromosome = document.getElementById("fstChromosomeSelect").value;
        if (!chromosome) return;

        let url = `/api/fst?chromosome=${chromosome}`;

        console.log("Fetching FST data from:", url);

        try {
            const response = await fetch(url);
            const fstData = await response.json();
            console.log("FST Data:", fstData);

            const fstTableBody = document.getElementById("fstTable").querySelector("tbody");

            if (!Array.isArray(fstData) || fstData.length === 0) {
                fstTableBody.innerHTML = "<tr><td colspan='4'>No data available</td></tr>";
                return;
            }

            fstTableBody.innerHTML = fstData.map(({ Chromosome, Position, SNP, FST }) => `
                <tr>
                    <td>${Chromosome}</td>
                    <td>${Position}</td>
                    <td>${SNP || "N/A"}</td>
                    <td>${FST.toFixed(4)}</td>
                </tr>
            `).join("");

        } catch (error) {
            console.error("Error fetching FST data:", error);
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const fstPopulationSelect = document.getElementById("fstPopulationCompare");

    if (fstPopulationSelect) {
        fstPopulationSelect.addEventListener("change", function () {
            const selectedComparison = this.value;
            fetchFstData(selectedComparison);
        });
    }
});

function fetchFstData(populationComparison) {
    fetch(`/get_fst_data?populationComparison=${populationComparison}`)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector("#fstTable tbody");
            tableBody.innerHTML = ""; // Clear table before inserting new data

            data.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row.Chromosome}</td>
                    <td>${row.Position}</td>
                    <td>${row.SNP}</td>
                    <td>${row.FST}</td>
                `;
                tableBody.appendChild(tr);
            });
        })
        .catch(error => console.error("Error fetching FST data:", error));
}

function getTableDataAsText(tableId) {
    console.log(`Extracting data from table: ${tableId}`);
    const table = document.getElementById(tableId);
    if (!table) {
        console.error(`Table with ID ${tableId} not found.`);
        return `No data available\n`;
    }
    let textData = "";
    const headers = table.closest("table").querySelectorAll("thead th");
    textData += Array.from(headers).map(th => th.innerText).join("\t") + "\n";

    const rows = table.querySelectorAll("tr");
    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        textData += Array.from(cells).map(td => td.innerText.trim()).join("\t") + "\n";
    });

    console.log(`Extracted data:\n`, textData);
    return textData;
}
function downloadTextFile(data, filename) {
    if (!data || data.trim() === "") {
        console.warn(`No data to download for ${filename}`);
        alert(`No data available for ${filename}`);
        return;
    }

    const blob = new Blob([data], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log(`File downloaded: ${filename}`);
}


// Back button handling
document.getElementById("backToResults")?.addEventListener("click", () => window.history.back());

document.getElementById("downloadResults")?.addEventListener("click", function () {
    console.log("Download button clicked. Preparing file...");
    
    // Get table data
    const resultsData = getTableDataAsText("resultsTableBody");

    // Download file
    downloadTextFile(resultsData, "search_results.txt");

    console.log("Download process completed.");
});
